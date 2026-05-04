import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe/client"

const subscriptionStatuses = new Set([
    "active",
    "canceled",
    "incomplete",
    "incomplete_expired",
    "past_due",
    "paused",
    "trialing",
    "unpaid",
])

type BillingProfile = {
    id: string
    email: string
    display_name: string | null
    phone: string | null
    stripe_customer_id: string | null
}

type SubscriptionRequest = {
    priceId: string
    quantity?: number
    promotionCode?: string
    couponId?: string
}

type SubscriptionUpdateRequest = {
    priceId?: string
    quantity?: number
    cancelAtPeriodEnd?: boolean
    promotionCode?: string
    couponId?: string
}

type EmbeddedCheckoutRequest = {
    priceId: string
    quantity?: number
    promotionCode?: string
    couponId?: string
    returnUrl?: string
}

type OneTimePaymentRequest = {
    amount: number
    currency: string
    description?: string
    saveForFutureUse?: boolean
    metadata?: Record<string, string>
}

export class BillingError extends Error {
    status: number

    constructor(message: string, status = 400) {
        super(message)
        this.name = "BillingError"
        this.status = status
    }
}

const customerSessionComponents: Stripe.CustomerSessionCreateParams.Components = {
    customer_sheet: {
        enabled: true,
        features: {
            payment_method_allow_redisplay_filters: ["always", "limited", "unspecified"],
            payment_method_remove: "enabled",
        },
    },
    mobile_payment_element: {
        enabled: true,
        features: {
            payment_method_allow_redisplay_filters: ["always", "limited", "unspecified"],
            payment_method_redisplay: "enabled",
            payment_method_remove: "enabled",
            payment_method_save: "enabled",
        },
    },
}

function getAppUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

function getPublishableKey() {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null
}

function toJson<T>(value: T) {
    return JSON.parse(JSON.stringify(value ?? null)) as T
}

function toIsoFromUnix(timestamp?: number | null) {
    if (!timestamp) {
        return null
    }
    return new Date(timestamp * 1000).toISOString()
}

function getSubscriptionStatus(status: string) {
    return subscriptionStatuses.has(status) ? status : "incomplete"
}

