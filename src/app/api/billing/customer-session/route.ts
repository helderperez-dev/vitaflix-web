import { NextResponse } from "next/server"
import { createMobileCustomerContext } from "@/lib/stripe/billing"
import { getAuthenticatedRequestUser } from "@/lib/supabase/request-auth"

export async function POST(request: Request) {
    const user = await getAuthenticatedRequestUser(request)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    try {
        const context = await createMobileCustomerContext(user.profile)
        return NextResponse.json(context)
    } catch (err) {
        const error = err as Error
        console.error("Customer session error:", error)
        return NextResponse.json({ error: "Failed to create customer session." }, { status: 500 })
    }
}
