import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"
import { getPostHogClient } from "@/lib/posthog-server"
import { syncContactWithBrevo } from "@/lib/brevo"
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

        // Deduplication logic: Check if a lead with this email already exists
        // We use .limit(1) instead of .maybeSingle() because if duplicates already exist,
        // .maybeSingle() would return an error, causing the logic to fall back to insertion.
        const { data: existingLeads } = email 
            ? await supabase.from("leads").select("*").eq("email", email).limit(1)
            : { data: [] as any[] }
        
        const existingLead = existingLeads && existingLeads.length > 0 ? existingLeads[0] : null

        let responseData, responseError

        if (existingLead) {
            // Update existing lead
            const { data, error } = await supabase
                .from("leads")
                .update({
                    name,
                    phone: phone || existingLead.phone,
                    // If source is provided, we update it, otherwise keep existing
                    source: source || existingLead.source,
                    // Respect explicitly passed funnel/step, otherwise keep current
                    funnel_id: funnel_id || existingLead.funnel_id,
                    step_id: step_id || existingLead.step_id,
                    metadata: { ...(existingLead.metadata as any || {}), ...(metadata || {}) },
                })
                .eq("id", existingLead.id)
                .select()
                .single()
            responseData = data
            responseError = error
        } else {
            // Insert new lead (incorporating the default status logic)
            let finalFunnelId = funnel_id
            let finalStepId = step_id

            if (!finalFunnelId || !finalStepId) {
                const { data: defaultFunnel } = await supabase
                    .from("lead_funnels")
                    .select(`id, lead_funnel_steps ( id, "order", name )`)
                    .order("created_at", { ascending: true })
                    .limit(1)
                    .maybeSingle()

                if (!finalFunnelId) finalFunnelId = defaultFunnel?.id || null
                if (!finalStepId) {
                    const steps = (defaultFunnel?.lead_funnel_steps as any[]) || []
                    const newStep = steps.find((s: any) => s.name?.toLowerCase() === 'new')
                    finalStepId = newStep?.id || steps.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0]?.id || null
                }
            }

            const { data, error } = await supabase
                .from("leads")
                .insert([
                    {
                        name,
                        email,
                        phone,
                        source,
                        funnel_id: finalFunnelId,
                        step_id: finalStepId,
                        metadata: metadata || {},
                    },
                ])
                .select()
                .single()
            responseData = data
            responseError = error
        }

        if (responseError) {
            console.error("Lead submission error:", responseError)
            return NextResponse.json(
                { error: "Failed to process lead." },
                { status: 500, headers: corsHeaders }
            )
        }

        const posthog = getPostHogClient()
        posthog.capture({
            distinctId: email || phone || responseData.id,
            event: existingLead ? 'lead_updated' : 'lead_submitted',
            properties: { 
                lead_id: responseData.id, 
                name, 
                source: source || responseData.source || null, 
                funnel_id: responseData.funnel_id || null, 
                has_email: !!email, 
                has_phone: !!phone,
                is_update: !!existingLead
            },
        })

        // Sync with Brevo marketing list if an email is provided
        if (email) {
            await syncContactWithBrevo(email, name);
        }

        return NextResponse.json(
            { success: true, lead: responseData, updated: !!existingLead }, 
            { status: existingLead ? 200 : 201, headers: corsHeaders }
        )
    } catch (err: any) {
        console.error("Lead endpoint error:", err)
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500, headers: corsHeaders }
        )
    }
}
