"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/database.types"

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
