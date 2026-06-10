import AdminLayout from "@/components/layout/admin-layout"
import { createClient } from "@/lib/supabase/server"
import { redirect, routing } from "@/i18n/routing"

type AppLocale = (typeof routing.locales)[number]

export default async function Layout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const targetLocale = routing.locales.includes(locale as AppLocale)
        ? (locale as AppLocale)
        : routing.defaultLocale
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const userId = user?.id

    if (!userId) {
        redirect({ href: "/login", locale: targetLocale })
    }

    const { data: dbUser } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle()

    if (dbUser?.role !== "admin") {
        redirect({ href: "/account/billing", locale: targetLocale })
    }

    return <AdminLayout>{children}</AdminLayout>
}
