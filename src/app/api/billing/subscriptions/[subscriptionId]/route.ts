import { NextResponse } from "next/server"
import { z } from "zod"
import { BillingError, updateSubscription } from "@/lib/stripe/billing"
import { getAuthenticatedRequestUser } from "@/lib/supabase/request-auth"

const subscriptionUpdateSchema = z
    .object({
        priceId: z.string().trim().min(1).optional(),
        quantity: z.number().int().positive().optional(),
        cancelAtPeriodEnd: z.boolean().optional(),
        promotionCode: z.string().trim().min(1).optional(),
        couponId: z.string().trim().min(1).optional(),
    })
    .refine(
        data => typeof data.cancelAtPeriodEnd === "boolean" || !!data.priceId,
        { message: "Provide a new priceId or a cancelAtPeriodEnd flag." }
    )

export async function PATCH(
    request: Request,
    context: { params: Promise<{ subscriptionId: string }> }
) {
    const user = await getAuthenticatedRequestUser(request)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { subscriptionId } = await context.params
    if (!subscriptionId) {
        return NextResponse.json({ error: "Subscription id is required." }, { status: 400 })
    }

    let body: unknown = {}

    try {
        const text = await request.text()
        body = text ? JSON.parse(text) : {}
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const parsed = subscriptionUpdateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    try {
        const result = await updateSubscription(user.profile, subscriptionId, parsed.data)
        return NextResponse.json(result)
    } catch (err) {
        if (err instanceof BillingError) {
            return NextResponse.json({ error: err.message }, { status: err.status })
        }

        const error = err as Error & {
            type?: string
            code?: string
            raw?: { message?: string }
        }
        console.error("Subscription update error:", error)
        const message =
            error.raw?.message
            ?? error.message
            ?? "Failed to update subscription."

        return NextResponse.json(
            {
                error: message,
                code: error.code ?? null,
                type: error.type ?? null,
            },
            { status: 500 }
        )
    }
}
