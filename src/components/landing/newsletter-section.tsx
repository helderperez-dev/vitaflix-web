"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { NewsletterForm } from "./newsletter-form"

export function NewsletterSection() {
    const t = useTranslations("Landing.Newsletter")
    return (
        <section className="relative overflow-hidden py-24 bg-white border-t border-slate-100">
            <div className="container relative z-10 mx-auto px-4 sm:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {t("title")}
                        </h2>
                        <p className="mb-8 text-lg text-slate-600">
                            {t("subtitle")}
                        </p>
                        
                        <div className="mx-auto max-w-md">
                            <NewsletterForm />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
