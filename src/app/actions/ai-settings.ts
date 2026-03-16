'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAIPrompts() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ai_prompts')
        .select('key, prompt_template, description, category, action_type, input_type, is_active')
        .order('key')

    if (error) {
        console.error('Error fetching AI prompts:', error)
        return []
    }

    return data
}

export async function updateAIPrompt(key: string, prompt_template: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('ai_prompts')
        .update({
            prompt_template,
            updated_at: new Date().toISOString()
        })
        .eq('key', key)

    if (error) {
        console.error(`Error updating AI prompt ${key}:`, error)
        return { error: error.message }
    }

    revalidatePath("/(admin)/settings/ai", "layout")
    revalidatePath("/", "layout")
    return { success: true }
}
