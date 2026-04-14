"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/database.types"
import { getSystemConfig } from "./settings"

export async function getFunnelsAction() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("lead_funnels")
        .select(`
            *,
            lead_funnel_steps (*)
        `)
        .order("created_at", { ascending: true })

    if (error) {
        console.error("Error fetching funnels:", error)
        return { success: false, error: error.message, funnels: [] }
    }

    // Sort steps by order
    const funnels = data.map(funnel => ({
        ...funnel,
        lead_funnel_steps: funnel.lead_funnel_steps.sort((a: any, b: any) => a.order - b.order)
    }))

    return { success: true, funnels }
}

export async function createFunnelAction(name: string, description?: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("lead_funnels")
        .insert([{ name, description }])
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    revalidatePath("/leads")
    return { success: true, funnel: data }
}

export async function deleteFunnelAction(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("lead_funnels")
        .delete()
        .eq("id", id)

    if (error) return { success: false, error: error.message }

    revalidatePath("/leads")
    return { success: true }
}

export async function createFunnelStepAction(funnel_id: string, name: string, color?: string, order: number = 0) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("lead_funnel_steps")
        .insert([{ funnel_id, name, color, order }])
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    revalidatePath("/leads")
    return { success: true, step: data }
}

export async function updateFunnelStepOrderAction(steps: { id: string, order: number }[]) {
    const supabase = await createClient()

    // Updates must be done per row or using an RPC if bulk updating is complex.
    // For simplicity, we loop or use upsert if we select all columns.
    // Upserting is easier if we fetch existing, but multiple updates are fine for small sets.

    for (const step of steps) {
        await supabase
            .from("lead_funnel_steps")
            .update({ order: step.order })
            .eq("id", step.id)
    }

    revalidatePath("/leads")
    return { success: true }
}

export async function getLeadsAction(funnelId?: string) {
    const supabase = await createClient()
    let query = supabase
        .from("leads")
        .select("*")
        .eq("is_archived", false)
        .order("created_at", { ascending: false })

    // 'all' is a sentinel value meaning no funnel filter — fetch every lead
    if (funnelId && funnelId !== 'all') {
        // Include leads in this funnel OR unassigned leads (funnel_id IS NULL)
        query = query.or(`funnel_id.eq.${funnelId},funnel_id.is.null`)
    }

    const { data, error } = await query

    if (error) {
        console.error("Error fetching leads:", error)
        return { success: false, error: error.message, leads: [] }
    }

    return { success: true, leads: data }
}

export async function updateLeadStepAction(leadId: string, stepId: string | null) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("leads")
        .update({ step_id: stepId })
        .eq("id", leadId)

    if (error) return { success: false, error: error.message }

    revalidatePath("/leads")
    return { success: true }
}

export async function deleteLeadAction(leadId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId)

    if (error) return { success: false, error: error.message }

    revalidatePath("/leads")
    return { success: true }
}

export async function upsertLeadAction(lead: Database['public']['Tables']['leads']['Insert'] | Database['public']['Tables']['leads']['Update']) {
    const supabase = await createClient()

    // If it's a new lead (no id) and no funnel/step is provided, try to assign defaults
    if (!('id' in lead && lead.id) && !lead.funnel_id && !lead.step_id) {
        const { data: defaultFunnel } = await supabase
            .from("lead_funnels")
            .select(`id, lead_funnel_steps ( id )`)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle()

        if (defaultFunnel) {
            lead.funnel_id = defaultFunnel.id
            const firstStep = (defaultFunnel.lead_funnel_steps as any[])?.sort((a, b) => (a.order || 0) - (b.order || 0))[0]
            if (firstStep) {
                lead.step_id = firstStep.id
            }
        }
    }

    let result;
    if ('id' in lead && lead.id) {
        result = await supabase
            .from("leads")
            .update(lead as any)
            .eq("id", lead.id)
            .select()
            .single()
    } else {
        result = await supabase
            .from("leads")
            .insert([lead as any])
            .select()
            .single()
    }

    if (result.error) return { success: false, error: result.error.message }

    // Always sync with Brevo if email is present
    if (result.data?.email) {
        try {
            const brevoConfig = await getSystemConfig('brevo_config');
            const config = brevoConfig?.addLead || { enabled: true, listId: 2 };

            if (config.enabled) {
                const { syncContactWithBrevo } = await import("@/lib/brevo")
                // Background sync to keep admin UI fast
                void syncContactWithBrevo(result.data.email, result.data.name, [config.listId])
            }
        } catch (e) {
            console.error("Failed to sync with Brevo in upsertLeadAction:", e)
        }
    }

    revalidatePath("/leads")
    return { success: true, lead: result.data }
}

export async function bulkDeleteLeads(ids: string[]) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("leads")
        .delete()
        .in("id", ids)

    if (error) return { success: false, error: error.message }

    revalidatePath("/leads")
    return { success: true }
}

