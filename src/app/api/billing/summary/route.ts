import { NextResponse } from "next/server"
import { getBillingSummary } from "@/lib/stripe/billing"
import { getAuthenticatedRequestUser } from "@/lib/supabase/request-auth"

export async function GET(request: Request) {
    const user = await getAuthenticatedRequestUser(request)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    try {
        const summary = await getBillingSummary(user.profile)
        return NextResponse.json(summary)
    } catch (err) {
        const error = err as Error
        console.error("Billing summary error:", error)
        return NextResponse.json({ error: "Failed to load billing summary." }, { status: 500 })
    }
}
