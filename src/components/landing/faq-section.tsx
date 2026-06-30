"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

const faqKeys = ["calories", "plan", "support", "custom", "restrictions", "shopping", "android", "cancel"]

export function FaqSection() {
    const t = useTranslations("Landing.Faq")
    return (
        <section className="relative bg-white py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 right-8 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
            </div>
            <div className="container mx-auto max-w-3xl px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">{t("title")}</h2>
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
                                <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground flex flex-col items-start gap-4">
                                    <p>{t(`items.${key}.a`)}</p>
                                    {key === "support" && (
                                        <a 
                                            href="https://wa.me/351915466286?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20acompanhamento%20personalizado." 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {t("items.support.cta")}
                                        </a>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    )
}
