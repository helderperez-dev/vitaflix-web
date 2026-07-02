"use server"

import { syncContactWithBrevo } from "@/lib/brevo"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

/**
 * Syncs a lead from the Caloric Calculator to Brevo List ID 6
 * and persists it to the Supabase database.
 * 
 * @param name The contact's full name.
 * @param email The contact's email address.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function syncCalculatorLeadAction(name: string, email: string) {
    if (!name || !email) {
        return { success: false, error: "Name and email are required." }
    }

    try {
        // 1. Save to Supabase Leads table
        const { data: defaultFunnel } = await supabase
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

        const { data: existingLeads } = await supabase
            .from("leads")
            .select("*")
            .eq("email", email)
            .limit(1)
        
        const existingLead = existingLeads && existingLeads.length > 0 ? existingLeads[0] : null

        if (existingLead) {
            await supabase
                .from("leads")
                .update({
                    name,
                    source: 'caloric_calculator',
                })
                .eq("id", existingLead.id)
        } else {
            await supabase
                .from("leads")
                .insert([{
                    name,
                    email,
                    source: 'caloric_calculator',
                    funnel_id: finalFunnelId,
                    step_id: finalStepId,
                    metadata: {},
                }])
        }

        // 2. Sync with Brevo (List ID 6)
        const listId = 6 // Target List ID as requested
        const success = await syncContactWithBrevo(email, name, [listId])
        
        if (!success) {
            console.warn("Saved to Supabase but failed to sync with Brevo.")
        }

        return { success: true }
    } catch (error) {
        console.error("Error in syncCalculatorLeadAction:", error)
        return { success: false, error: "An unexpected error occurred." }
    }
}
