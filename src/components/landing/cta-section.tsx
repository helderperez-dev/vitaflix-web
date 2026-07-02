"use client"

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
                        
                        <div className="mx-auto max-w-xl text-center">
                            <div className="mb-6 flex flex-col items-center justify-center gap-4">
                                <Link href="/checkout" className="inline-flex h-14 items-center justify-center rounded-full bg-slate-900 hover:bg-slate-800 px-10 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto gap-3">
                                    {t("button")}
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                                
                                <div className="flex items-center justify-center gap-4 text-sm font-medium text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <svg viewBox="0 0 384 512" fill="currentColor" className="h-[14px] w-[14px]">
                                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                                        </svg>
                                        iOS
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                    <div className="flex items-center gap-1.5">
                                        <svg viewBox="0 0 512 512" fill="currentColor" className="h-[14px] w-[14px]">
                                            <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                                        </svg>
                                        Android
                                    </div>
                                </div>
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
