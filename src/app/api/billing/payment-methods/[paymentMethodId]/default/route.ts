import { NextResponse } from "next/server"
import { BillingError, setDefaultPaymentMethod } from "@/lib/stripe/billing"
import { getAuthenticatedRequestUser } from "@/lib/supabase/request-auth"

type RouteContext = {
    params: Promise<{
        paymentMethodId: string
    }>
}

export async function POST(request: Request, context: RouteContext) {
    const user = await getAuthenticatedRequestUser(request)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { paymentMethodId } = await context.params

    try {
        const result = await setDefaultPaymentMethod(user.profile, paymentMethodId)
        return NextResponse.json(result)
    } catch (err) {
        if (err instanceof BillingError) {
            return NextResponse.json({ error: err.message }, { status: err.status })
        }

        const error = err as Error
        console.error("Set default payment method error:", error)
        return NextResponse.json({ error: "Failed to update default payment method." }, { status: 500 })
    }
}
