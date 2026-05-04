import { NextResponse } from "next/server"
import { listBillingCatalog } from "@/lib/stripe/billing"

export async function GET() {
    try {
        const catalog = await listBillingCatalog()
        return NextResponse.json(catalog)
    } catch (err) {
        const error = err as Error
        console.error("Billing catalog error:", error)
        return NextResponse.json({ error: "Failed to load billing catalog." }, { status: 500 })
    }
}
