import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { routing } from "@/i18n/routing"

function buildRedirectUrl(request: Request, status: "success" | "error", message?: string) {
    const requestUrl = new URL(request.url)
    const locale = getLocaleFromPath(requestUrl.pathname)
    const url = new URL(`/${locale}/auth/account-confirmed`, request.url)
    url.searchParams.set("status", status)

    if (message) {
        url.searchParams.set("message", message)
    }

    return url
}

function getLocaleFromPath(pathname: string) {
    const [, maybeLocale] = pathname.split("/")

    if (routing.locales.includes(maybeLocale as (typeof routing.locales)[number])) {
        return maybeLocale
    }

    return routing.defaultLocale
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const tokenHash = requestUrl.searchParams.get("token_hash")
    const type = requestUrl.searchParams.get("type")

    try {
        const supabase = await createClient()

        if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) {
                return NextResponse.redirect(buildRedirectUrl(request, "error", error.message))
            }

            return NextResponse.redirect(buildRedirectUrl(request, "success"))
        }

        if (tokenHash && type) {
            const { error } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: type as EmailOtpType,
            })

            if (error) {
                return NextResponse.redirect(buildRedirectUrl(request, "error", error.message))
            }

            return NextResponse.redirect(buildRedirectUrl(request, "success"))
        }

        return NextResponse.redirect(buildRedirectUrl(request, "error"))
    } catch (error) {
        const message = error instanceof Error ? error.message : undefined
        return NextResponse.redirect(buildRedirectUrl(request, "error", message))
    }
}
