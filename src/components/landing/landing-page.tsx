"use client"

import { useEffect, useState } from "react"
import { HeroSection } from "@/components/landing/hero-section"
import { PainPoints } from "@/components/landing/pain-points"
import { SolutionFeatures } from "@/components/landing/solution-features"
import { FounderSection } from "@/components/landing/founder-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingTable } from "@/components/landing/pricing-table"
import { FaqSection } from "@/components/landing/faq-section"
import { CtaSection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { WhatsAppWidget } from "@/components/landing/whatsapp-widget"
import { LanguageSwitcher } from "@/components/landing/language-switcher"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function LandingPage() {
    const t = useTranslations("Landing.Header")
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 16)

        handleScroll()
        window.addEventListener("scroll", handleScroll, { passive: true })

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        const element = document.getElementById("hero-waitlist-input")
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
            setTimeout(() => {
                element.focus()
            }, 500)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#f7fcfa] to-[#f5f8ff] text-foreground font-sans selection:bg-primary/30">
            <header className="fixed inset-x-0 top-0 z-50">
                <div className={cn(
                    "mx-auto flex w-full max-w-[90rem] items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300",
                    isScrolled
                        ? "mt-3 w-[calc(100%-1.5rem)] md:w-full h-[4.25rem] max-w-[78rem] rounded-2xl border border-slate-200/70 bg-white/90 shadow-lg shadow-slate-900/5 backdrop-blur-xl"
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
                            <Link href="#beneficios" className="hover:text-primary transition-all">{t("benefits")}</Link>
                            <Link href="#sobre" className="hover:text-primary transition-all">{t("method")}</Link>
                            <Link href="#testemunhos" className="hover:text-primary transition-all">{t("testimonials")}</Link>
                            <Link href="#pricing" className="hover:text-primary transition-all">{t("pricing")}</Link>
                            <Link href="#faq" className="hover:text-primary transition-all">{t("faq")}</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block">
                            <LanguageSwitcher />
                        </div>
                        <Link 
                            href="#waitlist" 
                            onClick={handleCtaClick}
                            className="hidden sm:inline-flex h-11 items-center rounded-full bg-slate-900 hover:bg-slate-800 px-7 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:scale-105 active:scale-95"
                        >
                            {t("cta")}
                        </Link>

                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <button className="md:hidden p-2 text-slate-700 hover:text-primary transition-colors">
                                    <Menu className="h-6 w-6" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col h-full p-0 gap-0">
                                <SheetHeader className="p-6 border-b border-slate-100">
                                    <SheetTitle className="sr-only">Menu</SheetTitle>
                                    <div className="flex items-center justify-start">
                                        <Image src="/vitaflix_logo_light_mode.png" alt="Vitaflix" width={110} height={25} className="h-7 w-auto" priority />
                                    </div>
                                </SheetHeader>
                                <nav className="flex flex-col p-4 gap-1 overflow-y-auto flex-1">
                                    <Link 
                                        href="#beneficios" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="flex items-center h-12 px-4 text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        {t("benefits")}
                                    </Link>
                                    <Link 
                                        href="#sobre" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="flex items-center h-12 px-4 text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        {t("method")}
                                    </Link>
                                    <Link 
                                        href="#testemunhos" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="flex items-center h-12 px-4 text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        {t("testimonials")}
                                    </Link>
                                    <Link 
                                        href="#pricing" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="flex items-center h-12 px-4 text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        {t("pricing")}
                                    </Link>
                                    <Link 
                                        href="#faq" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="flex items-center h-12 px-4 text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        {t("faq")}
                                    </Link>
                                </nav>

                                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-sm font-medium text-slate-500">{t("language")}</span>
                                        <LanguageSwitcher />
                                    </div>
                                    <Link 
                                        href="#waitlist" 
                                        onClick={(e) => {
                                            handleCtaClick(e);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 px-6 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] w-full"
                                    >
                                        {t("cta")}
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
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
                <CtaSection />
            </main>

            <WhatsAppWidget />
            <Footer />
        </div>
    )
}
