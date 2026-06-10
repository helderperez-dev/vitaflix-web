"use server"

import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe/client"

type InvoiceSecret = {
    client_secret?: string | null
} | null

type StripeInvoiceWithPaymentAccess = Stripe.Invoice & {
    confirmation_secret?: InvoiceSecret
    payment_intent?: string | Stripe.PaymentIntent | null
}

function getInvoiceClientSecret(invoice: StripeInvoiceWithPaymentAccess) {
    const confirmationSecret = invoice.confirmation_secret?.client_secret
    if (confirmationSecret) {
        return confirmationSecret
    }

    const paymentIntent = invoice.payment_intent
    if (paymentIntent && typeof paymentIntent !== "string") {
        return paymentIntent.client_secret ?? null
    }

    return null
}

export async function getInvoicePaymentDetails(invoiceId: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
        return { errorCode: "unauthorized" as const }
    }

    const admin = createAdminClient()
    const { data: invoice } = await admin
        .from("billing_invoices")
        .select("*")
        .eq("stripe_invoice_id", invoiceId)
        .eq("user_id", session.user.id)
        .maybeSingle()

    if (!invoice) {
        return { errorCode: "invoice_not_found" as const }
    }

    if (invoice.status !== "open" && invoice.status !== "past_due") {
        return { errorCode: "invoice_not_open" as const }
    }

    try {
        let stripeInvoice = await stripe.invoices.retrieve(invoiceId, {
            expand: ["confirmation_secret", "payment_intent"]
        })
        let clientSecret = getInvoiceClientSecret(stripeInvoice)

        if (stripeInvoice.status === "paid" || stripeInvoice.amount_due === 0) {
            return { errorCode: "invoice_already_paid" as const }
        }

        if (stripeInvoice.status === "void" || stripeInvoice.status === "uncollectible") {
            return { errorCode: "invoice_not_open" as const }
        }

        // Some invoice flows do not expose a payment_intent immediately.
        // Stripe can attach the invoice confirmation secret during a payment attempt.
        if (!clientSecret) {
            try {
                stripeInvoice = await stripe.invoices.pay(invoiceId, {
                    expand: ["confirmation_secret", "payment_intent"]
                })
            } catch {
                stripeInvoice = await stripe.invoices.retrieve(invoiceId, {
                    expand: ["confirmation_secret", "payment_intent"]
                })
            }
            clientSecret = getInvoiceClientSecret(stripeInvoice)
        }

        // If the payment intent is in 'requires_confirmation' (e.g. from the pay() call above attaching the default method),
        // the Stripe Payment Element might refuse to render or show a blank box because it expects an immediate confirmPayment call.
        // Since the user is on the checkout page to explicitly review and enter payment details, we detach the payment method
        // so the intent returns to 'requires_payment_method' and the card input fields reliably appear.
        const paymentIntent = (stripeInvoice as any).payment_intent
        if (paymentIntent && paymentIntent.status === "requires_confirmation" && paymentIntent.payment_method) {
            try {
                const updatedPi = await stripe.paymentIntents.update(paymentIntent.id, { payment_method: "" } as any)
                clientSecret = updatedPi.client_secret || clientSecret
            } catch (e) {
                console.error("Failed to detach payment method from invoice intent", e)
            }
        }

        if (stripeInvoice.status === "paid" || stripeInvoice.amount_due === 0) {
            return { errorCode: "invoice_already_paid" as const }
        }

        if (!clientSecret) {
            console.error("Invoice payment secret unavailable", {
                invoiceId,
                stripeStatus: stripeInvoice.status,
                amountDue: stripeInvoice.amount_due,
                collectionMethod: stripeInvoice.collection_method,
                hostedInvoiceUrl: stripeInvoice.hosted_invoice_url,
            })
            return { errorCode: "invoice_payment_unavailable" as const }
        }

        return {
            success: true,
            invoice: {
                id: invoice.stripe_invoice_id,
                amount: stripeInvoice.amount_due,
                currency: stripeInvoice.currency,
                number: stripeInvoice.number,
                clientSecret,
                hostedInvoiceUrl: stripeInvoice.hosted_invoice_url,
            }
        }
    } catch (error) {
        console.error("Failed to fetch invoice payment details", {
            invoiceId,
            error,
        })
        return { errorCode: "invoice_load_failed" as const }
    }
}
