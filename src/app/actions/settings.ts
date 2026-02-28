'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getDefaultLocale() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'default_locale')
        .single()

    if (error || !data) {
        return 'en'
    }

    return data.value as string
}

export async function updateDefaultLocale(newLocale: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('system_settings')
        .upsert({
            key: 'default_locale',
            value: newLocale,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error updating default locale:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function getSupportedLanguages() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'supported_languages')
        .single()

    if (error || !data) {
        return ["en", "es", "pt-pt", "pt-br"] // Fallback if not configured
    }

    return data.value as string[]
}
