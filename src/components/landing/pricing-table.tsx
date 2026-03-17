"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

const planKeys = ["monthly", "quarterly", "annual"]

const planFeatureKeys = {
    monthly: ["recipes", "planning", "list", "filters", "price"],
    quarterly: ["recipes", "planning", "list", "filters", "price"],
    annual: ["recipes", "planning", "list", "filters", "updates", "price"]
}

const planHighlights = {
    quarterly: true
}

const planPrices = {
    monthly: "12,99 €",
    quarterly: "29,99 €",
    annual: "89,99 €"
}

const planDiscounts = {
    quarterly: "23%",
    annual: "42%"
}

export function PricingTable() {
    const t = useTranslations("Landing.Pricing")

    const handleStartNowClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        const input = document.getElementById("hero-waitlist-input")
        if (!input) return
        input.scrollIntoView({ behavior: "smooth", block: "center" })
        setTimeout(() => {
            ;(input as HTMLInputElement).focus()
        }, 500)
    }

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f7fcfa] py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-primary/15 blur-[120px]" />
            </div>
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">{t("label")}</p>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance">{t("title")}</h2>
                    <p className="text-lg text-muted-foreground text-balance">{t("subtitle")}</p>
                </div>

                <div className="grid max-w-6xl gap-8 md:grid-cols-3 md:items-stretch mx-auto">
                    {planKeys.map((key, i) => {
                        const isHighlight = planHighlights[key as keyof typeof planHighlights]
                        const features = planFeatureKeys[key as keyof typeof planFeatureKeys]
                        const discount = planDiscounts[key as keyof typeof planDiscounts]
                        
                        return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`relative flex h-full min-h-[41rem] flex-col rounded-[2.5rem] border bg-white p-8 shadow-lg transition-all duration-300
                                ${isHighlight
                                    ? 'z-10 border-primary shadow-2xl shadow-primary/20 ring-1 ring-primary/20 md:-mt-6'
                                    : 'border-border/40 hover:-translate-y-2 hover:shadow-xl'
                                }
                            `}
                        >
                            {isHighlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-emerald-400 text-white text-xs font-bold uppercase tracking-[0.14em] py-2 px-4 rounded-full shadow-md">
                                    {t(`plans.${key}.tag`)}
                                </div>
                            )}

                            <div className="mb-6 min-h-20">
                                <h3 className="text-xl font-bold">{t(`plans.${key}.name`)}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{t(`plans.${key}.desc`)}</p>
                            </div>

                            <div className="mb-8 min-h-24">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl md:text-5xl font-black tracking-tight">{planPrices[key as keyof typeof planPrices]}</span>
                                    <span className="text-muted-foreground font-medium">{t(`plans.${key}.period`)}</span>
                                </div>
                                {discount && (
                                    <span className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-primary">
                                        -{discount}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4 flex-1">
                                {features.map((featureKey, j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className="size-5 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Check className="size-3 text-primary stroke-[3]" />
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground">{t(`plans.${key}.features.${featureKey}`)}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="#waitlist" onClick={handleStartNowClick} className={`mt-8 inline-flex h-14 w-full items-center justify-center rounded-full px-6 text-sm font-bold transition-all
                                ${isHighlight
                                    ? 'bg-primary text-white hover:bg-primary/90'
                                    : 'bg-muted/60 text-foreground hover:bg-muted'
                                }
                            `}>
                                {t("button")}
                            </Link>
                        </motion.div>
                    )})}
                </div>
            </div>
        </section>
    )
}
