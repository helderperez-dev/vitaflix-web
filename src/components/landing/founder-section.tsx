"use client"

import { motion } from "framer-motion"
import { GraduationCap, TrendingUp, HeartPulse, Users, ArrowUp } from "lucide-react"
import { RecipeCarousel } from "./recipe-carousel"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

const pillarKeys = ["tech", "progress", "routine"]

const pillarIcons = {
    tech: GraduationCap,
    progress: TrendingUp,
    routine: HeartPulse
}

export function FounderSection() {
    const t = useTranslations("Landing.Founder")
    const scrollToWaitlist = () => {
        const element = document.getElementById('waitlist');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            // Try to find the first input within the waitlist section to focus
            setTimeout(() => {
                const input = element.querySelector('input');
                if (input) {
                    (input as HTMLInputElement).focus();
                }
            }, 800);
        }
    }

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#f8fbff] to-white py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-8 left-1/2 h-72 w-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("label")}</p>
                    <h2 className="mb-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">{t("title")}</h2>
                    <p className="mx-auto max-w-2xl text-base text-slate-600 md:text-lg">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
                    {pillarKeys.map((key, index) => {
                        const Icon = pillarIcons[key as keyof typeof pillarIcons]
                        return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-4 inline-flex rounded-2xl border border-primary/15 bg-primary/10 p-2.5 text-primary">
                                <Icon className="size-5" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold tracking-tight text-slate-900">{t(`pillars.${key}.title`)}</h3>
                            <p className="text-[15px] leading-relaxed text-slate-600">{t(`pillars.${key}.desc`)}</p>
                        </motion.div>
                    )})}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mx-auto mt-8 max-w-6xl rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-7"
                >
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 rounded-2xl bg-primary/10 p-2.5 text-primary">
                            <Users className="size-5" />
                        </div>
                        <p className="text-[15px] leading-relaxed text-slate-600">
                            {t("box")}
                        </p>
                    </div>
                </motion.div>

                <div className="mt-16">
                    <RecipeCarousel />
                    <div className="mt-10 flex justify-center">
                        <Button 
                            size="lg" 
                            onClick={scrollToWaitlist}
                            className="rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-2"
                        >
                            {t("button")}
                            <ArrowUp className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
