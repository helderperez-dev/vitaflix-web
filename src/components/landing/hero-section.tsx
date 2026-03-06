"use client"

import { WaitlistForm } from "./waitlist-form"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

    return (
        <section
            ref={containerRef}
            className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-24"
        >
            {/* Background elements */}
            <motion.div
                style={{ y, opacity }}
                className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none"
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px]" />
            </motion.div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 flex flex-col items-center text-center">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acesso Antecipado</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/50 leading-[1.1] pb-2">
                        Nunca mais <br /><span className="text-primary mix-blend-plus-lighter">fiques sem ideias.</span>
                    </h1>

                    <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                        Mais de 300 receitas reais e práticas que se adaptam à tua vida ocupada e aos teus objetivos.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="mt-12 w-full max-w-md relative"
                >
                    <div className="absolute -inset-x-4 -inset-y-4 bg-gradient-to-b from-white/5 to-transparent blur-xl rounded-[3rem] z-0" />
                    <WaitlistForm />
                </motion.div>

                {/* Hero App Preview mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
                    className="mt-24 w-full max-w-5xl mx-auto relative perspective"
                >
                    <div className="relative rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl bg-black/50 backdrop-blur-xl overflow-hidden aspect-video transform-gpu rotate-x-[15deg] hover:rotate-x-0 transition-transform duration-1000">
                        <div className="absolute inset-x-0 top-0 h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                            <div className="size-3 rounded-full bg-red-400/80" />
                            <div className="size-3 rounded-full bg-yellow-400/80" />
                            <div className="size-3 rounded-full bg-green-400/80" />
                        </div>
                        {/* Placeholder for the app UI screenshot */}
                        <div className="absolute inset-0 mt-10 p-4 sm:p-8 bg-[url('https://placekitten.com/1280/720')] bg-cover bg-center mix-blend-overlay opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                            <h3 className="text-xl sm:text-3xl font-bold bg-black/50 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">O teu plano semanal</h3>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