export async function syncLeadsWithBrevoAction(ids: string[], syncSource: 'kanbanSync' | 'dataGridSync' = 'kanbanSync') {
    const supabase = await createClient()
    
    // Check config first
    const brevoConfig = await getSystemConfig('brevo_config');
    const config = brevoConfig?.[syncSource] || { enabled: true, listId: 2 };

    if (!config.enabled) {
        return { success: false, error: "Brevo integration is disabled for this process." }
    }

    // Explicitly set a high limit ...
    const { data: leads, error } = await supabase
        .from("leads")
        .select("id, name, email")
        .in("id", ids)
        .limit(500)

    if (error) {
        console.error("Error fetching leads for Brevo sync:", error)
        return { success: false, error: error.message }
    }

    if (!leads || leads.length === 0) {
        return { success: false, error: "No leads found." }
    }

    const { syncContactWithBrevo } = await import("@/lib/brevo")

    // We process in small batches to avoid Brevo rate limits (10 requests per second)
    // and to ensure stability when syncing large numbers of leads.
    const results: Array<PromiseSettledResult<string>> = []
    const batchSize = 5
    
    for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize)
        const batchPromises = batch.map(async (lead) => {
            if (!lead.email) throw new Error("No email")
            const success = await syncContactWithBrevo(lead.email, lead.name, [config.listId])
            if (!success) throw new Error("Sync failed")
            return lead.id
        })
        
        const batchResults = await Promise.allSettled(batchPromises)
        results.push(...batchResults)
        
        // Minor delay between batches to respect rate limits
        if (i + batchSize < leads.length) {
            await new Promise(resolve => setTimeout(resolve, 200))
        }
    }

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return {
        success: succeeded > 0,
        summary: {
            total: leads.length,
            succeeded,
            failed
        }
    }
}

export async function bulkUpsertLeadsAction(leadsData: Array<{ name: string, email?: string | null, phone?: string | null }>) {
    const supabase = await createClient()

    // Fetch default funnel and step for the whole batch
    const { data: defaultFunnel } = await supabase
        .from("lead_funnels")
        .select(`id, lead_funnel_steps ( id, "order" )`)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()
    
    const defaultFid = defaultFunnel?.id || null
    const defaultSid = (defaultFunnel?.lead_funnel_steps as any[])?.sort((a, b) => (a.order || 0) - (b.order || 0))[0]?.id || null

    let succeeded = 0;
    let failed = 0;
    const leadsToSync: Array<{ email: string, name: string }> = [];

    for (const lead of leadsData) {
        try {
            if (!lead.email) {
                // If it doesn't have an email, we just insert it.
                await supabase.from("leads").insert({
                    name: lead.name,
                    phone: lead.phone || null,
                    source: "Imported",
                    funnel_id: defaultFid,
                    step_id: defaultSid
                });
                succeeded++;
                continue;
            }

            // Check if email already exists
            const { data: existing } = await supabase
                .from("leads")
                .select("id")
                .eq("email", lead.email)
                .maybeSingle();

            if (existing) {
                // Update existing record, keeping funnel unchanged
                await supabase.from("leads").update({
                    name: lead.name,
                    phone: lead.phone || null,
                }).eq("id", existing.id);
            } else {
                // Insert new record with defaults
                await supabase.from("leads").insert({
                    name: lead.name,
                    email: lead.email,
                    phone: lead.phone || null,
                    source: "Imported",
                    funnel_id: defaultFid,
                    step_id: defaultSid
                });
            }
            succeeded++;
            
            // Queue for Brevo sync
            leadsToSync.push({ email: lead.email, name: lead.name });

        } catch (error) {
            console.error("Failed to process bulk lead:", lead, error);
            failed++;
        }
    }

    // Process queued Brevo syncs in controlled batches to avoid rate limits
    if (leadsToSync.length > 0) {
        const brevoConfig = await getSystemConfig('brevo_config');
        const config = brevoConfig?.importCsv || { enabled: true, listId: 2 };

        console.log(`[CSV Import Debug] Total leads to sync: ${leadsToSync.length}`);
        console.log(`[CSV Import Debug] Full brevoConfig:`, JSON.stringify(brevoConfig, null, 2));
        console.log(`[CSV Import Debug] Using config for importCsv:`, JSON.stringify(config, null, 2));

        if (config.enabled) {
            const { syncContactWithBrevo } = await import("@/lib/brevo")
            const batchSize = 2 // Safely under 10 req/sec limit
            
            for (let i = 0; i < leadsToSync.length; i += batchSize) {
                const batch = leadsToSync.slice(i, i + batchSize)
                await Promise.allSettled(
                    batch.map(lead => syncContactWithBrevo(lead.email, lead.name, [config.listId]))
                )
                
                // Delay to respect Brevo's 10 requests per second limit
                if (i + batchSize < leadsToSync.length) {
                    await new Promise(resolve => setTimeout(resolve, 250))
                }
            }
        }
    }

    revalidatePath("/leads")
    return { success: true, summary: { succeeded, failed, total: leadsData.length } }
}
