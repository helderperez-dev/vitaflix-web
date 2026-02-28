"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "@/i18n/routing"


export async function loginAction(data: { email: string; password: string; locale: string }) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    })

    if (error) {
        return { error: error.message }
    }

    // After successful login, fetch user profile to find their locale
    const { data: userData } = await supabase
        .from('users')
        .select('locale')
        .eq('email', data.email)
        .single()

    // If no user locale, fall back to global default
    let targetLocale = userData?.locale

    if (!targetLocale) {
        const { data: settingData } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'default_locale')
            .single()
        targetLocale = settingData?.value || 'en'
    }

    // Redirect to dashboard on success, maintaining the user's persistent locale
    redirect({ href: "/dashboard", locale: targetLocale as any })
}

export async function logoutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect({ href: "/" } as any)
}
