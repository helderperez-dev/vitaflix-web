"use client"

import Image from "next/image"
import { useRef } from "react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { Quote, Star } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

const testimonials = [
    {
        key: "raquel",
        image: "/avatars/raquel_araujo.png"
    },
    {
        key: "vania",
        image: "/avatars/vania_gandra.png"
    },
    {
        key: "filomena",
        image: "/avatars/filomena_bras.png"
    },
    {
        key: "carolina",
        image: "/avatars/carolina_pinto.png"
    },
    {
        key: "bia",
        image: "/avatars/bianca_antunes.png"
    }
] as const

const confettiPieces = Array.from({ length: 32 }, (_, index) => {
    const colors = ["#10b981", "#22c55e", "#0ea5e9", "#6366f1", "#14b8a6"]

    return {
        id: `piece-${index}`,
        left: `${(index * 97) % 100}%`,
        width: 5 + (index % 4),
        height: 10 + ((index * 3) % 10),
        delay: (index % 6) * 0.35,
        duration: 7 + (index % 5) * 1.2,
        drift: ((index % 2 === 0 ? 1 : -1) * (18 + (index % 4) * 8)),
        rotateStart: (index * 23) % 360,
        rotateEnd: ((index * 23) % 360) + 280,
        color: colors[index % colors.length],
        opacity: 0.48 + (index % 4) * 0.1,
        radius: index % 3 === 0 ? 999 : 2
    }
})

export function TestimonialsSection() {
    const t = useTranslations("Landing.Testimonials")
    const sectionRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 95,
        damping: 28,
        mass: 0.22
    })
    const confettiOpacity = useTransform(smoothProgress, [0, 0.08, 0.9, 1], [0, 0.95, 0.95, 0])
    const cardParallax1 = useTransform(smoothProgress, [0, 1], [-8, 12])
    const cardParallax2 = useTransform(smoothProgress, [0, 1], [-5, 8])
    const cardParallax3 = useTransform(smoothProgress, [0, 1], [-10, 14])
    const cardParallax4 = useTransform(smoothProgress, [0, 1], [-6, 10])
    const cardParallax5 = useTransform(smoothProgress, [0, 1], [-12, 16])
    const cardParallax = [cardParallax1, cardParallax2, cardParallax3, cardParallax4, cardParallax5]

    return (
        <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-white py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 h-64 w-[34rem] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
                <div className="absolute right-0 top-1/3 h-56 w-56 rounded-full bg-emerald-200/25 blur-3xl" />
                <div className="absolute left-0 bottom-12 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6">
                <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("label")}</p>
                    <h2 className="mb-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">{t("title")}</h2>
                    <p className="mx-auto max-w-2xl text-base text-slate-600 md:text-lg">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-12">
                    {testimonials.map((item, index) => (
                        <motion.article
                            key={item.key}
                            style={{ y: cardParallax[index] }}
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.08 }}
                            className={cn(
                                "group relative flex h-auto flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:col-span-1 xl:col-span-4 xl:h-[32rem]",
                                index === 3 && "xl:col-start-3",
                                index === 4 && "xl:col-start-7"
                            )}
                        >
                            <div className="absolute inset-x-0 -top-20 h-40 bg-gradient-to-b from-emerald-100/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                            <div className="relative mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-md ring-1 ring-slate-200">
                                        <Image src={item.image} alt={t(`items.${item.key}.name`)} fill className="object-cover" sizes="56px" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{t(`items.${item.key}.name`)}</p>
                                        <p className="text-xs text-slate-500">{t(`items.${item.key}.role`)}</p>
                                    </div>
                                </div>
                                <Quote className="size-4 text-primary/60 transition-transform duration-300 group-hover:scale-110" />
                            </div>

                            <div className="relative overflow-visible xl:flex-1 xl:overflow-y-auto xl:pr-1">
                                <p className="text-[15px] leading-relaxed text-slate-600 whitespace-pre-line">{t(`items.${item.key}.quote`)}</p>
                            </div>

                            <div className="relative mt-5 flex shrink-0 items-center gap-1 text-amber-400">
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

            <motion.div style={{ opacity: confettiOpacity }} className="pointer-events-none absolute inset-0 z-20">
                {confettiPieces.map((piece) => (
                    <motion.span
                        key={piece.id}
                        className="absolute -top-10 block shadow-[0_0_8px_rgba(255,255,255,0.45)]"
                        style={{
                            left: piece.left,
                            width: piece.width,
                            height: piece.height,
                            backgroundColor: piece.color,
                            opacity: piece.opacity,
                            borderRadius: piece.radius
                        }}
                        animate={{
                            y: ["-8vh", "108vh"],
                            x: [0, piece.drift, 0],
                            rotate: [piece.rotateStart, piece.rotateEnd]
                        }}
                        transition={{
                            duration: piece.duration,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                            delay: piece.delay
                        }}
                    />
                ))}
            </motion.div>
        </section>
    )
}
