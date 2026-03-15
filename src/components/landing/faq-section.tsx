"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

const faqKeys = ["cancel", "devices", "support", "shopping", "diet", "payments"]

export function FaqSection() {
    const t = useTranslations("Landing.Faq")
    return (
        <section className="relative bg-white py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 right-8 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
            </div>
            <div className="container mx-auto max-w-3xl px-4">
                <div className="mb-16 text-center">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("label")}</p>
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">{t("title")}</h2>
                    <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqKeys.map((key, i) => (
                            <AccordionItem key={key} value={`item-${i}`} className="rounded-2xl border border-border/60 bg-white/95 px-6 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-md">
                                <AccordionTrigger className="py-6 text-left text-lg font-bold hover:text-primary hover:no-underline transition-colors">
                                    {t(`items.${key}.q`)}
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
                                    {t(`items.${key}.a`)}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    )
}
