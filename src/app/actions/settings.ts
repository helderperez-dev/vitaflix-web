'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getDefaultLocale() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'default_locale')
        .maybeSingle()

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
        .maybeSingle()

    if (error || !data) {
        return ["en", "es", "pt-pt", "pt-br"] // Fallback if not configured
    }

    return data.value as string[]
}

export async function getSystemConfig(key: string, defaultValue: unknown = null) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle()

    if (error) {
        console.error(`Error fetching system config for key "${key}":`, error)
        return defaultValue
    }

    if (!data) {
        return defaultValue
    }

    return data.value
}

export async function updateSystemConfig(key: string, value: unknown) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return { error: "Authentication required" }
    }

    // Verify admin role in the database
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userError || userData?.role !== 'admin') {
        console.error(`Permission denied for user ${user.email} attempting to update ${key}`)
        return { error: "Permission denied. Admin role required." }
    }

    // Use admin client to bypass RLS since policies on system_settings might be restrictive
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
        .from('system_settings')
        .upsert({
            key,
            value,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error(`Error updating system setting ${key}:`, error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

