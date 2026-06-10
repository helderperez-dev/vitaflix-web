"use server"

import type { User } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { createSubscriptionPaymentSheet, updateSubscription } from "@/lib/stripe/billing"
import { stripe } from "@/lib/stripe/client"

type CheckoutBillingProfile = {
    id: string
    email: string
    display_name: string | null
    phone: string | null
    stripe_customer_id: string | null
}

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due", "incomplete"] as const

function isMissingSchemaCacheRelationError(error: { code?: string } | null | undefined) {
    return error?.code === "PGRST205"
}

export async function checkoutRegisterAndSubscribe(data: {
    email: string
    password?: string
    name?: string
    priceId: string
    couponId?: string
    promotionCode?: string
}) {
    const supabase = await createClient()
    const admin = createAdminClient()

    let user: User | null = null
    let profile: CheckoutBillingProfile | null = null

    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
        user = session.user
    } else {
        if (!data.name?.trim()) {
            return { error: "Checkout.nameRequired" }
        }

        if (!data.password) {
            return { error: "Checkout.passwordRequired" }
        }

        // Check if user exists
        const { data: existingUsers } = await admin.auth.admin.listUsers()
        const existingUser = existingUsers.users.find((u) => u.email === data.email)

        if (existingUser) {
            return { error: "Checkout.accountAlreadyExists" }
        }

        // Create new user, auto-confirming email
        const { data: newUserData, error: createError } = await admin.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
            user_metadata: {
                name: data.name.trim(),
                full_name: data.name.trim(),
                display_name: data.name.trim(),
            }
        })

        if (createError) {
            return { error: createError.message }
        }

        user = newUserData.user

        // Wait a bit for the trigger to create the public.users record
        await new Promise(resolve => setTimeout(resolve, 500))

        // Sign in to establish session
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })

        if (signInError) {
            console.error("Auto sign-in failed:", signInError)
        }
    }

    // Get the profile
    const { data: profileData, error: profileError } = await admin
        .from("users")
        .select("id, email, display_name, phone")
        .eq("id", user.id)
        .maybeSingle()

    if (profileError || !profileData) {
        return { error: "Checkout.failedToRetrieveProfile" }
    }

    const { data: billingCustomer, error: billingCustomerError } = await admin
        .from("billing_customers")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle()

    if (billingCustomerError && !isMissingSchemaCacheRelationError(billingCustomerError)) {
        console.error("Checkout billing customer lookup error:", billingCustomerError)
    }

    profile = {
        id: profileData.id,
        email: profileData.email,
        display_name: profileData.display_name,
        phone: profileData.phone,
        stripe_customer_id: (billingCustomer?.stripe_customer_id as string | null | undefined) ?? null,
    }

    try {
        const { data: activeSubscription, error: activeSubscriptionError } = await admin
            .from("subscriptions")
            .select("stripe_subscription_id, stripe_price_id, status")
            .eq("user_id", profile.id)
            .in("status", [...ACTIVE_SUBSCRIPTION_STATUSES])
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

        if (activeSubscriptionError) {
            console.error("Checkout active subscription lookup error:", activeSubscriptionError)
            return { error: "Checkout.currentSubscriptionCheckError" }
        }

        if (activeSubscription?.stripe_subscription_id) {
            if (activeSubscription.stripe_price_id === data.priceId) {
                return { error: "Checkout.currentPlanAlreadyActive" }
            }

            const result = await updateSubscription(profile, activeSubscription.stripe_subscription_id, {
                priceId: data.priceId,
                couponId: data.couponId,
                promotionCode: data.promotionCode,
            })

            return {
                success: true,
                clientSecret: result.paymentSheet?.clientSecret ?? null,
                subscriptionId: result.subscriptionId,
            }
        }

        const result = await createSubscriptionPaymentSheet(profile, {
            priceId: data.priceId,
            couponId: data.couponId,
            promotionCode: data.promotionCode,
        })

        return { success: true, clientSecret: result.clientSecret, subscriptionId: result.subscriptionId }
    } catch (error) {
        console.error("Subscription creation error:", error)
        return {
            error: error instanceof Error && error.message ? error.message : "Checkout.failedToCreateSubscription",
        }
    }
}

export async function previewPromotionCode(data: {
    priceId: string
    promotionCode: string
}) {
    const code = data.promotionCode.trim()

    if (!code) {
        return { valid: false as const, reason: "required" as const }
    }

    const [price, promotionCodes] = await Promise.all([
        stripe.prices.retrieve(data.priceId),
        stripe.promotionCodes.list({
            code,
            active: true,
            limit: 1,
        }),
    ])

    const promotion = promotionCodes.data[0]

    if (!promotion) {
        return { valid: false as const, reason: "invalid" as const }
    }

    const coupon =
        typeof promotion.promotion.coupon === "string"
            ? await stripe.coupons.retrieve(promotion.promotion.coupon)
            : promotion.promotion.coupon

    if (!coupon || !coupon.valid) {
        return { valid: false as const, reason: "expired" as const }
    }

    const subtotalAmount = price.unit_amount ?? 0

    if (
        promotion.restrictions.minimum_amount &&
        promotion.restrictions.minimum_amount_currency === price.currency &&
        subtotalAmount < promotion.restrictions.minimum_amount
    ) {
        return { valid: false as const, reason: "minimum_amount" as const }
    }

    let discountAmount = 0

    if (coupon.amount_off != null) {
        if (coupon.currency && price.currency && coupon.currency !== price.currency) {
            return { valid: false as const, reason: "currency_mismatch" as const }
        }

        discountAmount = Math.min(coupon.amount_off, subtotalAmount)
    } else if (coupon.percent_off != null) {
        discountAmount = Math.min(
            Math.round(subtotalAmount * (coupon.percent_off / 100)),
            subtotalAmount
        )
    }

    return {
        valid: true as const,
        code: promotion.code ?? code,
        subtotalAmount,
        discountAmount,
        totalAmount: Math.max(subtotalAmount - discountAmount, 0),
        currency: price.currency,
        percentOff: coupon.percent_off ?? null,
        amountOff: coupon.amount_off ?? null,
    }
}
