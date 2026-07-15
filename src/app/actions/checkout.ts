"use server"

import type { User } from "@supabase/supabase-js"
import type { Stripe } from "stripe"
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

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due"] as const

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
    mode?: "login" | "register"
}) {
    const supabase = await createClient()
    const admin = createAdminClient()

    let user: User | null = null
    let profile: CheckoutBillingProfile | null = null
    const mode = data.mode || "register"

    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
        user = session.user
    } else {
        if (!data.password) {
            return { error: "Checkout.passwordRequired" }
        }

        if (mode === "login") {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (signInError) {
                return { error: "Checkout.invalidCredentials" }
            }

            user = signInData.user
        } else {
            if (!data.name?.trim()) {
                return { error: "Checkout.nameRequired" }
            }

            // Try to create new user, auto-confirming email
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
                if (
                    createError.status === 422 || 
                    createError.code === "user_already_exists" || 
                    createError.message.toLowerCase().includes("already registered") ||
                    createError.message.toLowerCase().includes("already exists")
                ) {
                    return { error: "Checkout.accountAlreadyExists" }
                }
                return { error: createError.message }
            }

            user = newUserData.user

            // Wait a bit for the trigger to create the public.users record
            await new Promise(resolve => setTimeout(resolve, 500))

            // Sync new user to leads table and Brevo
            try {
                // 1. Get default funnel/step
                const { data: defaultFunnel } = await admin
                    .from("lead_funnels")
                    .select(`id, lead_funnel_steps ( id, "order", name )`)
                    .order("created_at", { ascending: true })
                    .limit(1)
                    .maybeSingle()

                const finalFunnelId = defaultFunnel?.id || null
                let finalStepId = null
                if (defaultFunnel && defaultFunnel.lead_funnel_steps) {
                    const steps = (defaultFunnel.lead_funnel_steps as { id: string; order: number; name: string }[]) || []
                    const newStep = steps.find((s) => s.name?.toLowerCase() === 'new')
                    finalStepId = newStep?.id || steps.sort((a, b) => (a.order || 0) - (b.order || 0))[0]?.id || null
                }

                // 2. Check if lead already exists
                const { data: existingLeads } = await admin
                    .from("leads")
                    .select("*")
                    .eq("email", data.email)
                    .limit(1)
                
                const existingLead = existingLeads && existingLeads.length > 0 ? existingLeads[0] : null

                if (existingLead) {
                    await admin
                        .from("leads")
                        .update({
                            name: data.name.trim(),
                            source: 'checkout_registration',
                        })
                        .eq("id", existingLead.id)
                } else {
                    await admin
                        .from("leads")
                        .insert([{
                            name: data.name.trim(),
                            email: data.email,
                            source: 'checkout_registration',
                            funnel_id: finalFunnelId,
                            step_id: finalStepId,
                            metadata: {},
                        }])
                }

                // 3. Sync to Brevo (List ID 10 - free users/registered without active sub)
                // Using dynamic import to avoid issues if Brevo is not configured
                const { syncContactWithBrevo } = await import("@/lib/brevo")
                const listId = 10 
                await syncContactWithBrevo(data.email, data.name.trim(), [listId])
            } catch (syncError) {
                console.error("Failed to sync new user to leads/Brevo:", syncError)
                // We don't return an error here so checkout isn't blocked by a marketing sync failure
            }

            // Sign in to establish session
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (signInError) {
                console.error("Auto sign-in failed:", signInError)
            }
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

        const { data: incompleteSubscription } = await admin
            .from("subscriptions")
            .select("stripe_subscription_id, stripe_price_id")
            .eq("user_id", profile.id)
            .eq("status", "incomplete")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

        if (incompleteSubscription?.stripe_subscription_id) {
            try {
                if (incompleteSubscription.stripe_price_id === data.priceId) {
                    // Just return the existing client secret without updating to preserve any applied single-use promo codes
                    const subscription = await stripe.subscriptions.retrieve(incompleteSubscription.stripe_subscription_id, {
                        expand: ["latest_invoice.payment_intent", "latest_invoice.confirmation_secret"],
                    })
                    const latestInvoice = subscription.latest_invoice as Stripe.Invoice & {
                        payment_intent?: Stripe.PaymentIntent | null;
                        confirmation_secret?: { client_secret?: string } | null;
                    } | null
                    const clientSecret = latestInvoice?.payment_intent?.client_secret || latestInvoice?.confirmation_secret?.client_secret || null
                    
                    if (clientSecret) {
                        return {
                            success: true,
                            clientSecret,
                            subscriptionId: subscription.id,
                        }
                    }
                } else {
                    const result = await updateSubscription(profile, incompleteSubscription.stripe_subscription_id, {
                        priceId: data.priceId,
                        couponId: data.couponId,
                        promotionCode: data.promotionCode,
                    })

                    if (result.paymentSheet?.clientSecret) {
                        return {
                            success: true,
                            clientSecret: result.paymentSheet.clientSecret,
                            subscriptionId: result.subscriptionId,
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to update incomplete subscription, creating a new one.", err)
            }
        }

        const result = await createSubscriptionPaymentSheet(profile, {
            priceId: data.priceId,
            couponId: data.couponId,
            promotionCode: data.promotionCode,
        })

        if (!result.clientSecret && (result.status === "active" || result.status === "trialing")) {
            return {
                success: true,
                clientSecret: null,
                subscriptionId: result.subscriptionId,
            }
        }

        return { success: true, clientSecret: result.clientSecret, subscriptionId: result.subscriptionId }
    } catch (error) {
        console.error("Subscription creation error:", error)
        
        let errorMessage = "Checkout.failedToCreateSubscription"
        if (error instanceof Error && error.message) {
            if (error.message.includes("promotion code") || error.message.includes("coupon")) {
                errorMessage = "Checkout.invalidPromotionCode"
            } else {
                errorMessage = error.message
            }
        }
        
        return {
            error: errorMessage,
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
            ? await stripe.coupons.retrieve(promotion.promotion.coupon, { expand: ["applies_to"] })
            : promotion.promotion.coupon

    if (!coupon || !coupon.valid) {
        return { valid: false as const, reason: "expired" as const }
    }

    const subtotalAmount = price.unit_amount ?? 0

    if (
        coupon.applies_to?.products &&
        !coupon.applies_to.products.includes(
            typeof price.product === "string" ? price.product : price.product.id
        )
    ) {
        return { 
            valid: false as const, 
            reason: "not_applicable" as const,
            applicableProducts: coupon.applies_to.products
        }
    }

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
