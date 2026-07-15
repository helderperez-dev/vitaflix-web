import Stripe from "stripe"
import { triggerAppEvent } from "@/app/actions/notifications"
import { getPostHogClient } from "@/lib/posthog-server"
import { createAdminClient } from "@/lib/supabase/admin"

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

type ResolvedUser = {
    userId: string | null
    subscriptionId: string | null
}

function toJson(value: unknown) {
    return JSON.parse(JSON.stringify(value ?? null))
}

function toIsoFromUnix(value?: number | null) {
    return typeof value === "number" ? new Date(value * 1000).toISOString() : null
}

function getIdFromExpandable(value: string | { id: string } | null | undefined) {
    if (!value) {
        return null
    }

    return typeof value === "string" ? value : value.id
}

function getSubscriptionStatus(status: string) {
    return subscriptionStatuses.has(status) ? status : "incomplete"
}

async function findUserByStripeCustomerId(stripeCustomerId: string) {
    const supabase = createAdminClient()

    const { data: billingCustomer } = await supabase
        .from("billing_customers")
        .select("user_id")
        .eq("stripe_customer_id", stripeCustomerId)
        .maybeSingle()

    if (billingCustomer?.user_id) {
        return billingCustomer.user_id as string
    }
    return null
}

async function resolveUser({
    metadataUserId,
    stripeCustomerId,
    email,
    stripeSubscriptionId,
}: {
    metadataUserId?: string | null
    stripeCustomerId?: string | null
    email?: string | null
    stripeSubscriptionId?: string | null
}): Promise<ResolvedUser> {
    const supabase = createAdminClient()

    if (metadataUserId) {
        return { userId: metadataUserId, subscriptionId: null }
    }

    if (stripeSubscriptionId) {
        const { data: subscription } = await supabase
            .from("subscriptions")
            .select("id, user_id")
            .eq("stripe_subscription_id", stripeSubscriptionId)
            .maybeSingle()

        if (subscription?.user_id) {
            return {
                userId: subscription.user_id as string,
                subscriptionId: subscription.id as string,
            }
        }
    }

    if (stripeCustomerId) {
        const userId = await findUserByStripeCustomerId(stripeCustomerId)
        if (userId) {
            return { userId, subscriptionId: null }
        }
    }

    if (email) {
        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle()

        if (user?.id) {
            return { userId: user.id as string, subscriptionId: null }
        }
    }

    return { userId: null, subscriptionId: null }
}

async function syncDefaultPaymentMethod(stripeCustomerId: string, defaultPaymentMethodId?: string | null) {
    const supabase = createAdminClient()

    await supabase
        .from("billing_payment_methods")
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq("stripe_customer_id", stripeCustomerId)

    if (defaultPaymentMethodId) {
        await supabase
            .from("billing_payment_methods")
            .update({ is_default: true, updated_at: new Date().toISOString() })
            .eq("stripe_payment_method_id", defaultPaymentMethodId)
    }
}

