import { NextResponse } from "next/server"
import { BillingError, createPaymentMethodSetupIntent } from "@/lib/stripe/billing"
import { getAuthenticatedRequestUser } from "@/lib/supabase/request-auth"

export async function POST(request: Request) {
    const user = await getAuthenticatedRequestUser(request)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    try {
        const result = await createPaymentMethodSetupIntent(user.profile)
        return NextResponse.json(result)
    } catch (err) {
        if (err instanceof BillingError) {
            return NextResponse.json({ error: err.message }, { status: err.status })
        }

        const error = err as Error
        console.error("Create setup intent error:", error)
        return NextResponse.json({ error: "Failed to create payment method setup intent." }, { status: 500 })
    }
}