async function persistCustomerReference(profile: BillingProfile, stripeCustomer: Stripe.Customer) {
    const supabase = createAdminClient()
    const defaultPaymentMethodId =
        typeof stripeCustomer.invoice_settings.default_payment_method === "string"
            ? stripeCustomer.invoice_settings.default_payment_method
            : stripeCustomer.invoice_settings.default_payment_method?.id ?? null

    await supabase
        .from("users")
        .update({
            stripe_customer_id: stripeCustomer.id,
            stripe_customer_created_at: new Date(stripeCustomer.created * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

    await supabase
        .from("billing_customers")
        .upsert({
            user_id: profile.id,
            stripe_customer_id: stripeCustomer.id,
            email: stripeCustomer.email,
            name: stripeCustomer.name,
            phone: stripeCustomer.phone,
            default_payment_method_id: defaultPaymentMethodId,
            invoice_settings: toJson(stripeCustomer.invoice_settings),
            metadata: toJson(stripeCustomer.metadata),
            raw: toJson(stripeCustomer),
            updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_customer_id" })
}

export async function ensureStripeCustomer(profile: BillingProfile) {
    if (profile.stripe_customer_id) {
        try {
            const existing = await stripe.customers.retrieve(profile.stripe_customer_id)
            if (!("deleted" in existing && existing.deleted)) {
                await persistCustomerReference(profile, existing as Stripe.Customer)
                return existing as Stripe.Customer
            }
        } catch {
            // Create a fresh customer if the stored reference is stale.
        }
    }

    const created = await stripe.customers.create({
        email: profile.email,
        name: profile.display_name || undefined,
        phone: profile.phone || undefined,
        metadata: {
            userId: profile.id,
            app: "vitaflix",
        },
    })

    await persistCustomerReference(profile, created)
    return created
}

export async function createMobileCustomerContext(profile: BillingProfile) {
    const customer = await ensureStripeCustomer(profile)

    const [customerSession, ephemeralKey] = await Promise.all([
        stripe.customerSessions.create({
            customer: customer.id,
            components: customerSessionComponents,
        }),
        stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: "2026-02-25.clover" }
        ),
    ])

    if (!ephemeralKey.secret) {
        throw new BillingError("Stripe did not return an ephemeral key secret.", 500)
    }

    return {
        customerId: customer.id,
        customerSessionClientSecret: customerSession.client_secret,
        customerSessionExpiresAt: customerSession.expires_at,
        customerEphemeralKeySecret: ephemeralKey.secret,
        publishableKey: getPublishableKey(),
    }
}

async function createPaymentSheetCustomerContext(profile: BillingProfile) {
    const customer = await ensureStripeCustomer(profile)
    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2026-02-25.clover" }
    )

    if (!ephemeralKey.secret) {
        throw new BillingError("Stripe did not return an ephemeral key secret.", 500)
    }

    return {
        customerId: customer.id,
        customerSessionClientSecret: "",
        customerSessionExpiresAt: null,
        customerEphemeralKeySecret: ephemeralKey.secret,
        publishableKey: getPublishableKey(),
    }
}

async function resolvePromotionCodeId(code: string) {
    const promotionCodes = await stripe.promotionCodes.list({
        code,
        active: true,
        limit: 1,
    })

    return promotionCodes.data[0]?.id ?? null
}

async function assertNoConflictingActiveSubscription(userId: string) {
    const supabase = createAdminClient()
    const { data: existing } = await supabase
        .from("subscriptions")
        .select("id, status, stripe_subscription_id")
        .eq("user_id", userId)
        .in("status", ["active", "trialing", "past_due", "incomplete"])

    if (existing && existing.length > 0) {
        throw new BillingError("An active or pending subscription already exists for this user.", 409)
    }
}

function getIdFromExpandable(
    value:
        | string
        | { id: string }
        | Stripe.Customer
        | Stripe.DeletedCustomer
        | Stripe.Product
        | Stripe.DeletedProduct
        | Stripe.Price
        | Stripe.PaymentMethod
        | Stripe.Invoice
        | null
        | undefined
) {
    if (!value) {
        return null
    }
    return typeof value === "string" ? value : value.id
}

async function getOwnedStripeSubscription(profile: BillingProfile, subscriptionId: string) {
    const customer = await ensureStripeCustomer(profile)
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data.price", "latest_invoice.confirmation_secret"],
    })
    const stripeCustomerId = getIdFromExpandable(subscription.customer)

    if (stripeCustomerId !== customer.id) {
        throw new BillingError("Subscription does not belong to this customer.", 403)
    }

    return { subscription }
}

async function syncSubscriptionSnapshot(profile: BillingProfile, subscription: Stripe.Subscription) {
    const supabase = createAdminClient()
    const primaryItem = subscription.items.data[0]
    const now = new Date().toISOString()

    await supabase
        .from("subscriptions")
        .upsert({
            user_id: profile.id,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: getIdFromExpandable(subscription.customer),
            stripe_price_id: primaryItem?.price?.id ?? null,
            stripe_product_id: getIdFromExpandable(primaryItem?.price?.product ?? null),
            stripe_latest_invoice_id: getIdFromExpandable(subscription.latest_invoice),
            stripe_default_payment_method_id: getIdFromExpandable(subscription.default_payment_method),
            status: getSubscriptionStatus(subscription.status),
            current_period_start: toIsoFromUnix(
                (subscription as Stripe.Subscription & { current_period_start?: number | null }).current_period_start ?? null
            ),
            current_period_end: toIsoFromUnix(
                (subscription as Stripe.Subscription & { current_period_end?: number | null }).current_period_end ?? null
            ),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: toIsoFromUnix(subscription.canceled_at),
            trial_start: toIsoFromUnix(subscription.trial_start),
            trial_end: toIsoFromUnix(subscription.trial_end),
            metadata: toJson(subscription.metadata),
            updated_at: now,
        }, { onConflict: "stripe_subscription_id" })

    await supabase
        .from("users")
        .update({
            stripe_customer_id: getIdFromExpandable(subscription.customer),
            updated_at: now,
        })
        .eq("id", profile.id)
}

function getInvoiceConfirmationSecret(invoiceLike: {
    confirmation_secret?: { client_secret?: string | null } | null
}) {
    return invoiceLike.confirmation_secret?.client_secret ?? null
}

