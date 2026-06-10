import { NextResponse } from "next/server"
import { z } from "zod"
import { BillingError, syncSetupIntentPaymentMethod } from "@/lib/stripe/billing"
import { getAuthenticatedRequestUser } from "@/lib/supabase/request-auth"

const syncSchema = z.object({
    setupIntentId: z.string().trim().min(1, "Setup intent id is required."),
})

export async function POST(request: Request) {
    const user = await getAuthenticatedRequestUser(request)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    let body: unknown = {}

    try {
        const text = await request.text()
        body = text ? JSON.parse(text) : {}
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const parsed = syncSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    try {
        const result = await syncSetupIntentPaymentMethod(user.profile, parsed.data.setupIntentId)
        return NextResponse.json(result)
    } catch (err) {
        if (err instanceof BillingError) {
            return NextResponse.json({ error: err.message }, { status: err.status })
        }

        const error = err as Error
        console.error("Sync setup intent payment method error:", error)
        return NextResponse.json({ error: "Failed to sync payment method." }, { status: 500 })
    }
}
