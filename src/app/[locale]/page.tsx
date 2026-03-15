"use client"

import { useEffect, useState } from "react"
import { HeroSection } from "@/components/landing/hero-section"
import { PainPoints } from "@/components/landing/pain-points"
import { SolutionFeatures } from "@/components/landing/solution-features"
import { FounderSection } from "@/components/landing/founder-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingTable } from "@/components/landing/pricing-table"
import { FaqSection } from "@/components/landing/faq-section"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function LandingPage() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 16)

        handleScroll()
        window.addEventListener("scroll", handleScroll, { passive: true })

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#f7fcfa] to-[#f5f8ff] text-foreground font-sans selection:bg-primary/30">
            <header className="fixed inset-x-0 top-0 z-50">
                <div className={cn(
                    "mx-auto flex w-full max-w-[90rem] items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300",
                    isScrolled
                        ? "mt-3 h-[4.25rem] max-w-[78rem] rounded-2xl border border-slate-200/70 bg-white/90 shadow-lg shadow-slate-900/5 backdrop-blur-xl"
                        : "h-24 bg-transparent"
                )}>
                    <div className={cn(
                        "flex items-center transition-all duration-300",
                        isScrolled ? "gap-8" : "gap-12"
                    )}>
                        <div className="flex items-center justify-center">
                            <Image src="/vitaflix_logo_light_mode.png" alt="Vitaflix" width={130} height={30} className="h-8 w-auto opacity-100" priority />
                        </div>
                        
                        <nav className={cn(
                            "hidden items-center text-sm font-semibold text-slate-700 md:flex transition-all duration-300",
                            isScrolled ? "gap-7" : "gap-9"
                        )}>
                            <Link href="#beneficios" className="hover:text-primary transition-all">Benefícios</Link>
                            <Link href="#sobre" className="hover:text-primary transition-all">Método</Link>
                            <Link href="#testemunhos" className="hover:text-primary transition-all">Testemunhos</Link>
                            <Link href="#pricing" className="hover:text-primary transition-all">Preços</Link>
                            <Link href="#faq" className="hover:text-primary transition-all">FAQ</Link>
                        </nav>
                    </div>

                    <div>
                        <Link href="#waitlist" className="inline-flex h-11 items-center rounded-full bg-slate-900 hover:bg-slate-800 px-7 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:scale-105 active:scale-95">
                            Acesso antecipado
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex flex-col min-h-screen overflow-hidden">
                <HeroSection />
                <div id="beneficios">
                    <PainPoints />
                    <SolutionFeatures />
                </div>
                <div id="sobre">
                    <FounderSection />
                </div>
                <div id="testemunhos">
                    <TestimonialsSection />
                </div>
                <div id="pricing">
                    <PricingTable />
                </div>
                <div id="faq">
                    <FaqSection />
                </div>
            </main>

            <footer className="py-12 bg-white/80 border-t border-border/40 text-center">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Vitaflix. Todos os direitos reservados.
                </p>
            </footer>
        </div>
    )
}
