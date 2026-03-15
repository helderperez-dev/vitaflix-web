
"use client"

import { LocaleSetting } from "@/components/settings/locale-setting"
import { PlatformSetting } from "@/components/settings/platform-setting"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { useLocale, useTranslations } from "next-intl"

export default function PlatformPage_Client({ initialData }: { initialData: any }) {
    const locale = useLocale()
    const navigationT = useTranslations("Navigation")
    const isPt = locale.startsWith("pt")

    return (
        <div className="h-full flex flex-col pt-0 overflow-hidden bg-white dark:bg-background">
            <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                {/* Premium Background Accent */}
                <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-white dark:from-white/[0.03] dark:to-transparent pointer-events-none" />

                <div className="flex flex-col relative z-10 w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-full opacity-80" />
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white leading-none">
                            {navigationT("platformConfig")}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 ml-0">
                        <Link href="/settings">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 -ml-1 rounded-lg text-muted-foreground/30 hover:text-primary transition-all group"
                            >
                                <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                            </Button>
                        </Link>
                        <p className="text-[11px] font-medium text-muted-foreground/70 dark:text-white/40 max-w-2xl leading-relaxed">
                            {isPt
                                ? `Identidade global e regras sistémicas para ${initialData.platformName}.`
                                : `Global identity and systemic rules for ${initialData.platformName}.`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-transparent custom-scrollbar py-12">
                <div className="px-10 max-w-6xl mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <PlatformSetting
                        initialPlatformName={initialData.platformName}
                        initialSupportEmail={initialData.supportEmail}
                        initialAllowSignups={initialData.allowSignups}
                        initialMaintenanceMode={initialData.maintenanceMode}
                        initialSupportPhone={initialData.supportPhone}
                        initialTermsUrl={initialData.termsUrl}
                        initialPrivacyUrl={initialData.privacyUrl}
                        initialInstagramUrl={initialData.instagramUrl}
                        initialFacebookUrl={initialData.facebookUrl}
                        initialLogoUrl={initialData.logoUrl}
                        initialFaviconUrl={initialData.faviconUrl}
                    />
                    <LocaleSetting initialLocale={initialData.defaultLocale} />
                </div>
            </div>
        </div>
    )
}
