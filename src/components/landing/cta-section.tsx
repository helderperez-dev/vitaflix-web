"use client"

import { WaitlistForm } from "./waitlist-form"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

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
                            {t("title")}
                        </h2>
                        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 md:text-xl leading-relaxed">
                            {t("subtitle")}
                        </p>
                        
                        <div className="mx-auto max-w-xl text-left">
                            <div className="mb-8 text-center">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">{t("iphone.title")}</h3>
                                <Link href="/checkout" className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 px-8 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto">
                                    {t("iphone.button")}
                                </Link>
                            </div>
                            
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm text-center">
                                <h3 className="text-sm font-bold text-slate-900 mb-2">{t("android.title")}</h3>
                                <p className="text-xs text-slate-600 mb-4">{t("android.desc")}</p>
                                <WaitlistForm />
                            </div>
                            
                            <p className="mt-8 text-sm text-slate-500 font-medium text-center">
                                {t("footer")}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
