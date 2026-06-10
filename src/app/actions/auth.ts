"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect, routing } from "@/i18n/routing"
import { getLocale } from 'next-intl/server'
import posthogServer from "@/lib/posthog-server"

type AppLocale = (typeof routing.locales)[number]

function normalizeLocale(locale: string | null | undefined): AppLocale {
    if (locale && routing.locales.includes(locale as AppLocale)) {
        return locale as AppLocale
    }

    return routing.defaultLocale
}

export async function loginAction(data: { email: string; password: string; locale: string }) {
    const supabase = await createClient()

    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    })

    if (error) {
        return { error: error.message }
    }

    if (authData.user) {
        posthogServer.identify({
            distinctId: authData.user.id,
            properties: {
                email: authData.user.email,
            },
        })
    }

    // After successful login, fetch user profile to find their locale and role.
    const { data: userData } = await supabase
        .from('users')
        .select('locale, role')
        .eq('id', authData.user?.id ?? '')
        .maybeSingle()

    // If no user locale, fall back to global default
    let targetLocale = userData?.locale ? normalizeLocale(userData.locale) : null

    if (!targetLocale) {
        const { data: settingData } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'default_locale')
            .single()
        targetLocale = normalizeLocale(typeof settingData?.value === "string" ? settingData.value : undefined)
    }

    const targetHref = userData?.role === "admin" ? "/dashboard" : "/account/billing"

    redirect({ href: targetHref, locale: targetLocale })
}

export async function logoutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    const locale = normalizeLocale(await getLocale())
    redirect({ href: "/login", locale })
}
