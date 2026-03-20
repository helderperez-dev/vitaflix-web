import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { triggerAppEvent } from "@/app/actions/notifications"
import { getPostHogClient } from "@/lib/posthog-server"

// Initialize Stripe and Supabase clients
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2026-02-25.clover",
})

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    const body = await req.text()
    const sig = req.headers.get("stripe-signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: unknown) {
        const error = err as Error
        console.error(`Webhook signature verification failed: ${error.message}`)
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription
            const status = subscription.status

            console.log(`Subscription ${subscription.id} status changed to ${status}`)

            const userId = subscription.metadata.userId

            if (!userId) {
                console.warn(`No userId in metadata for subscription ${subscription.id}`)
                break
            }

            const { error: subError } = await supabase
                .from("subscriptions")
                .upsert({
                    user_id: userId,
                    stripe_subscription_id: subscription.id,
                    status: status,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                }, { onConflict: "stripe_subscription_id" })

            if (subError) {
                console.error("Error upserting subscription:", subError)
            }

            // Fire notification triggers based on subscription status
            const posthog = getPostHogClient()
            if (status === "active" && event.type === "customer.subscription.created") {
                await triggerAppEvent("subscription_activated", { userId })
                posthog.capture({
                    distinctId: userId,
                    event: 'subscription_activated',
                    properties: { subscription_id: subscription.id, status },
                })
            } else if (status === "canceled") {
                await triggerAppEvent("subscription_cancelled", { userId })
                posthog.capture({
                    distinctId: userId,
                    event: 'subscription_cancelled',
                    properties: { subscription_id: subscription.id, status },
                })
            }

            break
        }

        case "invoice.payment_succeeded": {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const invoice = event.data.object as any
            if (invoice.subscription) {
                const { data: dbSub } = await supabase
                    .from("subscriptions")
                    .select("id")
                    .eq("stripe_subscription_id", invoice.subscription as string)
                    .single()

                if (dbSub) {
                    await supabase.from("transactions").insert({
                        subscription_id: dbSub.id,
                        amount: invoice.amount_paid,
                        currency: invoice.currency,
                        provider_transaction_id: invoice.payment_intent as string || invoice.charge as string,
                        status: "succeeded"
                    })
                }
            }
            const invoiceUserId = invoice.subscription_details?.metadata?.userId || invoice.metadata?.userId
            if (invoiceUserId) {
                getPostHogClient().capture({
                    distinctId: invoiceUserId,
                    event: 'payment_succeeded',
                    properties: { amount: invoice.amount_paid, currency: invoice.currency, subscription_id: invoice.subscription },
                })
            }
            break
        }

        default:
            console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
}
