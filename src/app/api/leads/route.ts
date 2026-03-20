import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"
import { getPostHogClient } from "@/lib/posthog-server"

// This is a server-side API route, so it's safe to use the service role key.
// The service role bypasses RLS entirely, ensuring public lead inserts always work.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// A service-role client for the API route — runs only on the server, never exposed to the browser.
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Allow cross-origin requests
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, phone, source, funnel_id, step_id, metadata } = body

        if (!name || (!email && !phone)) {
            return NextResponse.json(
                { error: "Name and either email or phone are required." },
                { status: 400, headers: corsHeaders }
            )
        }

        const { data, error } = await supabase
            .from("leads")
            .insert([
                {
                    name,
                    email,
                    phone,
                    source,
                    funnel_id,
                    step_id,
                    metadata: metadata || {},
                },
            ])
            .select()
            .single()

        if (error) {
            console.error("Lead collection error:", error)
            return NextResponse.json(
                { error: "Failed to collect lead." },
                { status: 500, headers: corsHeaders }
            )
        }

        const posthog = getPostHogClient()
        posthog.capture({
            distinctId: email || phone || data.id,
            event: 'lead_submitted',
            properties: { lead_id: data.id, name, source: source || null, funnel_id: funnel_id || null, has_email: !!email, has_phone: !!phone },
        })

        return NextResponse.json({ success: true, lead: data }, { status: 201, headers: corsHeaders })
    } catch (err: any) {
        console.error("Lead endpoint error:", err)
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500, headers: corsHeaders }
        )
    }
}