export async function createSubscriptionPaymentSheet(
    profile: BillingProfile,
    request: SubscriptionRequest
) {
    await assertNoConflictingActiveSubscription(profile.id)

    const customer = await ensureStripeCustomer(profile)
    const mobileContext = await createPaymentSheetCustomerContext(profile)

    const discounts: Stripe.SubscriptionCreateParams.Discount[] = []

    if (request.couponId) {
        discounts.push({ coupon: request.couponId })
    }

    if (request.promotionCode) {
        const promotionCodeId = await resolvePromotionCodeId(request.promotionCode)
        if (!promotionCodeId) {
            throw new BillingError("Invalid or inactive promotion code.", 400)
        }
        discounts.push({ promotion_code: promotionCodeId })
    }

    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
            {
                price: request.priceId,
                quantity: request.quantity ?? 1,
            },
        ],
        discounts: discounts.length > 0 ? discounts : undefined,
        payment_behavior: "default_incomplete",
        payment_settings: {
            save_default_payment_method: "on_subscription",
        },
        billing_mode: {
            type: "flexible",
        },
        expand: ["latest_invoice.confirmation_secret"],
        metadata: {
            userId: profile.id,
            app: "vitaflix",
            checkoutType: "flutter_subscription",
            priceId: request.priceId,
        },
    })

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null
    const clientSecret = latestInvoice ? getInvoiceConfirmationSecret(latestInvoice) : null

    if (!clientSecret) {
        throw new BillingError("Stripe did not return a subscription payment client secret.", 500)
    }

    return {
        ...mobileContext,
        subscriptionId: subscription.id,
        clientSecret,
    }
}

export async function updateSubscription(
    profile: BillingProfile,
    subscriptionId: string,
    request: SubscriptionUpdateRequest
) {
    let { subscription } = await getOwnedStripeSubscription(profile, subscriptionId)
    const primaryItem = subscription.items.data[0]
    let paymentSheet: {
        customerId: string
        customerSessionClientSecret: string
        customerSessionExpiresAt: number | null
        customerEphemeralKeySecret: string
        publishableKey: string | null
        clientSecret: string
        subscriptionId: string
    } | null = null

    if (!primaryItem) {
        throw new BillingError("Subscription has no updatable price item.", 400)
    }

    const currentPriceId = primaryItem.price?.id ?? null

    if (
        request.priceId &&
        request.priceId.trim().length > 0 &&
        request.priceId.trim() !== currentPriceId
    ) {
        const discounts: Stripe.SubscriptionUpdateParams.Discount[] = []

        if (request.couponId) {
            discounts.push({ coupon: request.couponId })
        }

        if (request.promotionCode) {
            const promotionCodeId = await resolvePromotionCodeId(request.promotionCode)
            if (!promotionCodeId) {
                throw new BillingError("Invalid or inactive promotion code.", 400)
            }
            discounts.push({ promotion_code: promotionCodeId })
        }

        subscription = await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: false,
            items: [
                {
                    id: primaryItem.id,
                    price: request.priceId.trim(),
                    quantity: request.quantity ?? primaryItem.quantity ?? 1,
                },
            ],
            discounts: discounts.length > 0 ? discounts : undefined,
            payment_behavior: "default_incomplete",
            proration_behavior: "always_invoice",
            expand: ["items.data.price", "latest_invoice.confirmation_secret"],
        })

        const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null
        const clientSecret = latestInvoice ? getInvoiceConfirmationSecret(latestInvoice) : null

        if (clientSecret) {
            const mobileContext = await createPaymentSheetCustomerContext(profile)
            paymentSheet = {
                ...mobileContext,
                subscriptionId: subscription.id,
                clientSecret,
            }
        }
    } else if (
        typeof request.cancelAtPeriodEnd === "boolean" &&
        request.cancelAtPeriodEnd !== subscription.cancel_at_period_end
    ) {
        subscription = await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: request.cancelAtPeriodEnd,
            expand: ["items.data.price", "latest_invoice"],
        })
    }

    await syncSubscriptionSnapshot(profile, subscription)

    return {
        subscriptionId: subscription.id,
        status: getSubscriptionStatus(subscription.status),
        priceId: subscription.items.data[0]?.price?.id ?? null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: toIsoFromUnix(
            (subscription as Stripe.Subscription & { current_period_end?: number | null }).current_period_end ?? null
        ),
        paymentSheet,
    }
}

