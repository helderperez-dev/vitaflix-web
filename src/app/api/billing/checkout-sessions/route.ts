import { NextResponse } from "next/server"
import { z } from "zod"
import { BillingError, createEmbeddedSubscriptionCheckout } from "@/lib/stripe/billing"
import { getAuthenticatedRequestUser } from "@/lib/supabase/request-auth"

const checkoutSessionRequestSchema = z.object({
    priceId: z.string().min(1),
    quantity: z.number().int().positive().optional(),
    promotionCode: z.string().trim().min(1).optional(),
    couponId: z.string().trim().min(1).optional(),
    returnUrl: z.string().url().optional(),
})

export async function POST(request: Request) {
    const user = await getAuthenticatedRequestUser(request)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    let body: unknown

    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const parsed = checkoutSessionRequestSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    try {
        const result = await createEmbeddedSubscriptionCheckout(user.profile, parsed.data)
        return NextResponse.json(result, { status: 201 })
    } catch (err) {
        if (err instanceof BillingError) {
            return NextResponse.json({ error: err.message }, { status: err.status })
        }

        const error = err as Error
        console.error("Checkout session creation error:", error)
        return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 })
    }
}
