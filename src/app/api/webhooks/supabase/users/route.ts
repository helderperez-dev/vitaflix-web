import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { syncContactWithBrevo } from "@/lib/brevo"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // We only care about INSERT events on the users table
        if (body.type === "INSERT" && body.table === "users" && body.record) {
            const user = body.record
            const email = user.email
            const name = user.display_name || user.full_name || ""

            if (!email) {
                return NextResponse.json({ success: true, message: "No email provided, skipping." })
            }

            const admin = createAdminClient()

            // 1. Get default funnel/step
            const { data: defaultFunnel } = await admin
                .from("lead_funnels")
                .select(`id, lead_funnel_steps ( id, "order", name )`)
                .order("created_at", { ascending: true })
                .limit(1)
                .maybeSingle()

            const finalFunnelId = defaultFunnel?.id || null
            let finalStepId = null
            if (defaultFunnel && defaultFunnel.lead_funnel_steps) {
                const steps = (defaultFunnel.lead_funnel_steps as { id: string; order: number; name: string }[]) || []
                const newStep = steps.find((s) => s.name?.toLowerCase() === 'new')
                finalStepId = newStep?.id || steps.sort((a, b) => (a.order || 0) - (b.order || 0))[0]?.id || null
            }

            // 2. Check if lead already exists
            const { data: existingLeads } = await admin
                .from("leads")
                .select("*")
                .eq("email", email)
                .limit(1)

            const existingLead = existingLeads && existingLeads.length > 0 ? existingLeads[0] : null

            if (existingLead) {
                await admin
                    .from("leads")
                    .update({
                        name: name || existingLead.name,
                        source: 'app_registration',
                    })
                    .eq("id", existingLead.id)
            } else {
                await admin
                    .from("leads")
                    .insert([{
                        name: name || "App User",
                        email: email,
                        source: 'app_registration',
                        funnel_id: finalFunnelId,
                        step_id: finalStepId,
                        metadata: {
                            user_id: user.id
                        },
                    }])
            }

            // 3. Sync to Brevo (List ID 10 - free users)
            try {
                const listId = 10
                await syncContactWithBrevo(email, name, [listId])
            } catch (syncError) {
                console.error("Failed to sync new app user to Brevo:", syncError)
                // We don't throw here to ensure the webhook still returns a success status to Supabase
            }

            return NextResponse.json({ success: true, message: "User synced to leads and Brevo." })
        }

        return NextResponse.json({ success: true, message: "Event ignored." })
    } catch (error) {
        console.error("Supabase User Webhook Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