export async function createEmbeddedSubscriptionCheckout(
    profile: BillingProfile,
    request: EmbeddedCheckoutRequest
) {
    await assertNoConflictingActiveSubscription(profile.id)

    const customer = await ensureStripeCustomer(profile)
    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = []

    if (request.couponId) {
        discounts.push({ coupon: request.couponId })
    }

    if (request.promotionCode) {
        const promotionCodeId = await resolvePromotionCodeId(request.promotionCode)
        if (!promotionCodeId) {
            throw new BillingError("Invalid or inactive promotion code.", 400)
        }
        discounts.push({ promotion_code: promotionCodeId })
    }

    const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "subscription",
        customer: customer.id,
        return_url: request.returnUrl || `${getAppUrl()}/billing/return`,
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        line_items: [
            {
                price: request.priceId,
                quantity: request.quantity ?? 1,
            },
        ],
        discounts: discounts.length > 0 ? discounts : undefined,
        payment_method_collection: "always",
        subscription_data: {
            billing_mode: {
                type: "flexible",
            },
            metadata: {
                userId: profile.id,
                app: "vitaflix",
                checkoutType: "embedded_subscription",
                priceId: request.priceId,
            },
        },
        metadata: {
            userId: profile.id,
            app: "vitaflix",
            checkoutType: "embedded_subscription",
            priceId: request.priceId,
        },
    })

    const sessionWithSecret = session as Stripe.Checkout.Session & {
        client_secret?: string | null
    }

    if (!sessionWithSecret.client_secret) {
        throw new BillingError("Stripe did not return an embedded checkout client secret.", 500)
    }

    return {
        sessionId: session.id,
        clientSecret: sessionWithSecret.client_secret,
        customerId: customer.id,
        publishableKey: getPublishableKey(),
    }
}

export async function createOneTimePaymentSheet(
    profile: BillingProfile,
    request: OneTimePaymentRequest
) {
    if (!Number.isInteger(request.amount) || request.amount <= 0) {
        throw new BillingError("Amount must be a positive integer in minor currency units.", 400)
    }

    const customer = await ensureStripeCustomer(profile)
    const mobileContext = await createPaymentSheetCustomerContext(profile)

    const paymentIntent = await stripe.paymentIntents.create({
        customer: customer.id,
        amount: request.amount,
        currency: request.currency.toLowerCase(),
        description: request.description,
        automatic_payment_methods: {
            enabled: true,
        },
        setup_future_usage: request.saveForFutureUse ? "off_session" : undefined,
        metadata: {
            userId: profile.id,
            app: "vitaflix",
            checkoutType: "flutter_one_time",
            ...(request.metadata ?? {}),
        },
    })

    if (!paymentIntent.client_secret) {
        throw new BillingError("Stripe did not return a payment intent client secret.", 500)
    }

    return {
        ...mobileContext,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
    }
}

export async function listBillingCatalog() {
    const [productsResponse, pricesResponse, couponsResponse] = await Promise.all([
        stripe.products.list({ active: true, limit: 100 }),
        stripe.prices.list({ active: true, limit: 100 }),
        stripe.coupons.list({ limit: 100 }),
    ])

    const products = productsResponse.data
        .filter(product => product.type === "service")
        .map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            metadata: product.metadata,
        }))

    const productIds = new Set(products.map(product => product.id))

    const prices = pricesResponse.data
        .filter(price => !!price.product && productIds.has(typeof price.product === "string" ? price.product : price.product.id))
        .map(price => ({
            id: price.id,
            productId: typeof price.product === "string" ? price.product : price.product.id,
            currency: price.currency,
            unitAmount: price.unit_amount,
            recurring: price.recurring
                ? {
                    interval: price.recurring.interval,
                    intervalCount: price.recurring.interval_count,
                    trialPeriodDays: price.recurring.trial_period_days,
                }
                : null,
            lookupKey: price.lookup_key,
            metadata: price.metadata,
        }))

    const coupons = couponsResponse.data.map(coupon => ({
        id: coupon.id,
        name: coupon.name,
        amountOff: coupon.amount_off,
        percentOff: coupon.percent_off,
        currency: coupon.currency,
        duration: coupon.duration,
        valid: coupon.valid,
        metadata: coupon.metadata,
    }))

    return { products, prices, coupons }
}

