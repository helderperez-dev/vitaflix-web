"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

const featureKeys = ["recipes", "quantities", "planning", "substitution", "shopping", "new"]

const RecipeCarousel = dynamic(
    () => import("./recipe-carousel").then((mod) => mod.RecipeCarousel),
    { ssr: false }
)

export function FounderSection() {
    const t = useTranslations("Landing.Founder")
    const carouselWrapperRef = useRef<HTMLDivElement>(null)
    const [shouldRenderCarousel, setShouldRenderCarousel] = useState(false)

    useEffect(() => {
        const element = carouselWrapperRef.current
        if (!element || typeof window === "undefined") return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setShouldRenderCarousel(true)
                    observer.disconnect()
                }
            },
            { rootMargin: "300px 0px", threshold: 0.01 }
        )
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#f8fbff] to-white py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-8 left-1/2 h-72 w-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <h2 className="mb-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">{t("title")}</h2>
                </div>

                <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {featureKeys.map((key, index) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
                        >
                            <div className="shrink-0 rounded-full text-emerald-500">
                                <CheckCircle2 className="size-6" />
                            </div>
                            <span className="text-[15px] font-medium text-slate-700">{t(`features.${key}`)}</span>
                        </motion.div>
                    ))}
                </div>

                <div ref={carouselWrapperRef} className="mt-16">
                    {shouldRenderCarousel ? (
                        <RecipeCarousel />
                    ) : (
                        <div className="h-[34rem] rounded-[2rem] border border-slate-200/70 bg-gradient-to-b from-white to-slate-100/70" />
                    )}
                    <div className="mt-10 flex justify-center">
                        <Link 
                            href="/checkout"
                            className="inline-flex h-14 items-center justify-center rounded-full bg-slate-900 hover:bg-slate-800 px-10 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto gap-2"
                        >
                            {t("button")}
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
