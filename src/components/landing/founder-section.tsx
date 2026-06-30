"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowUp } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
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
                        <Button 
                            size="lg" 
                            asChild
                            className="rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-2"
                        >
                            <Link href="/checkout">
                                {t("button")}
                                <ArrowUp className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
