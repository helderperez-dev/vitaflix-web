"use client"

import { WaitlistForm } from "./waitlist-form"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

export function CtaSection() {
    const t = useTranslations("Landing.Cta")
    return (
        <section className="relative overflow-hidden py-24 md:py-32 bg-[#FAFCFF]">
            {/* Background Effects - Matching Hero Section style */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-sky-100/60 blur-[100px]" />
                <div className="absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-teal-50/80 blur-[80px]" />
            </div>
            
            <div className="container relative z-10 mx-auto px-4 sm:px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                            {t("title")} <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-teal-500">
                                {t("highlight")}
                            </span>
                        </h2>
                        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 md:text-xl leading-relaxed">
                            {t("subtitle")}
                        </p>
                        
                        <div className="mx-auto max-w-3xl">
                            <WaitlistForm />
                            <p className="mt-4 text-sm text-slate-500 font-medium">
                                {t("footer")}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
