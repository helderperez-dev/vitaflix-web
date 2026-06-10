import Image from "next/image"
import { Link, redirect, routing } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "@/components/layout/user-menu"

type AppLocale = (typeof routing.locales)[number]

export default async function AccountLayout({
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
    const resolvedUserId = userId ?? ""

    const { data: dbUser } = await supabase
        .from("users")
        .select("display_name, email, role, avatar_url")
        .eq("id", resolvedUserId)
        .maybeSingle()

    if (dbUser?.role === "admin") {
        redirect({ href: "/dashboard", locale: targetLocale })
    }

    const userData = {
        id: resolvedUserId,
        email: dbUser?.email || user?.email || "",
        name: dbUser?.display_name || user?.user_metadata?.full_name || undefined,
        avatar: dbUser?.avatar_url || user?.user_metadata?.avatar_url || undefined,
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
                    <Link href="/" className="relative block h-8 w-8 transition-opacity hover:opacity-80">
                        <Image
                            src="/vitaflix_logo_light_mode.png"
                            alt="Vitaflix"
                            fill
                            className="object-contain"
                        />
                    </Link>

                    <div className="flex items-center gap-3">
                        <UserMenu user={userData} />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-8 md:py-10">
                {children}
            </main>
        </div>
    )
}
