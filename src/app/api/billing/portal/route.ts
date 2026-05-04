import { NextResponse } from "next/server"
import { z } from "zod"
import { BillingError, createBillingPortal } from "@/lib/stripe/billing"
import { getAuthenticatedRequestUser } from "@/lib/supabase/request-auth"

const portalRequestSchema = z.object({
    returnUrl: z.string().url().optional(),
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

    const parsed = portalRequestSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    try {
        const portal = await createBillingPortal(user.profile, parsed.data.returnUrl)
        return NextResponse.json(portal, { status: 201 })
    } catch (err) {
        if (err instanceof BillingError) {
            return NextResponse.json({ error: err.message }, { status: err.status })
        }

        const error = err as Error
        console.error("Billing portal error:", error)
        return NextResponse.json({ error: "Failed to create billing portal session." }, { status: 500 })
    }
}
