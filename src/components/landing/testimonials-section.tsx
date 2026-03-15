"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Quote, Star } from "lucide-react"
import { useTranslations } from "next-intl"

const testimonialKeys = ["marta", "diogo", "ines"]

const testimonialImages = {
    marta: "/avatars/persona-marta.svg",
    diogo: "/avatars/persona-diogo.svg",
    ines: "/avatars/persona-ines.svg"
}

export function TestimonialsSection() {
    const t = useTranslations("Landing.Testimonials")
    return (
        <section className="relative overflow-hidden bg-white py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 h-64 w-[34rem] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6">
                <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("label")}</p>
                    <h2 className="mb-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">{t("title")}</h2>
                    <p className="mx-auto max-w-2xl text-base text-slate-600 md:text-lg">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
                    {testimonialKeys.map((key, index) => (
                        <motion.article
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.45, delay: index * 0.08 }}
                            className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-200">
                                        <Image src={testimonialImages[key as keyof typeof testimonialImages]} alt={key} fill className="object-cover" sizes="48px" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 capitalize">{key}</p>
                                        <p className="text-xs text-slate-500">{t(`items.${key}.role`)}</p>
                                    </div>
                                </div>
                                <Quote className="size-4 text-primary/60" />
                            </div>

                            <p className="text-[15px] leading-relaxed text-slate-600">{t(`items.${key}.quote`)}</p>

                            <div className="mt-5 flex items-center gap-1 text-amber-400">
                                <Star className="size-4 fill-current" />
                                <Star className="size-4 fill-current" />
                                <Star className="size-4 fill-current" />
                                <Star className="size-4 fill-current" />
                                <Star className="size-4 fill-current" />
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    )
}
