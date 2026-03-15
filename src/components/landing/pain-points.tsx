"use client"

import { motion } from "framer-motion"
import { Clock3, Soup, CircleHelp, Repeat2, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

const painIcons = {
    time: Clock3,
    flavor: Soup,
    doubt: CircleHelp,
    variety: Repeat2,
    quantity: Target
}

const painKeys = Object.keys(painIcons) as Array<keyof typeof painIcons>

export function PainPoints() {
    const t = useTranslations("Landing.PainPoints")
    return (
        <section className="relative overflow-hidden bg-[#f8fbff] py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-0 h-60 w-[36rem] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
            </div>
            <div className="container relative z-10 mx-auto px-4 sm:px-6">
                <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("label")}</p>
                    <h2 className="mb-5 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">{t("title")}</h2>
                    <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">{t("subtitle")}</p>
                </div>

                <div className="mx-auto grid max-w-6xl gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-6">
                    {painKeys.map((key, i) => {
                        const Icon = painIcons[key]
                        return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            key={key}
                            className={cn(
                                "group rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 md:min-h-[230px] md:p-7",
                                i < 3 ? "lg:col-span-2" : "lg:col-span-3"
                            )}
                        >
                            <div className="mb-5 inline-flex rounded-2xl border border-primary/15 bg-primary/5 p-3 text-primary transition-colors group-hover:bg-primary/10">
                                <Icon className="size-6" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold tracking-tight text-slate-900">{t(`items.${key}.title`)}</h3>
                            <p className="text-[15px] leading-relaxed text-slate-600">{t(`items.${key}.desc`)}</p>
                        </motion.div>
                        )
                    })}
                </div>

            </div>
        </section>
    )
}
