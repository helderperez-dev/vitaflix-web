import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { handleStripeWebhookEvent } from "@/lib/stripe/webhook"
import { stripe } from "@/lib/stripe/client"

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

    try {
        await handleStripeWebhookEvent(event)
    } catch (err) {
        const error = err as Error
        console.error(`Stripe webhook processing failed for ${event.type}: ${error.message}`)
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}
