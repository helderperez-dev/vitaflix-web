"use client"

import { motion } from "framer-motion"
import { Check, Home, Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useEffect } from "react"

export function ThankYouView() {
    const t = useTranslations("Landing.ThankYou")
    
    useEffect(() => {
        // Trigger Meta Pixel Lead event
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'Lead');
        }
    }, []);

    return (
        <section className="relative overflow-hidden pt-32 pb-16 lg:pt-48 lg:pb-32 min-h-screen flex items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-[#FAFCFF]" />
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-sky-100/60 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[20%] h-[400px] w-[400px] rounded-full bg-teal-50/80 blur-[80px]" />
            </div>

            <div className="w-full max-w-4xl mx-auto px-4 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/95 border border-white/60 shadow-2xl rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-8"
                    >
                        <Check className="w-10 h-10 text-emerald-600" />
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 font-['Poppins',sans-serif]"
                    >
                        {t("title")}
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-primary font-bold mb-8"
                    >
                        {t("subtitle")}
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="max-w-xl mx-auto mb-12"
                    >
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4 text-left">
                            <div className="mt-1 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                {t("description")}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Link 
                            href="/"
                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
                        >
                            <Home className="w-5 h-5" />
                            {t("buttonHome")}
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
