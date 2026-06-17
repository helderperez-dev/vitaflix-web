import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { LoginThemeToggle } from "@/components/auth/login-theme-toggle"
import { LanguageSwitcher } from "@/components/landing/language-switcher"
import { Button } from "@/components/ui/button"
import { ConfettiEffect } from "@/components/auth/confetti-effect"
import { DeepLinkButton } from "./deep-link-button"

type ConfirmationPageProps = {
    searchParams?: Promise<{
        status?: string
        message?: string
    }>
}

export default async function AccountConfirmedPage({ searchParams }: ConfirmationPageProps) {
    const params = await searchParams
    const t = await getTranslations("Auth")
    const status = params?.status === "error" ? "error" : "success"

    const title = status === "success"
        ? t("accountConfirmedTitle")
        : t("accountConfirmationErrorTitle")
    const description = status === "success"
        ? t("accountConfirmedDescription")
        : params?.message || t("accountConfirmationErrorDescription")

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(19,165,126,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,183,77,0.18),transparent_26%),linear-gradient(180deg,#fffdf8_0%,#f7fbff_45%,#eef5f7_100%)] px-6 py-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(19,165,126,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_18%),linear-gradient(180deg,#0f1720_0%,#101827_42%,#0b1220_100%)] md:px-8">
            <ConfettiEffect trigger={status === "success"} />
            
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(25,42,63,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(25,42,63,0.06)_1px,transparent_1px)] bg-size-[32px_32px] opacity-[0.18] dark:opacity-[0.08]" />
                <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-300/10" />
                <div className="absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/15" />
            </div>

            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center">
                <div className="w-full animate-in fade-in zoom-in-95 duration-500">
                    <section className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_30px_80px_rgba(25,42,63,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-10">
                        <div className="flex items-center justify-between">
                            <div className="relative h-14 w-14">
                                <Image
                                    src="/vitaflix_logo_dark_mode.png"
                                    alt="Vitaflix Logo"
                                    fill
                                    priority
                                    className="hidden object-contain dark:block"
                                />
                                <Image
                                    src="/vitaflix_logo_light_mode.png"
                                    alt="Vitaflix Logo"
                                    fill
                                    priority
                                    className="block object-contain dark:hidden"
                                />
                            </div>
                            <div className="flex items-center gap-1 text-foreground/60">
                                <LanguageSwitcher />
                                <LoginThemeToggle />
                            </div>
                        </div>

                        <div className="mt-10 space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                                <span className={`h-2.5 w-2.5 rounded-full ${status === "success" ? "bg-primary" : "bg-destructive"} ${status === "success" ? "animate-pulse" : ""}`} />
                                {status === "success" ? t("accountConfirmedEyebrow") : t("accountConfirmationErrorEyebrow")}
                            </div>

                            <div className="space-y-4">
                                <h1 className="max-w-xl text-4xl font-black tracking-[-0.04em] text-slate-900 dark:text-white sm:text-5xl">
                                    {title}
                                </h1>
                                <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                                    {description}
                                </p>
                            </div>

                            {status === "success" ? (
                                <div className="rounded-[1.75rem] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,245,222,0.92),rgba(255,255,255,0.86))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:border-amber-300/10 dark:bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(255,255,255,0.03))]">
                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
                                        {t("accountConfirmedPanelEyebrow")}
                                    </p>
                                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-700 dark:text-slate-200 sm:text-base">
                                        {t("accountConfirmedPanelDescription")}
                                    </p>
                                    <div className="mt-6">
                                        <DeepLinkButton text={t("openMobileApp")} />
                                    </div>
                                    <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
                                        {t("openMobileAppHint")}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    <Button asChild size="lg" className="h-12 rounded-full px-6 text-sm font-semibold hover:scale-105 transition-transform">
                                        <Link href="/login">{t("backToLogin")}</Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-6 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <Link href="/">{t("goToHomepage")}</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
