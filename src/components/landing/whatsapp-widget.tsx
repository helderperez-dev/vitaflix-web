"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

export function WhatsAppWidget() {
    const t = useTranslations("Landing.WhatsApp")
    const whatsappUrl = `https://wa.me/351915466286?text=${encodeURIComponent(t("message"))}`

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5, type: "spring" }}
            className="fixed bottom-6 right-6 z-50 group"
        >
            <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block w-20 h-20 hover:scale-110 transition-transform duration-300 origin-bottom-right"
            >
                {/* Tooltip-like bubble */}
                <div className="absolute -top-10 right-0 bg-white px-3 py-1.5 rounded-2xl rounded-tr-none shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-slate-100 pointer-events-none">
                    <p className="text-xs font-bold text-slate-700">{t("text")}</p>
                </div>

                <Image
                    src="/images/bruninho.png"
                    alt="Fale com o Bruninho"
                    width={80}
                    height={80}
                    className="object-contain drop-shadow-2xl"
                    priority
                />
            </Link>
        </motion.div>
    )
}
