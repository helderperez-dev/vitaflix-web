"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { Play } from "lucide-react"
import { useTranslations } from "next-intl"
import { WaitlistForm } from "./waitlist-form"

export function WelcomeVideoSection() {
    const t = useTranslations("Landing.VideoIntro")
    const sectionRef = useRef<HTMLElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    })
    const smoothScroll = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 24,
        mass: 0.5,
    })
    const posterY = useTransform(smoothScroll, [0, 1], [-56, 56])
    const posterScale = useTransform(smoothScroll, [0, 1], [1.08, 1.2])

    const handlePlay = () => {
        if (!videoRef.current) return
        requestAnimationFrame(async () => {
            if (!videoRef.current) return
            try {
                await videoRef.current.play()
                setIsPlaying(true)
            } catch {
                setIsPlaying(false)
            }
        })
    }

    return (
        <section ref={sectionRef} className="relative py-20 sm:py-24">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute left-[12%] top-6 h-48 w-48 rounded-full bg-primary/10 blur-[90px]" />
                <div className="absolute right-[10%] bottom-10 h-56 w-56 rounded-full bg-emerald-200/40 blur-[90px]" />
            </div>

            <div className="container relative mx-auto px-4 sm:px-6">
                <div className="mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        className="text-center mb-8"
                    >
                        <p className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/85 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600 shadow-sm">
                            {t("badge")}
                        </p>
                        <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                            {t("title")}
                        </h2>
                        <p className="mt-3 text-sm sm:text-base font-medium text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            {t("subtitle")}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="relative overflow-hidden rounded-[1.9rem] shadow-[0_28px_70px_-34px_rgba(15,23,42,0.45)]"
                    >
                        <div className="relative overflow-hidden rounded-[1.9rem] bg-transparent aspect-video">
                            {!isPlaying && (
                                <motion.div
                                    aria-hidden
                                    className="absolute inset-0"
                                    style={{
                                        y: posterY,
                                        scale: posterScale,
                                        backgroundImage: "url('/images/thumbnail-welcome.png')",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                />
                            )}
                            <motion.video
                                ref={videoRef}
                                controls={isPlaying}
                                poster="/images/thumbnail-welcome.png"
                                className="block h-full w-full object-cover"
                                preload="metadata"
                                style={{ opacity: isPlaying ? 1 : 0 }}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={() => {
                                    setIsPlaying(false)
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = 0
                                    }
                                }}
                            >
                                <source src="/videos/welcome.mp4" type="video/mp4" />
                            </motion.video>

                            {!isPlaying && (
                                <button
                                    type="button"
                                    onClick={handlePlay}
                                    className="absolute inset-0 flex items-center justify-center group"
                                    aria-label={t("play")}
                                >
                                    <span className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/18 to-transparent transition-opacity group-hover:opacity-80" />
                                    <span className="relative inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border border-white/45 bg-white/20 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_15px_45px_rgba(15,23,42,0.4)] transition-all duration-300 group-hover:scale-105 group-hover:bg-white/25">
                                        <Play className="h-8 w-8 sm:h-9 sm:w-9 text-white fill-white ml-1 drop-shadow-lg" />
                                    </span>
                                </button>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                        className="mt-6 flex flex-col items-center justify-center"
                    >
                        <p className="mb-3 text-center text-sm sm:text-base font-semibold text-slate-700">
                            {t("urgency")}
                        </p>
                        <div className="w-full max-w-[980px]">
                            <WaitlistForm inputId="video-waitlist-input" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
