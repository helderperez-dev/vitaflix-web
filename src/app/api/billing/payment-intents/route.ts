import { NextResponse } from "next/server"
import { z } from "zod"
import { BillingError, createOneTimePaymentSheet } from "@/lib/stripe/billing"
import { getAuthenticatedRequestUser } from "@/lib/supabase/request-auth"

const paymentIntentRequestSchema = z.object({
    amount: z.number().int().positive(),
    currency: z.string().length(3),
    description: z.string().trim().min(1).optional(),
    saveForFutureUse: z.boolean().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
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

    const parsed = paymentIntentRequestSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    try {
        const result = await createOneTimePaymentSheet(user.profile, parsed.data)
        return NextResponse.json(result, { status: 201 })
    } catch (err) {
        if (err instanceof BillingError) {
            return NextResponse.json({ error: err.message }, { status: err.status })
        }

        const error = err as Error
        console.error("Payment intent creation error:", error)
        return NextResponse.json({ error: "Failed to create payment flow." }, { status: 500 })
    }
}