export async function getBillingSummary(profile: BillingProfile) {
    const supabase = createAdminClient()

    const [
        { data: customer },
        { data: paymentMethods },
        { data: subscriptions },
        { data: invoices },
        { data: transactions },
    ] = await Promise.all([
        supabase
            .from("billing_customers")
            .select("*")
            .eq("user_id", profile.id)
            .maybeSingle(),
        supabase
            .from("billing_payment_methods")
            .select("*")
            .eq("user_id", profile.id)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false }),
        supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false }),
        supabase
            .from("billing_invoices")
            .select("*")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false }),
        supabase
            .from("transactions")
            .select("*")
            .eq("user_id", profile.id)
            .not("stripe_payment_intent_id", "is", null)
            .order("created_at", { ascending: false }),
    ])

    return {
        customer,
        paymentMethods: paymentMethods ?? [],
        subscriptions: subscriptions ?? [],
        invoices: invoices ?? [],
        transactions: transactions ?? [],
    }
}

export async function createBillingPortal(profile: BillingProfile, returnUrl?: string) {
    const customer = await ensureStripeCustomer(profile)

    const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: returnUrl || `${getAppUrl()}/billing`,
    })

    return {
        customerId: customer.id,
        url: session.url,
    }
}

async function assertPaymentMethodBelongsToCustomer(paymentMethodId: string, stripeCustomerId: string) {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    const paymentMethodCustomerId =
        typeof paymentMethod.customer === "string"
            ? paymentMethod.customer
            : paymentMethod.customer?.id ?? null

    if (paymentMethodCustomerId !== stripeCustomerId) {
        throw new BillingError("Payment method does not belong to this customer.", 403)
    }

    return paymentMethod
}

export async function setDefaultPaymentMethod(profile: BillingProfile, paymentMethodId: string) {
    const customer = await ensureStripeCustomer(profile)
    await assertPaymentMethodBelongsToCustomer(paymentMethodId, customer.id)

    await stripe.customers.update(customer.id, {
        invoice_settings: {
            default_payment_method: paymentMethodId,
        },
    })

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    await supabase
        .from("billing_customers")
        .update({
            default_payment_method_id: paymentMethodId,
            updated_at: now,
        })
        .eq("stripe_customer_id", customer.id)

    await supabase
        .from("billing_payment_methods")
        .update({
            is_default: false,
            updated_at: now,
        })
        .eq("stripe_customer_id", customer.id)

    await supabase
        .from("billing_payment_methods")
        .update({
            is_default: true,
            updated_at: now,
        })
        .eq("stripe_payment_method_id", paymentMethodId)

    await supabase
        .from("subscriptions")
        .update({
            stripe_default_payment_method_id: paymentMethodId,
            updated_at: now,
        })
        .eq("user_id", profile.id)
        .in("status", ["active", "trialing", "past_due", "incomplete"])

    return {
        customerId: customer.id,
        defaultPaymentMethodId: paymentMethodId,
    }
}

export async function detachPaymentMethod(profile: BillingProfile, paymentMethodId: string) {
    const customer = await ensureStripeCustomer(profile)
    await assertPaymentMethodBelongsToCustomer(paymentMethodId, customer.id)

    const supabase = createAdminClient()
    const { data: paymentMethodRow } = await supabase
        .from("billing_payment_methods")
        .select("is_default")
        .eq("stripe_payment_method_id", paymentMethodId)
        .maybeSingle()

    if (paymentMethodRow?.is_default) {
        const { data: activeSubscriptions } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("user_id", profile.id)
            .in("status", ["active", "trialing", "past_due", "incomplete"])
            .limit(1)

        if (activeSubscriptions && activeSubscriptions.length > 0) {
            throw new BillingError(
                "Set another payment method as default before deleting the current default for an active subscription.",
                409
            )
        }
    }

    await stripe.paymentMethods.detach(paymentMethodId)

    const now = new Date().toISOString()

    await supabase
        .from("billing_payment_methods")
        .update({
            is_default: false,
            detached_at: now,
            updated_at: now,
        })
        .eq("stripe_payment_method_id", paymentMethodId)

    if (paymentMethodRow?.is_default) {
        await supabase
            .from("billing_customers")
            .update({
                default_payment_method_id: null,
                updated_at: now,
            })
            .eq("stripe_customer_id", customer.id)
    }

    return {
        deleted: true,
        paymentMethodId,
    }
}
