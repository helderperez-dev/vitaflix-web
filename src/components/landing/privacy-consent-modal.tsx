"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

const PRIVACY_CONSENT_STORAGE_KEY = "vitaflix_privacy_consent_v1"
const LEGACY_LGPD_STORAGE_KEY = "vitaflix_lgpd_consent_v1"

export function PrivacyConsentModal() {
    const t = useTranslations("Landing.PrivacyConsentModal")
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const consent = window.localStorage.getItem(PRIVACY_CONSENT_STORAGE_KEY)
        const legacyConsent = window.localStorage.getItem(LEGACY_LGPD_STORAGE_KEY)
        const shouldOpen = consent !== "accepted" && legacyConsent !== "accepted"
        const timer = window.setTimeout(() => setIsOpen(shouldOpen), 0)
        return () => window.clearTimeout(timer)
    }, [])

    const handleAccept = () => {
        window.localStorage.setItem(PRIVACY_CONSENT_STORAGE_KEY, "accepted")
        setIsOpen(false)
    }

    if (!isOpen) {
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed left-3 right-3 bottom-3 z-[60] sm:left-6 sm:right-auto sm:bottom-6 sm:max-w-sm"
        >
            <div className="rounded-2xl border border-emerald-100/80 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-md sm:p-5">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t("badge")}
                </div>
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">{t("title")}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{t("description")}</p>
                <Button
                    onClick={handleAccept}
                    size="sm"
                    className="mt-4 h-9 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                    {t("confirm")}
                </Button>
            </div>
        </motion.div>
    )
}