async function upsertCustomer(customer: Stripe.Customer | Stripe.DeletedCustomer) {
    const supabase = createAdminClient()

    if (customer.deleted) {
        await supabase
            .from("billing_customers")
            .delete()
            .eq("stripe_customer_id", customer.id)

        await supabase
            .from("billing_payment_methods")
            .update({
                detached_at: new Date().toISOString(),
                is_default: false,
                updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customer.id)

        return { userId: null, stripeCustomerId: customer.id }
    }

    const defaultPaymentMethodId = getIdFromExpandable(customer.invoice_settings.default_payment_method)
    const { userId } = await resolveUser({
        metadataUserId: customer.metadata.userId || null,
        stripeCustomerId: customer.id,
        email: customer.email,
    })

    await supabase
        .from("billing_customers")
        .upsert({
            user_id: userId,
            stripe_customer_id: customer.id,
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            default_payment_method_id: defaultPaymentMethodId,
            invoice_settings: toJson(customer.invoice_settings),
            metadata: toJson(customer.metadata),
            raw: toJson(customer),
            updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_customer_id" })

    await syncDefaultPaymentMethod(customer.id, defaultPaymentMethodId)

    return { userId, stripeCustomerId: customer.id }
}

async function upsertPaymentMethod(paymentMethod: Stripe.PaymentMethod) {
    const supabase = createAdminClient()
    const stripeCustomerId = getIdFromExpandable(paymentMethod.customer)
    let userId: string | null = null

    if (stripeCustomerId) {
        const resolved = await resolveUser({ stripeCustomerId })
        userId = resolved.userId
    }

    const { data: billingCustomer } = stripeCustomerId ? await supabase
        .from("billing_customers")
        .select("default_payment_method_id")
        .eq("stripe_customer_id", stripeCustomerId)
        .maybeSingle() : { data: null }

    await supabase
        .from("billing_payment_methods")
        .upsert({
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
            stripe_payment_method_id: paymentMethod.id,
            type: paymentMethod.type,
            is_default: billingCustomer?.default_payment_method_id === paymentMethod.id,
            allow_redisplay: paymentMethod.allow_redisplay ?? null,
            brand: paymentMethod.card?.brand ?? null,
            last4: paymentMethod.card?.last4 ?? null,
            exp_month: paymentMethod.card?.exp_month ?? null,
            exp_year: paymentMethod.card?.exp_year ?? null,
            fingerprint: paymentMethod.card?.fingerprint ?? null,
            country: paymentMethod.card?.country ?? null,
            funding: paymentMethod.card?.funding ?? null,
            wallet: paymentMethod.card?.wallet?.type ?? null,
            billing_name: paymentMethod.billing_details?.name ?? null,
            billing_email: paymentMethod.billing_details?.email ?? null,
            billing_phone: paymentMethod.billing_details?.phone ?? null,
            metadata: toJson(paymentMethod.metadata),
            card: toJson(paymentMethod.card),
            raw: toJson(paymentMethod),
            detached_at: null,
            updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_payment_method_id" })
}

async function markPaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
    const supabase = createAdminClient()

    await supabase
        .from("billing_payment_methods")
        .update({
            is_default: false,
            detached_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            raw: toJson(paymentMethod),
        })
        .eq("stripe_payment_method_id", paymentMethod.id)
}

async function upsertSubscription(subscription: Stripe.Subscription, eventType: Stripe.Event.Type) {
    const supabase = createAdminClient()
    const stripeCustomerId = getIdFromExpandable(subscription.customer)
    const defaultPaymentMethodId = getIdFromExpandable(subscription.default_payment_method)
    const primaryItem = subscription.items.data[0]
    const primaryPriceId = primaryItem?.price?.id ?? null
    const primaryProductId = getIdFromExpandable(primaryItem?.price?.product)

    const existingSubscription = await supabase
        .from("subscriptions")
        .select("id, user_id, status")
        .eq("stripe_subscription_id", subscription.id)
        .maybeSingle()

    const { userId } = await resolveUser({
        metadataUserId: subscription.metadata.userId || null,
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
    })

    const finalUserId = userId ?? (existingSubscription.data?.user_id as string | undefined) ?? null

    if (!finalUserId) {
        console.warn(`Unable to resolve user for Stripe subscription ${subscription.id}`)
        return
    }

    await supabase
        .from("subscriptions")
        .upsert({
            user_id: finalUserId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: stripeCustomerId,
            stripe_price_id: primaryPriceId,
            stripe_product_id: primaryProductId,
            stripe_latest_invoice_id: getIdFromExpandable(subscription.latest_invoice),
            stripe_default_payment_method_id: defaultPaymentMethodId,
            status: getSubscriptionStatus(subscription.status),
            current_period_start: toIsoFromUnix((subscription as Stripe.Subscription & { current_period_start?: number }).current_period_start ?? null),
            current_period_end: toIsoFromUnix((subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end ?? null),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: toIsoFromUnix(subscription.canceled_at),
            trial_start: toIsoFromUnix(subscription.trial_start),
            trial_end: toIsoFromUnix(subscription.trial_end),
            metadata: toJson(subscription.metadata),
            updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_subscription_id" })

    const previousStatus = existingSubscription.data?.status as string | undefined
    const posthog = getPostHogClient()

    if (subscription.status === "active" && (eventType === "customer.subscription.created" || previousStatus !== "active")) {
        await triggerAppEvent("subscription_activated", { userId: finalUserId })
        posthog.capture({
            distinctId: finalUserId,
            event: "subscription_activated",
            properties: {
                subscription_id: subscription.id,
                status: subscription.status,
                price_id: primaryPriceId,
                product_id: primaryProductId,
            },
        })

        // Sync with Brevo as an active client
        try {
            const { data: user } = await supabase
                .from("users")
                .select("email, display_name, full_name")
                .eq("id", finalUserId)
                .maybeSingle()

            if (user?.email) {
                const { syncContactWithBrevo } = await import("@/lib/brevo")
                const name = user.display_name || user.full_name || ""
                // Add to List 9 (Paid) and remove from 10 (Free) and 13 (Canceled)
                await syncContactWithBrevo(
                    user.email, 
                    name, 
                    [9], 
                    { CLIENT: true }, 
                    [10, 13]
                )
            }
        } catch (syncError) {
            console.error("Failed to sync active client to Brevo:", syncError)
        }
    }

    if (subscription.status === "canceled" && previousStatus !== "canceled") {
        await triggerAppEvent("subscription_cancelled", { userId: finalUserId })
        posthog.capture({
            distinctId: finalUserId,
            event: "subscription_cancelled",
            properties: {
                subscription_id: subscription.id,
                status: subscription.status,
            },
        })

        // Sync with Brevo as a canceled client
        try {
            const { data: user } = await supabase
                .from("users")
                .select("email, display_name, full_name")
                .eq("id", finalUserId)
                .maybeSingle()

            if (user?.email) {
                const { syncContactWithBrevo } = await import("@/lib/brevo")
                const name = user.display_name || user.full_name || ""
                // Add to List 13 (Canceled) and remove from 9 (Paid) and 10 (Free)
                await syncContactWithBrevo(
                    user.email, 
                    name, 
                    [13], 
                    { CLIENT: false }, 
                    [9, 10]
                )
            }
        } catch (syncError) {
            console.error("Failed to sync canceled client to Brevo:", syncError)
        }
    }
}

async function upsertInvoice(invoice: Stripe.Invoice) {
    const supabase = createAdminClient()
    const stripeCustomerId = getIdFromExpandable(invoice.customer)
    const invoiceLike = invoice as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null
        payment_intent?: string | Stripe.PaymentIntent | null
        charge?: string | null
        parent?: { subscription_details?: { metadata?: Record<string, string> } }
        subscription_details?: { metadata?: Record<string, string> }
        total_discount_amounts?: Array<{ amount: number; discount?: { coupon?: { id?: string } } }>
        status_transitions?: { paid_at?: number | null }
    }
    const stripeSubscriptionId = getIdFromExpandable(invoiceLike.subscription)
    const stripePaymentIntentId = getIdFromExpandable(invoiceLike.payment_intent)
    const stripeChargeId = getIdFromExpandable(invoiceLike.charge ?? null)

    const resolved = await resolveUser({
        metadataUserId:
            invoiceLike.parent?.subscription_details?.metadata?.userId
            ?? invoiceLike.subscription_details?.metadata?.userId
            ?? invoice.metadata?.userId
            ?? null,
        stripeCustomerId,
        stripeSubscriptionId,
        email: invoice.customer_email,
    })

    let subscriptionId = resolved.subscriptionId
    if (!subscriptionId && stripeSubscriptionId) {
        const { data: subscription } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("stripe_subscription_id", stripeSubscriptionId)
            .maybeSingle()
        subscriptionId = (subscription?.id as string | undefined) ?? null
    }

    if (!resolved.userId) {
        console.warn(`Unable to resolve user for Stripe invoice ${invoice.id}`)
        return { userId: null, invoiceId: null, subscriptionId }
    }

    const couponId = invoiceLike.total_discount_amounts?.[0]?.discount?.coupon?.id ?? null
    const discountTotal = (invoiceLike.total_discount_amounts ?? []).reduce((sum, entry) => sum + entry.amount, 0)

    const invoiceUpsert = await supabase
        .from("billing_invoices")
        .upsert({
            user_id: resolved.userId,
            subscription_id: subscriptionId,
            stripe_invoice_id: invoice.id,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_payment_intent_id: stripePaymentIntentId,
            stripe_charge_id: stripeChargeId,
            invoice_number: invoice.number,
            status: invoice.status ?? "draft",
            billing_reason: invoice.billing_reason ?? null,
            collection_method: invoice.collection_method ?? null,
            currency: invoice.currency,
            subtotal: invoice.subtotal ?? 0,
            total: invoice.total ?? 0,
            amount_due: invoice.amount_due ?? 0,
            amount_paid: invoice.amount_paid ?? 0,
            amount_remaining: invoice.amount_remaining ?? 0,
            discount_total: discountTotal,
            attempted: invoice.attempted ?? false,
            attempt_count: invoice.attempt_count ?? 0,
            hosted_invoice_url: invoice.hosted_invoice_url,
            invoice_pdf: invoice.invoice_pdf,
            period_start: toIsoFromUnix(invoice.period_start),
            period_end: toIsoFromUnix(invoice.period_end),
            due_date: toIsoFromUnix(invoice.due_date),
            paid_at: toIsoFromUnix(invoiceLike.status_transitions?.paid_at ?? null),
            stripe_coupon_id: couponId,
            discounts: toJson(invoiceLike.total_discount_amounts ?? []),
            lines: toJson(invoice.lines.data),
            metadata: toJson(invoice.metadata),
            raw: toJson(invoice),
            updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_invoice_id" })
        .select("id")
        .single()

    return {
        userId: resolved.userId,
        invoiceId: (invoiceUpsert.data?.id as string | undefined) ?? null,
        subscriptionId,
    }
}

async function upsertTransactionFromInvoice(invoice: Stripe.Invoice) {
    await upsertInvoice(invoice)
}

async function upsertTransactionFromPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
    const supabase = createAdminClient()
    const stripeCustomerId = getIdFromExpandable(paymentIntent.customer)
    const stripeInvoiceId = getIdFromExpandable((paymentIntent as Stripe.PaymentIntent & { invoice?: string | Stripe.Invoice | null }).invoice ?? null)
    const metadata = paymentIntent.metadata ?? {}

    const resolved = await resolveUser({
        metadataUserId: metadata.userId || null,
        stripeCustomerId,
    })

    let invoiceId: string | null = null
    let subscriptionId: string | null = null

    if (stripeInvoiceId) {
        const { data: invoice } = await supabase
            .from("billing_invoices")
            .select("id, subscription_id, user_id")
            .eq("stripe_invoice_id", stripeInvoiceId)
            .maybeSingle()

        if (invoice) {
            invoiceId = invoice.id as string
            subscriptionId = (invoice.subscription_id as string | null | undefined) ?? null
        }
    }

    const userId = resolved.userId
        ?? (stripeInvoiceId
            ? ((await supabase
                .from("billing_invoices")
                .select("user_id")
                .eq("stripe_invoice_id", stripeInvoiceId)
                .maybeSingle()).data?.user_id as string | undefined) ?? null
            : null)

    if (!userId) {
        console.warn(`Unable to resolve user for PaymentIntent ${paymentIntent.id}`)
        return
    }

    await supabase
        .from("transactions")
        .upsert({
            user_id: userId,
            subscription_id: subscriptionId,
            invoice_id: invoiceId,
            provider: "stripe",
            provider_transaction_id: paymentIntent.id,
            stripe_invoice_id: stripeInvoiceId,
            stripe_payment_intent_id: paymentIntent.id,
            stripe_charge_id: typeof paymentIntent.latest_charge === "string" ? paymentIntent.latest_charge : paymentIntent.latest_charge?.id ?? null,
            transaction_type: stripeInvoiceId ? "invoice" : "one_time",
            description: metadata.description || metadata.checkoutType || null,
            amount: paymentIntent.amount_received || paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            payment_method_type: paymentIntent.payment_method_types?.[0] ?? null,
            raw: toJson(paymentIntent),
        }, { onConflict: "provider_transaction_id" })
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const supabase = createAdminClient()
    const stripeCustomerId = getIdFromExpandable(session.customer)
    const userId = session.metadata?.userId ?? null

    if (stripeCustomerId && userId) {
        await supabase
            .from("billing_customers")
            .upsert({
                user_id: userId,
                stripe_customer_id: stripeCustomerId,
                email: session.customer_details?.email ?? null,
                name: session.customer_details?.name ?? null,
                metadata: toJson(session.metadata),
                raw: toJson(session),
                updated_at: new Date().toISOString(),
            }, { onConflict: "stripe_customer_id" })
    }
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
        case "customer.created":
        case "customer.updated":
        case "customer.deleted":
            await upsertCustomer(event.data.object as Stripe.Customer | Stripe.DeletedCustomer)
            break

        case "payment_method.attached":
        case "payment_method.automatically_updated":
            await upsertPaymentMethod(event.data.object as Stripe.PaymentMethod)
            break

        case "payment_method.detached":
            await markPaymentMethodDetached(event.data.object as Stripe.PaymentMethod)
            break

        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
            await upsertSubscription(event.data.object as Stripe.Subscription, event.type)
            break

        case "invoice.created":
        case "invoice.finalized":
        case "invoice.payment_succeeded":
        case "invoice.payment_failed":
        case "invoice.voided":
        case "invoice.marked_uncollectible":
            await upsertTransactionFromInvoice(event.data.object as Stripe.Invoice)
            break

        case "payment_intent.succeeded":
        case "payment_intent.payment_failed":
            await upsertTransactionFromPaymentIntent(event.data.object as Stripe.PaymentIntent)
            break

        case "checkout.session.completed":
            await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
            break

        default:
            console.log(`Unhandled Stripe event type: ${event.type}`)
    }
}
