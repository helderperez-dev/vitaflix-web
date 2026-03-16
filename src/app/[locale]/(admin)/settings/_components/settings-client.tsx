
"use client"

import React from "react"
import { motion } from "framer-motion"
import {
    Boxes,
    Settings2,
    BellRing,
    Sparkles
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Link } from "@/i18n/routing"
import { useLocale, useTranslations } from "next-intl"

export default function SettingsHubPage_Client() {
    const locale = useLocale()
    const navigationT = useTranslations("Navigation")
    const isPt = locale.startsWith("pt")
    const settingsOptions = React.useMemo(() => ([
        {
            id: 'platform',
            label: navigationT("platformConfig"),
            description: isPt
                ? "Definições centrais, localização e parâmetros regionais."
                : "Core settings, localization and regional parameters.",
            icon: Settings2,
            href: '/settings/platform',
        },
        {
            id: 'system',
            label: isPt ? "Dicionários" : "Dictionaries",
            description: isPt
                ? "Gerir dados mestre, categorias e estruturas lógicas."
                : "Manage master data, categories and logic structures.",
            icon: Boxes,
            href: '/settings/system',
        },
        {
            id: 'notifications',
            label: navigationT("notifications"),
            description: isPt
                ? "Gestão de campanhas, gatilhos e grupos de utilizadores."
                : "Broadcast management, triggers and user groups.",
            icon: BellRing,
            href: '/settings/notifications',
        },
        {
            id: 'ai',
            label: navigationT("aiSettings"),
            description: isPt
                ? "Prompts para geração, melhoria, tradução de textos e imagens."
                : "Prompts for generating, improving, and translating text and images.",
            icon: Sparkles,
            href: '/settings/ai',
        }
    ]), [isPt, navigationT])

    return (
        <div className="h-full flex flex-col pt-0 overflow-hidden bg-white dark:bg-background">
            {/* Master Hub Header */}
            <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                {/* Premium Background Accent */}
                <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-white dark:from-white/[0.03] dark:to-transparent pointer-events-none" />

                <div className="flex items-center gap-6 relative z-10 w-full">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-primary rounded-full opacity-80" />
                            <h2 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white leading-none">
                                {navigationT("settings")}
                            </h2>
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground/70 dark:text-white/40 mt-2.5 ml-4 max-w-2xl leading-relaxed">
                            {isPt
                                ? "Orquestração centralizada para regras da plataforma, dados estruturais e comunicação com utilizadores."
                                : "Centralized orchestration for platform rules, structural data and user communications."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/20 dark:bg-transparent custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-10 max-w-7xl mx-auto w-full">
                    {settingsOptions.map((option, index) => {
                        const Icon = option.icon
                        return (
                            <motion.div
                                key={option.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                            >
                                <Link href={option.href} className="block group">
                                    <Card className="aspect-square border-border/40 bg-card/60 transition-colors duration-300 cursor-pointer rounded-[2rem] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] overflow-hidden relative border shadow-none flex flex-col">
                                        <CardHeader className="p-10 flex flex-col h-full">
                                            <div className="p-4.5 w-fit rounded-3xl bg-white dark:bg-white/5 transition-all duration-300 border border-border/40 mb-8 shadow-sm">
                                                <Icon className="size-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="mt-auto">
                                                <CardTitle className="text-lg font-bold text-foreground/80 tracking-tight mb-2">
                                                    {option.label}
                                                </CardTitle>
                                                <CardDescription className="text-[12px] font-medium text-muted-foreground/60 leading-relaxed max-w-[240px]">
                                                    {option.description}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div >
            </div >
        </div >
    )
}
