"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from "framer-motion"
import {
    CheckCircle2, Play, ChevronDown, Star, ArrowRight, ShieldCheck,
    ChevronLeft, ChevronRight, VolumeX, Volume2, Quote, Zap, Calendar,
    ShoppingCart, Clock, Flame, X, Check, XCircle,
    BadgeCheck, Lock, Sparkles, Trophy, Heart
} from "lucide-react"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { PrivacyConsentModal } from "@/components/landing/privacy-consent-modal"

/* ─────────────────────────────────────────────
   COUNTDOWN HOOK (Global Sync)
───────────────────────────────────────────── */
let globalEndTime: number | null = null;

function useCountdown(initialMinutes = 17, initialSeconds = 43) {
    const [time, setTime] = useState({ m: initialMinutes, s: initialSeconds })
    
    useEffect(() => {
        // Initialize global end time only once per page load
        if (!globalEndTime) {
            globalEndTime = Date.now() + (initialMinutes * 60 + initialSeconds) * 1000;
        }

        const t = setInterval(() => {
            if (!globalEndTime) return;
            const now = Date.now();
            const diff = globalEndTime - now;
            
            if (diff <= 0) {
                setTime({ m: 0, s: 0 });
                clearInterval(t);
                return;
            }
            
            const totalSeconds = Math.floor(diff / 1000);
            setTime({
                m: Math.floor(totalSeconds / 60),
                s: totalSeconds % 60
            });
        }, 1000)
        
        return () => clearInterval(t)
    }, [initialMinutes, initialSeconds])
    
    return time
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true })
    useEffect(() => {
        if (!inView) return
        let start = 0
        const duration = 1800
        const step = target / (duration / 16)
        const timer = setInterval(() => {
            start += step
            if (start >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(start))
        }, 16)
        return () => clearInterval(timer)
    }, [inView, target])
    return <span ref={ref}>{count.toLocaleString("pt-PT")}{suffix}</span>
}

/* ─────────────────────────────────────────────
   PURCHASE TOAST
───────────────────────────────────────────── */
const toastData = [
    { name: "Ana S.", city: "Lisboa" }, { name: "Margarida F.", city: "Porto" },
    { name: "Catarina M.", city: "Braga" }, { name: "Inês R.", city: "Coimbra" },
    { name: "Beatriz L.", city: "Setúbal" }, { name: "Sofia P.", city: "Faro" },
    { name: "Marta C.", city: "Aveiro" }, { name: "Joana T.", city: "Viseu" },
    { name: "Rita A.", city: "Évora" }, { name: "Filipa N.", city: "Leiria" },
    { name: "Daniela O.", city: "Funchal" }, { name: "Patrícia V.", city: "Guimarães" },
    { name: "Leonor B.", city: "Viana do Castelo" }, { name: "Cláudia S.", city: "Santarém" },
    { name: "Mariana J.", city: "Cascais" }, { name: "Teresa D.", city: "Portimão" },
    { name: "Sílvia M.", city: "Almada" }, { name: "Helena G.", city: "Beja" },
    { name: "Carla R.", city: "Castelo Branco" }, { name: "Diana P.", city: "Ponta Delgada" },
    { name: "Vanessa C.", city: "Odivelas" }, { name: "Lara F.", city: "Amadora" },
    { name: "Mafalda S.", city: "Matosinhos" }, { name: "Bárbara N.", city: "Vila Real" },
    { name: "Andreia V.", city: "Loures" }, { name: "Bruna M.", city: "Barreiro" },
    { name: "Carolina T.", city: "Gondomar" }, { name: "Madalena P.", city: "Seixal" },
    { name: "Jéssica L.", city: "Vila Franca de Xira" }, { name: "Raquel C.", city: "Maia" },
    { name: "Tatiana R.", city: "Oeiras" }, { name: "Íris M.", city: "Famalicão" },
    { name: "Nádia F.", city: "Sintra" }, { name: "Neuza D.", city: "Rio Tinto" },
    { name: "Alexandra P.", city: "Póvoa de Varzim" }, { name: "Célia M.", city: "Valongo" },
    { name: "Vera S.", city: "Ermesinde" }, { name: "Paula G.", city: "Figueira da Foz" },
    { name: "Sónia C.", city: "Porto Salvo" }, { name: "Rute L.", city: "Caldas da Rainha" },
]

function PurchaseToast() {
    const [idx, setIdx] = useState<number | null>(null)
    const [visible, setVisible] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 600)
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        // Randomize the start index so it's different on every page load
        let i = Math.floor(Math.random() * toastData.length)
        const show = () => {
            i = (i + 1) % toastData.length
            setIdx(i); setVisible(true)
            setTimeout(() => setVisible(false), 4500)
        }
        const t = setTimeout(() => { show(); const iv = setInterval(show, 8000); return () => clearInterval(iv) }, 4000)
        return () => clearTimeout(t)
    }, [])
    const n = idx !== null ? toastData[idx] : null
    return (
        <AnimatePresence>
            {visible && n && (
                <motion.div
                    initial={{ opacity: 0, x: -100, y: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                    className={cn(
                        "fixed left-4 z-[60] flex items-center gap-3 rounded-2xl border border-emerald-100/60 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.08)] max-w-[270px] transition-all duration-300",
                        isScrolled ? "bottom-20 sm:bottom-24" : "bottom-6"
                    )}
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-base font-black shadow-md">
                        {n.name[0]}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                            {n.name} <span className="font-medium text-slate-400">de</span> {n.city}
                        </p>
                        <p className="mt-0.5 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> acabou de subscrever
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

/* ─────────────────────────────────────────────
   STICKY BOTTOM CTA BAR
───────────────────────────────────────────── */
function StickyBottomBar() {
    const [show, setShow] = useState(false)
    useEffect(() => {
        const fn = () => setShow(window.scrollY > 600)
        window.addEventListener("scroll", fn, { passive: true })
        return () => window.removeEventListener("scroll", fn)
    }, [])
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 inset-x-0 z-[55] border-t border-slate-200/60 bg-white/95 px-4 py-3 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
                >
                    <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
                        <div className="hidden sm:block min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">Vitaflix · Oferta especial ativa</p>
                            <p className="text-xs font-semibold text-slate-500">Cancela quando quiseres · Sem fidelização</p>
                        </div>
                        <Link
                            href="/checkout"
                            className="group relative overflow-hidden flex h-12 flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)] transition-all hover:bg-emerald-700 active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <span className="relative z-10 sm:hidden whitespace-nowrap text-sm">Garantir oferta especial</span>
                            <span className="relative z-10 hidden sm:flex items-center gap-2 whitespace-nowrap">
                                Garantir oferta especial
                                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export function LandingPageV2() {
    return (
        <div className="min-h-screen bg-white text-slate-900 antialiased">
            <UrgencyTopBar />
            <Header />
            <main>
                <HeroSection />
                <TrustBar />
                <ProblemSection />
                <VideoSection />
                <HowItWorksSection />
                <AppShowcaseSection />
                <StatsSection />
                <RecipesSection />
                <BeforeAfterSection />
                <TestimonialsSection />
                <SocialProofWallSection />
                <ComparisonSection />
                <FounderSection />
                <GuaranteeSection />
                <UrgencyBlock />
                <PricingSection />
                <FaqSection />
                <FinalCtaSection />
            </main>
            <Footer />
            <PrivacyConsentModal />
            <PurchaseToast />
            <StickyBottomBar />
        </div>
    )
}

/* ─────────────────────────────────────────────
   URGENCY TOP BAR
───────────────────────────────────────────── */
function UrgencyTopBar() {
    const { m, s } = useCountdown()
    const [dismissed, setDismissed] = useState(false)
    if (dismissed) return null
    return (
        <div className="relative z-[56] bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 px-8 py-2 text-center text-xs font-bold text-white sm:text-sm sm:py-2.5">
            <div className="flex items-center justify-center gap-2 flex-nowrap">
                <Flame className="h-3.5 w-3.5 text-amber-400 shrink-0 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">
                    Poupa até <span className="text-amber-400">33%</span> · Termina em{" "}
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/20 px-1.5 py-0.5 font-black tabular-nums">
                        <Clock className="h-3 w-3" />
                        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
                    </span>
                </span>
                <Link href="/checkout" className="rounded-full bg-white text-emerald-700 px-2.5 py-0.5 text-[11px] font-black hover:bg-emerald-50 transition-colors shrink-0 sm:text-xs sm:px-3">
                    Ver oferta
                </Link>
            </div>
            <button onClick={() => setDismissed(true)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}

/* ─────────────────────────────────────────────
   HEADER
───────────────────────────────────────────── */
function Header() {
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 24)
        window.addEventListener("scroll", fn, { passive: true })
        return () => window.removeEventListener("scroll", fn)
    }, [])
    return (
        <header className={cn("fixed inset-x-0 z-50 transition-all duration-500", scrolled ? "top-0 py-2" : "top-8 py-2")}>
            <div className="mx-auto max-w-7xl px-5">
                <div className={cn(
                    "flex items-center justify-between transition-all duration-500",
                    scrolled ? "rounded-2xl border border-slate-200/60 bg-white/90 px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl" : "rounded-2xl border border-transparent bg-transparent px-5 py-3"
                )}>
                    <div className="flex items-center gap-2.5">
                        <Image src="/vitaflix_logo_light_mode.png" alt="Vitaflix" width={30} height={30} className="object-contain" priority />
                        <span className="text-xl font-black tracking-tight text-slate-900">Vitaflix</span>
                    </div>
                    <nav className="hidden items-center gap-8 md:flex">
                        <Link href="#how" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Como funciona</Link>
                        <Link href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Planos</Link>
                        <Link href="#faq" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">FAQ</Link>
                    </nav>
                    <Link href="/checkout" className="group relative overflow-hidden flex h-10 items-center gap-1.5 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-800 hover:scale-105 active:scale-95">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <span className="relative z-10 flex items-center gap-1.5">Começar agora <ArrowRight className="h-4 w-4" /></span>
                    </Link>
                </div>
            </div>
        </header>
    )
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-white pt-28 pb-0 sm:pt-32 lg:pt-40">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-slate-100 blur-[120px]" />
                <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-50 blur-[100px]" />
            </div>
            <div className="mx-auto max-w-6xl px-5">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6 flex justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 shadow-sm sm:text-xs sm:tracking-widest">
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="hidden sm:inline">Disponível para iPhone e Android · </span>Oferta especial ativa
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.08 }}
                    className="mx-auto max-w-[1200px] text-center text-5xl font-bold leading-[1.05] tracking-tighter text-slate-900 sm:text-6xl md:text-7xl lg:text-[4.5rem] xl:text-[5.5rem]"
                >
                    Para de improvisar o que comes.<br className="hidden lg:block" />{" "}
                    <span className="relative inline-block mt-2 sm:mt-0 lg:whitespace-nowrap">
                        <span className="relative z-10 bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-500 bg-clip-text text-transparent">Começa a seguir um plano.</span>
                        {/* Hand-drawn underline */}
                        <svg className="absolute -bottom-2 sm:-bottom-4 left-0 w-full h-3 sm:h-5 text-emerald-400 opacity-60" viewBox="0 0 400 20" preserveAspectRatio="none">
                            <path d="M5,15 Q100,5 200,8 T395,12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.18 }}
                    className="mx-auto mt-7 max-w-2xl text-center text-lg font-medium leading-relaxed text-slate-500 md:text-xl">
                    O Vitaflix dá-te 300+ receitas com quantidades já calculadas, organiza as tuas refeições da semana e cria a lista de compras com um clique — sem contar uma única caloria.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.26 }}
                    className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-3">
                    {["Sem contar calorias", "Quantidades já calculadas", "Lista de compras automática"].map((b) => (
                        <div key={b} className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-50/50 px-4 py-1.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-sm">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />{b}
                        </div>
                    ))}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.34 }}
                    className="relative mt-12 flex flex-col items-center gap-3 px-1">
                    <div className="relative w-full max-w-md">
                        {/* Animated Glow */}
                        <div className="absolute -inset-1 rounded-2xl bg-emerald-500/40 blur-xl animate-[pulse-glow_2.5s_infinite]" />
                        <Link href="/checkout"
                            className="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 px-6 py-4 shadow-[0_8px_30px_rgba(16,185,129,0.3)] ring-1 ring-white/20 transition-all hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-600 hover:scale-[1.02] active:scale-[0.98]">
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            
                            <div className="relative z-10 flex items-center gap-3">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-medium text-emerald-100 line-through">44,99 €</span>
                                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">-33%</span>
                                    </div>
                                    <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white whitespace-nowrap">Começar por 29,99 € / 3 meses</p>
                                    <p className="text-xs font-medium text-emerald-100 sm:text-sm">≈ 10 € / mês · Cancela quando quiseres</p>
                                </div>
                                <ArrowRight className="h-5 w-5 shrink-0 text-white transition-transform group-hover:translate-x-1 sm:h-6 sm:w-6" />
                            </div>
                        </Link>
                    </div>
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="mt-4 text-center text-xs font-medium text-slate-400">
                    <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
                    Sem fidelização. Cancela quando quiseres. Desconto especial por tempo limitado.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }}
                    className="relative mt-16 sm:mt-20">
                    <div className="absolute inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
                    <div className="flex justify-center gap-3 sm:gap-5 px-2 sm:px-6 [mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)]">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={cn("relative shrink-0 overflow-hidden rounded-[1rem] sm:rounded-[2rem] bg-slate-100 shadow-sm",
                                i === 1 || i === 5 ? "w-[16%] translate-y-12 opacity-80" : i === 2 || i === 4 ? "w-[20%] translate-y-6 opacity-90" : "w-[24%] z-10 shadow-xl")}>
                                <div className="aspect-[9/16]">
                                    <Image src={`/videos/thumbnails/hero-${i}.jpg`} alt="" fill className="object-cover" sizes="(max-width: 768px) 20vw, 250px" />
                                </div>
                                <div className="absolute inset-0 rounded-[1rem] sm:rounded-[2rem] ring-1 ring-inset ring-slate-900/10" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   TRUST BAR
───────────────────────────────────────────── */
function TrustBar() {
    return (
        <div className="border-y border-slate-100 bg-slate-50/50 py-6">
            <div className="mx-auto max-w-5xl px-5">
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2.5">
                            {["raquel_araujo.png", "carolina_pinto.png", "filomena_bras.png", "bianca_antunes.png"].map((img) => (
                                <div key={img} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm">
                                    <Image src={`/avatars/${img}`} alt="" fill className="object-cover" sizes="40px" />
                                </div>
                            ))}
                        </div>
                        <div>
                            <div className="flex gap-0.5 text-amber-400">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                            <p className="text-xs font-bold text-slate-600 mt-0.5">Milhares de utilizadores</p>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-200 hidden sm:block" />
                    {[{ n: "300+", label: "Receitas práticas" }, { n: "1 clique", label: "Lista de compras" }, { n: "0", label: "Calorias a contar" }].map(({ n, label }) => (
                        <div key={label} className="text-center">
                            <p className="text-xl font-black text-slate-900 leading-none">{n}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────
   PROBLEM
───────────────────────────────────────────── */
function ProblemSection() {
    return (
        <section className="py-28 bg-white">
            <div className="mx-auto max-w-6xl px-5">
                <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                    <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}>
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-red-500">O problema real</p>
                        <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-slate-900 md:text-5xl">
                            A maioria não falha por falta de vontade.
                            <span className="text-slate-400"> Falha porque decide tudo do zero todos os dias.</span>
                        </h2>
                        <p className="mt-6 text-lg font-medium text-slate-500">Reconheces algum destes padrões?</p>
                        <ul className="mt-6 space-y-3">
                            {[
                                "Chega a hora de comer e ainda não sabes o que preparar",
                                "Voltas às mesmas refeições porque decidir cansa",
                                "Perdes tempo com contas e aplicações complicadas",
                                "Compras sem plano e acabas com a cozinha cheia de improviso",
                                "Começas a semana bem e perdes o fio poucos dias depois",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3 rounded-2xl border border-red-100/50 bg-red-50/40 p-4 shadow-sm transition-colors hover:bg-red-50/80">
                                    <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                                        <X className="h-3.5 w-3.5 text-red-500" />
                                    </div>
                                    <span className="font-semibold text-slate-700 leading-snug">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}
                        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 p-10 text-white shadow-[0_20px_40px_rgba(16,185,129,0.15)] ring-1 ring-white/10 md:p-12">
                        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-[80px]" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-[80px]" />
                        <div className="relative z-10">
                            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">A solução</p>
                            <h3 className="text-3xl font-bold tracking-tight leading-tight md:text-4xl">Foi para quebrar este ciclo que o Vitaflix nasceu.</h3>
                            <p className="mt-5 text-lg font-medium leading-relaxed text-emerald-100/90">
                                Em vez de dependeres de força de vontade todos os dias, passas a usar uma app simples que reduz decisões, clarifica quantidades e facilita a execução.
                            </p>
                            <div className="mt-8 space-y-3">
                                {["Menos fricção.", "Menos ruído mental.", "Mais consistência."].map((t) => (
                                    <div key={t} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm transition-colors hover:bg-white/10">
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                                        <span className="text-lg font-semibold text-white">{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   VIDEO VSL
───────────────────────────────────────────── */
function VideoSection() {
    const [playing, setPlaying] = useState(false)
    return (
        <section className="bg-gradient-to-b from-slate-950 to-emerald-950 py-28 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
            </div>
            <div className="mx-auto max-w-5xl px-5 relative z-10">
                <div className="mb-12 text-center">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Vê a app em ação</p>
                    <h2 className="text-4xl font-bold tracking-tighter text-white md:text-5xl">Em menos de 1 minuto percebes tudo.</h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-emerald-100/80">Escolhe refeições, vê as quantidades e cria a lista de compras — sem complicação.</p>
                </div>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
                    <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 via-transparent to-transparent blur-xl" />
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-emerald-900/40 p-2 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)]">
                        <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-emerald-900">
                            {!playing ? (
                                <>
                                    <Image src="/videos/thumbnails/welcome.jpg" alt="Vitaflix demo" fill className="object-cover opacity-50" priority />
                                    <div className="absolute inset-0 bg-linear-to-t from-emerald-950/80 via-transparent to-transparent" />
                                    <div className="absolute left-5 top-5 flex gap-2">
                                        <span className="rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-md">Demonstração real</span>
                                        <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">~55 seg</span>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-6 px-6">
                                        <p className="text-xl font-bold tracking-tight text-white md:text-2xl">A app Vitaflix em ação</p>
                                    </div>
                                    <button onClick={() => setPlaying(true)} className="absolute inset-0 flex items-center justify-center pt-10 md:pt-0" aria-label="Reproduzir vídeo">
                                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-transform hover:scale-110">
                                            <div className="absolute inset-0 animate-ping rounded-full border-2 border-white opacity-40" style={{ animationDuration: "2s" }} />
                                            <Play className="ml-2 h-10 w-10 fill-emerald-900 text-emerald-900" />
                                        </div>
                                    </button>
                                </>
                            ) : (
                                <video src="/videos/welcome.mp4" controls autoPlay className="h-full w-full object-cover" />
                            )}
                        </div>
                    </div>
                </motion.div>
                <div className="mt-12 flex justify-center">
                    <Link href="/checkout" className="group relative overflow-hidden flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-10 text-base font-bold text-white shadow-[0_8px_30px_rgb(16,185,129,0.2)] transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        Quero começar agora <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
function HowItWorksSection() {
    const steps = [
        { num: "01", icon: <Zap className="h-7 w-7 text-emerald-600" />, title: "Escolhes as refeições", desc: "Mais de 300 receitas práticas para o dia a dia. Pequenos-almoços, almoços, jantares, lanches e doces. Troca o que não gostas com um clique." },
        { num: "02", icon: <Calendar className="h-7 w-7 text-emerald-600" />, title: "Ajustas as quantidades", desc: "A app diz-te exatamente o que precisas comer com base no teu objetivo e no número de refeições do teu dia. Sem calculadoras. Sem contas." },
        { num: "03", icon: <ShoppingCart className="h-7 w-7 text-emerald-600" />, title: "Crias a lista de compras", desc: "Um clique. O Vitaflix transforma as tuas escolhas numa lista de compras organizada por categorias. Vais ao supermercado e está feito." },
    ]
    return (
        <section id="how" className="py-28 bg-gradient-to-b from-emerald-50/40 via-white to-white">
            <div className="mx-auto max-w-6xl px-5">
                <div className="mb-16 text-center">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">A app Vitaflix</p>
                    <h2 className="text-4xl font-bold tracking-tighter text-slate-900 md:text-5xl">Três passos. Zero dores de cabeça.</h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-slate-500">Primeiro escolhes. Depois ajustas. No fim compras. É isso que torna tudo mais leve.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {steps.map((step, i) => (
                        <motion.div key={step.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.12 }}
                            className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                            <div className="absolute -top-4 right-0 text-[8rem] font-bold tracking-tighter leading-none text-slate-100 select-none transition-colors group-hover:text-emerald-500/10">{step.num}</div>
                            <div className="relative z-10">
                                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100/50 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">{step.icon}</div>
                                <h3 className="mb-4 text-xl font-bold tracking-tight text-slate-900">{step.title}</h3>
                                <p className="text-base font-medium leading-relaxed text-slate-500">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   APP SHOWCASE SECTION
───────────────────────────────────────────── */
function AppShowcaseSection() {
    const images = Array.from({ length: 8 }, (_, i) => `/app/app-${i + 1}.jpg`)
    
    // We'll create a horizontal scrolling marquee of iPhone mockups
    return (
        <section className="py-24 bg-slate-900 overflow-hidden relative">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] rotate-[8deg] scale-150" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/20 blur-[150px] rounded-full pointer-events-none" />
            
            <div className="mx-auto max-w-6xl px-5 relative z-10 text-center mb-16">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Por dentro da app</p>
                <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">Tudo à distância de um toque.</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-slate-400">Uma interface limpa, focada e sem distrações. Apenas aquilo que precisas para manteres o foco no teu objetivo.</p>
            </div>

            <div className="relative z-10 flex w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <div className="flex w-max gap-8 pl-8 animate-marquee" style={{ animationDuration: '45s' }}>
                    {[...images, ...images].map((src, i) => (
                        <div key={i} className="relative mx-auto w-[280px] h-[580px] rounded-[3rem] border-[12px] border-slate-950 bg-slate-950 shadow-2xl overflow-hidden shrink-0 ring-1 ring-white/10">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[24px] w-[120px] bg-slate-950 rounded-b-2xl z-20" />
                            {/* Screen */}
                            <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt={`Ecrã da app Vitaflix ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="mt-16 flex justify-center relative z-10">
                <Link href="/checkout" className="group relative overflow-hidden flex h-14 items-center gap-2 rounded-2xl bg-emerald-500 px-10 text-base font-bold text-slate-900 shadow-[0_8px_30px_rgb(16,185,129,0.3)] transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                    Quero ver a app por dentro <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   STATS SECTION (animated counters)
───────────────────────────────────────────── */
function StatsSection() {
    const stats = [
        { value: 300, suffix: "+", label: "Receitas práticas", sub: "Pequenos-almoços, almoços, jantares, lanches e doces" },
        { value: 10000, suffix: "+", label: "Utilizadores ativos", sub: "Pessoas que já simplificaram a sua alimentação" },
        { value: 1, suffix: " clique", label: "Para a lista de compras", sub: "Sem copiar ingredientes manualmente" },
        { value: 0, suffix: "", label: "Calorias a contar", sub: "As quantidades já estão calculadas para ti" },
    ]
    return (
        <section className="py-20 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 border-y border-emerald-100">
            <div className="mx-auto max-w-6xl px-5">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {stats.map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            className="text-center">
                            <p className="text-5xl font-bold tracking-tighter text-slate-900 md:text-6xl">
                                <AnimatedCounter target={s.value} suffix={s.suffix} />
                            </p>
                            <p className="mt-2 text-sm font-bold tracking-tight text-slate-700">{s.label}</p>
                            <p className="mt-1 text-xs font-medium text-slate-400">{s.sub}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   RECIPES CAROUSEL
───────────────────────────────────────────── */
const recipeItems = [
    { id: 1, name: "Arroz de frango", video: "/videos/recipes/1.mp4", poster: "/videos/recipes/thumbnails/1.jpg" },
    { id: 2, name: "Empadão de carne", video: "/videos/recipes/2.mp4", poster: "/videos/recipes/thumbnails/2.jpg" },
    { id: 3, name: "Bolo de chocolate", video: "/videos/recipes/3.mp4", poster: "/videos/recipes/thumbnails/3.jpg" },
    { id: 4, name: "Sandes proteica", video: "/videos/recipes/4.mp4", poster: "/videos/recipes/thumbnails/4.jpg" },
    { id: 5, name: "Pequeno-almoço", video: "/videos/recipes/5.mp4", poster: "/videos/recipes/thumbnails/5.jpg" },
    { id: 6, name: "Lasanha", video: "/videos/recipes/6.mp4", poster: "/videos/recipes/thumbnails/6.jpg" },
]

function RecipesSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const cardRefs = useRef<Array<HTMLDivElement | null>>([])
    const [playingIdx, setPlayingIdx] = useState<number | null>(null)
    const [loadedIdxs, setLoadedIdxs] = useState<number[]>([0, 1])
    const [muted, setMuted] = useState(true)

    useEffect(() => {
        const root = containerRef.current
        if (!root) return
        const obs = new IntersectionObserver((entries) => {
            let best: number | null = null; let bestRatio = 0
            entries.forEach((e) => {
                const idx = Number((e.target as HTMLElement).dataset.index)
                if (e.isIntersecting) {
                    setLoadedIdxs((p) => p.includes(idx) ? p : [...p, idx])
                    if (e.intersectionRatio > bestRatio) { bestRatio = e.intersectionRatio; best = idx }
                }
            })
            if (best !== null) setPlayingIdx(best)
        }, { root, threshold: 0.6 })
        cardRefs.current.forEach((c) => c && obs.observe(c))
        return () => obs.disconnect()
    }, [])

    const scroll = (dir: "l" | "r") => containerRef.current?.scrollBy({ left: dir === "l" ? -300 : 300, behavior: "smooth" })
    const tap = (idx: number) => {
        if (!loadedIdxs.includes(idx)) setLoadedIdxs((p) => [...p, idx])
        if (playingIdx === idx) { if (muted) setMuted(false); else setPlayingIdx(null) }
        else { setPlayingIdx(idx); setMuted(false) }
    }

    return (
        <section className="py-28 bg-white overflow-hidden">
            <div className="mx-auto max-w-6xl px-5">
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">Receitas em vídeo</p>
                        <h2 className="text-3xl font-bold tracking-tighter text-slate-900 md:text-4xl">Comida real. Fácil de preparar.</h2>
                        <p className="mt-2 text-base font-medium text-slate-500">Toca para ver a receita em ação.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => scroll("l")} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95"><ChevronLeft className="h-5 w-5" /></button>
                        <button onClick={() => scroll("r")} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95"><ChevronRight className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>
            <div ref={containerRef} className="flex gap-4 overflow-x-auto px-5 pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
                {recipeItems.map((r, i) => (
                    <div key={r.id} data-index={i} ref={(el) => { cardRefs.current[i] = el }} onClick={() => tap(i)}
                        className="relative aspect-[9/16] w-[240px] shrink-0 cursor-pointer overflow-hidden rounded-[2rem] bg-[#111] snap-center transition-all duration-500 shadow-sm">
                        <Image src={r.poster} alt={r.name} fill className="object-cover" sizes="240px" />
                        <video src={loadedIdxs.includes(i) ? r.video : undefined} className="absolute inset-0 h-full w-full object-cover" loop muted={muted} playsInline
                            ref={(el) => { if (!el) return; if (playingIdx === i) el.play().catch(() => setMuted(true)); else { el.pause(); el.currentTime = 0 } }} />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" style={{ opacity: playingIdx === i ? 0.4 : 0.75 }} />
                        <div className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300", playingIdx === i ? "opacity-0" : "opacity-100")}>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md">
                                <Play className="ml-1 h-6 w-6 fill-white text-white" />
                            </div>
                        </div>
                        {playingIdx === i && (
                            <button onClick={(e) => { e.stopPropagation(); setMuted(!muted) }} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-md">
                                {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                            </button>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-5">
                            <span className="mb-2 inline-block rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Receita</span>
                            <p className="text-base font-bold leading-tight text-white">{r.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   BEFORE / AFTER
───────────────────────────────────────────── */
function BeforeAfterSection() {
    return (
        <section className="py-24 bg-gradient-to-b from-white to-emerald-50/30">
            <div className="mx-auto max-w-5xl px-5">
                <div className="mb-14 text-center">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">A transformação</p>
                    <h2 className="text-4xl font-bold tracking-tighter text-slate-900 md:text-5xl">A tua vida antes e depois do Vitaflix</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Before */}
                    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                        className="rounded-[2.5rem] bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-red-100/60 transition-shadow hover:shadow-[0_20px_40px_rgb(239,68,68,0.05)]">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100/50 shadow-sm">
                                <XCircle className="h-6 w-6 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Antes do Vitaflix</h3>
                        </div>
                        <ul className="space-y-5">
                            {[
                                "Decides o que comer na hora — todos os dias",
                                "Contas calorias manualmente ou desistes",
                                "Vais ao supermercado sem saber o que comprar",
                                "Repetes sempre as mesmas 5 refeições",
                                "Perdes o fio à meada ao fim de poucos dias",
                                "Sentes que precisas de mais força de vontade",
                            ].map((item, i) => (
                                <motion.li key={item} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.05 }}
                                    className="flex items-start gap-3">
                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                                    <span className="text-[15px] font-medium leading-relaxed text-slate-600">{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                    {/* After */}
                    <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
                        className="relative rounded-[2.5rem] bg-gradient-to-b from-emerald-50/80 to-white p-8 md:p-10 shadow-[0_8px_30px_rgb(16,185,129,0.08)] ring-1 ring-emerald-200/60 transition-shadow hover:shadow-[0_20px_40px_rgb(16,185,129,0.12)]">
                        <div className="absolute inset-x-0 -top-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 ring-1 ring-emerald-200/50 shadow-sm">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-emerald-900">Com o Vitaflix</h3>
                        </div>
                        <ul className="space-y-5">
                            {[
                                "Tens as refeições da semana organizadas com antecedência",
                                "As quantidades já estão calculadas — zero contas",
                                "A lista de compras é criada automaticamente",
                                "Descobres receitas novas que gostas de comer",
                                "Manténs a consistência sem esforço extra",
                                "Sentes que tens controlo sobre a tua alimentação",
                            ].map((item, i) => (
                                <motion.li key={item} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.05 }}
                                    className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                                    <span className="text-[15px] font-bold leading-relaxed text-slate-800">{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                    className="mt-12 flex justify-center">
                    <Link href="/checkout" className="group relative overflow-hidden flex h-14 items-center gap-2 rounded-2xl bg-emerald-600 px-10 text-base font-bold text-white shadow-[0_8px_30px_rgb(16,185,129,0.2)] transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        Quero começar agora <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────── */
const testimonialData = [
    { name: "Raquel Araújo", role: "Lojista", image: "/avatars/raquel_araujo.png", quote: "O teu acompanhamento ajudou bastante e ainda vai ajudar mais!\nTenho apoio, tenho bastantes receitas por onde escolher! Nunca se torna aborrecido e caso me apeteça algo dá sempre para incluir na dieta!" },
    { name: "Vânia Gandra", role: "Perdeu 35 kg", image: "/avatars/vania_gandra.png", quote: "Acabaste por te tornar parte das minhas rotinas.\nFoste de uma ajuda enorme a iniciar a jornada do exercício, a tua presença constante e o feedback dos vídeos.\nSem ti não teria sido possível perder estes 35 kg.\nObrigada por tudo." },
    { name: "Filomena Brás", role: "Mãe de dois filhos", image: "/avatars/filomena_bras.png", quote: "Desde que comecei a treinar com o Bruno, a minha relação com o exercício físico mudou completamente.\nTenho uma vida muito exigente e encontrar tempo para mim era quase impossível. Poder treinar em casa, quando consigo, fez toda a diferença." },
    { name: "Carolina Pinto", role: "Perdeu 20 kg em 1 ano", image: "/avatars/carolina_pinto.png", quote: "Uma das melhores partes é continuar a comer de tudo, inclusive os meus pratos favoritos, sem culpa.\nAlém disso, és realista e consegues adaptar tudo à minha vida, mesmo quando ela é imprevisível.\nIsso fez-me olhar para o processo com mais carinho." },
    { name: "Bianca Antunes", role: "Atleta", image: "/avatars/bianca_antunes.png", quote: "Decidi entrar porque já acompanhava o teu trabalho e, quando entrei, a minha visão mudou completamente.\nComecei a comer muito mais, a treinar para construir massa muscular e a ganhar auto-estima. Agora sinto-me muito melhor e com mais energia ao longo do dia." },
]

function TestimonialsSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] })
    const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 28 })
    const p0 = useTransform(smooth, [0, 1], [-8, 12])
    const p1 = useTransform(smooth, [0, 1], [-5, 8])
    const p2 = useTransform(smooth, [0, 1], [-10, 14])
    const p3 = useTransform(smooth, [0, 1], [-6, 10])
    const p4 = useTransform(smooth, [0, 1], [-12, 16])
    const parallaxes = [p0, p1, p2, p3, p4]

    return (
        <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-b from-emerald-50/30 to-white py-28">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:24px_24px] rotate-[12deg] scale-150" />
            
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-100/40 blur-[120px]" />
            </div>
            <div className="mx-auto max-w-6xl px-5 relative z-10">
                <div className="mb-14 text-center">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Resultados reais</p>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">O que dizem quem já usa o Vitaflix</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12">
                    {testimonialData.map((t, i) => (
                        <motion.div key={t.name} style={{ y: parallaxes[i] }} initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: i * 0.08 }}
                            className={cn("group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:col-span-1 xl:col-span-4",
                                i === 3 && "xl:col-start-3", i === 4 && "xl:col-start-7")}>
                            <div className="absolute inset-x-0 -top-16 h-32 bg-linear-to-b from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-md ring-1 ring-slate-200">
                                        <Image src={t.image} alt={t.name} fill className="object-cover" sizes="48px" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                                        <p className="text-xs font-semibold text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                                <Quote className="h-4 w-4 text-primary/50" />
                            </div>
                            <p className="flex-1 text-[15px] font-medium leading-relaxed text-slate-600 whitespace-pre-wrap">{t.quote}</p>
                            <div className="mt-5 flex gap-0.5 text-amber-400">{[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   SOCIAL PROOF WALL (CAROUSEL)
───────────────────────────────────────────── */

const MarqueeRow = ({ items, reverse = false, duration = "60s", onImageClick }: { items: string[], reverse?: boolean, duration?: string, onImageClick: (src: string) => void }) => (
    <div className="flex w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
        <div className={cn("flex w-max gap-4 sm:gap-6 pl-4 sm:pl-6", reverse ? "animate-marquee-reverse" : "animate-marquee")} style={{ animationDuration: duration }}>
            {[...items, ...items].map((src, i) => (
                <div key={i} onClick={() => onImageClick(src)} className="relative overflow-hidden rounded-[1.5rem] border border-slate-200/60 shadow-sm w-[260px] sm:w-[320px] h-[400px] sm:h-[500px] shrink-0 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-slate-100 cursor-zoom-in">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Feedback de um utilizador no WhatsApp" className="w-full h-full object-cover pointer-events-none" loading="lazy" />
                </div>
            ))}
        </div>
    </div>
)

function SocialProofWallSection() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const images = Array.from({ length: 27 }, (_, i) => `/social-proof/proof-${i + 1}.jpg`)
    const row1 = images.slice(0, 9)
    const row2 = images.slice(9, 18)
    const row3 = images.slice(18, 27)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedImage(null)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        if (selectedImage) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [selectedImage])

    return (
        <section className="bg-slate-50 py-28 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="mx-auto max-w-7xl px-5 relative z-10 mb-16">
                <div className="text-center">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Comunidade Vitaflix</p>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">O que acontece quando paras de improvisar</h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-slate-500">Centenas de mensagens que recebemos todas as semanas de pessoas que transformaram a sua relação com a comida.</p>
                </div>
            </div>
            
            <div className="relative z-10 flex flex-col gap-4 sm:gap-6 -rotate-2 scale-105">
                <MarqueeRow items={row1} duration="55s" onImageClick={setSelectedImage} />
                <MarqueeRow items={row2} reverse duration="65s" onImageClick={setSelectedImage} />
                <MarqueeRow items={row3} duration="60s" onImageClick={setSelectedImage} />
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm sm:p-8 cursor-zoom-out"
                    >
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[101] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative max-h-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={selectedImage} alt="Feedback expandido" className="max-h-[85vh] w-auto object-contain" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

/* ─────────────────────────────────────────────
   COMPARISON TABLE
───────────────────────────────────────────── */
function ComparisonSection() {
    const rows = [
        { feature: "Receitas com quantidades calculadas", vitaflix: true, others: false },
        { feature: "Organização semanal de refeições", vitaflix: true, others: false },
        { feature: "Lista de compras automática", vitaflix: true, others: false },
        { feature: "Sem contar calorias manualmente", vitaflix: true, others: false },
        { feature: "Substituição rápida de refeições", vitaflix: true, others: false },
        { feature: "Novas receitas adicionadas regularmente", vitaflix: true, others: false },
        { feature: "Registo manual de todos os alimentos", vitaflix: false, others: true },
        { feature: "Interface complicada e desmotivante", vitaflix: false, others: true },
    ]
    return (
        <section className="py-24 bg-gradient-to-b from-white to-emerald-50/40">
            <div className="mx-auto max-w-4xl px-5">
                <div className="mb-14 text-center">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Comparação</p>
                    <h2 className="text-4xl font-bold tracking-tighter text-slate-900 md:text-5xl">Vitaflix vs. outras apps</h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-slate-500">A maioria das apps de nutrição foi criada para nutricionistas. O Vitaflix foi criado para ti.</p>
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                    className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200/60">
                    {/* Header row */}
                    <div className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] border-b border-slate-100 bg-slate-50/50 px-4 md:px-6 py-5">
                        <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 self-center">Funcionalidade</div>
                        <div className="text-center text-sm md:text-base font-black tracking-tight text-emerald-600">Vitaflix</div>
                        <div className="text-center text-sm md:text-base font-bold tracking-tight text-slate-400">Outras</div>
                    </div>
                    {rows.map((row, i) => (
                        <motion.div key={row.feature} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                            className={cn("grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] items-center px-4 md:px-6 py-4 transition-colors hover:bg-slate-50/80", i % 2 === 0 ? "bg-white" : "bg-slate-50/30")}>
                            <span className="text-sm font-medium text-slate-700 pr-2">{row.feature}</span>
                            <div className="flex justify-center">
                                {row.vitaflix
                                    ? <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100/50 shadow-sm"><Check className="h-4 w-4 text-emerald-500" /></div>
                                    : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-100"><X className="h-4 w-4 text-slate-300" /></div>}
                            </div>
                            <div className="flex justify-center">
                                {row.others
                                    ? <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100/50 shadow-sm"><Check className="h-4 w-4 text-red-400" /></div>
                                    : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-100"><X className="h-4 w-4 text-slate-300" /></div>}
                            </div>
                        </motion.div>
                    ))}
                    <div className="border-t border-emerald-100/50 bg-emerald-50/50 px-6 py-5 text-center">
                        <p className="text-sm font-bold tracking-tight text-emerald-800">O Vitaflix foi desenhado para simplificar — não para complicar.</p>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                    className="mt-12 flex justify-center">
                    <Link href="/checkout" className="group relative overflow-hidden flex h-14 items-center gap-2 rounded-2xl bg-emerald-600 px-10 text-base font-bold text-white shadow-[0_8px_30px_rgb(16,185,129,0.2)] transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        Quero começar agora <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   MINI STORY / FOUNDER ORIGIN
───────────────────────────────────────────── */
function FounderSection() {
    return (
        <section className="py-28 bg-white overflow-hidden">
            <div className="mx-auto max-w-6xl px-5">
                <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                    <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                        className="relative">
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-500 aspect-[4/5] shadow-[0_20px_40px_rgba(16,185,129,0.15)] ring-1 ring-emerald-900/10">
                            <Image src="/avatars/bruno_v3.png" alt="Bruno Cortez — fundador do Vitaflix" fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, 50vw" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md">
                                    <p className="text-base font-black text-white">Bruno Cortez</p>
                                    <p className="text-sm font-semibold text-white/70">Fundador do Vitaflix</p>
                                </div>
                            </div>
                        </div>
                        {/* Floating stat cards */}
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                            className="absolute -right-6 top-10 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl">
                            <p className="text-2xl font-black text-slate-900">10k+</p>
                            <p className="text-xs font-bold text-slate-500">utilizadores ativos</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
                            className="absolute -left-6 bottom-24 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl">
                            <p className="text-2xl font-black text-slate-900">300+</p>
                            <p className="text-xs font-bold text-slate-500">receitas criadas</p>
                        </motion.div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">A história por trás do Vitaflix</p>
                        <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-slate-900 md:text-5xl">
                            Criei o Vitaflix porque eu próprio estava farto de improvisar.
                        </h2>
                        <div className="mt-6 space-y-4 text-lg font-medium leading-relaxed text-slate-500">
                            <p>
                                Durante anos tentei comer bem. Comprei livros de receitas. Instalei apps de contagem de calorias. Segui planos de dieta. E falhei sempre — não por falta de vontade, mas porque o sistema era demasiado complicado para manter no dia a dia.
                            </p>
                            <p>
                                A verdade é que <span className="font-bold text-slate-800">a maioria das ferramentas de nutrição foi criada para profissionais de saúde</span>, não para pessoas normais que só querem comer melhor sem transformar isso num segundo emprego.
                            </p>
                            <p>
                                Por isso criei o Vitaflix: uma app simples que organiza as tuas refeições, calcula as quantidades e cria a lista de compras — para que possas focar-te em viver, não em calcular.
                            </p>
                        </div>
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            {[
                                { n: "5 anos", label: "De experiência" },
                                { n: "10k+", label: "Utilizadores" },
                                { n: "4.8★", label: "Avaliação média" },
                            ].map(({ n, label }) => (
                                <div key={label} className="rounded-2xl bg-white p-4 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200/60">
                                    <p className="text-2xl font-bold tracking-tighter text-slate-900">{n}</p>
                                    <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
                                </div>
                            ))}
                        </div>
                        <Link href="/checkout" className="group mt-8 relative overflow-hidden inline-flex h-14 items-center gap-2 rounded-2xl bg-emerald-600 px-8 text-base font-bold text-white shadow-[0_8px_30px_rgb(16,185,129,0.2)] transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            Quero experimentar a app <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   GUARANTEE / RISK REVERSAL
───────────────────────────────────────────── */
function GuaranteeSection() {
    return (
        <section className="py-28 bg-white">
            <div className="mx-auto max-w-4xl px-5">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-white p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200/60 md:p-14">
                    <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[80px]" />
                    <div className="relative z-10">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                            <ShieldCheck className="h-10 w-10 text-slate-800" />
                        </div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Sem compromisso</p>
                        <h2 className="text-4xl font-bold tracking-tighter text-slate-900 md:text-5xl">
                        Experimenta sem risco.<br />
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Cancela quando quiseres.</span>
                    </h2>
                        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-slate-500">
                            Subscreve hoje, acede imediatamente a toda a app Vitaflix e, se não te adaptares, podes cancelar a tua subscrição a qualquer momento — <span className="font-bold text-slate-800">sem fidelização e com apenas um clique</span>.
                        </p>
                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            {[
                                { icon: <Lock className="h-5 w-5 text-emerald-600" />, title: "Pagamento seguro", desc: "Processado pela Stripe (nível bancário)" },
                                { icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />, title: "Sem fidelização", desc: "Cancela na app com apenas 1 clique" },
                                { icon: <BadgeCheck className="h-5 w-5 text-emerald-600" />, title: "Acesso imediato", desc: "App liberada no momento da compra" },
                            ].map(({ icon, title, desc }, i) => (
                                <motion.div key={title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }}
                                    className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">{icon}</div>
                                    <p className="text-sm font-bold tracking-tight text-slate-900">{title}</p>
                                    <p className="text-xs font-medium text-slate-500 text-center">{desc}</p>
                                </motion.div>
                            ))}
                        </div>
                        <Link href="/checkout" className="group mt-10 relative overflow-hidden inline-flex h-14 items-center gap-2 rounded-2xl bg-emerald-600 px-10 text-base font-bold text-white shadow-[0_8px_30px_rgb(16,185,129,0.2)] transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            Começar agora <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <p className="mt-4 text-xs font-semibold text-slate-400">Plataforma segura e independente</p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   URGENCY / SCARCITY BLOCK
───────────────────────────────────────────── */
function UrgencyBlock() {
    const { m, s } = useCountdown()
    return (
        <section className="relative overflow-hidden py-20 bg-emerald-950 border-y border-emerald-900">
            {/* Premium background effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:24px_24px] rotate-[12deg] scale-150" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-5xl px-5">
                <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-8 text-center md:flex-row md:text-left md:gap-12">
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                        <div className="absolute -inset-1 rounded-full animate-ping bg-emerald-500/30" style={{ animationDuration: '3s' }} />
                        <Flame className="h-12 w-12 text-white drop-shadow-md" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3">Atenção — desconto exclusivo</p>
                        <h3 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                            O desconto especial termina em{" "}
                            <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-900/80 px-3.5 py-1.5 text-white tabular-nums shadow-inner ring-1 ring-emerald-800/50 mt-3 md:mt-0">
                                <Clock className="h-6 w-6 text-emerald-400" />
                                {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
                            </span>
                        </h3>
                        <p className="mt-4 text-lg font-medium text-emerald-100/70">
                            Depois deste período, o desconto desaparece. Não percas esta oportunidade.
                        </p>
                    </div>
                    <Link href="/checkout" className="group shrink-0 relative overflow-hidden flex h-16 items-center gap-3 rounded-2xl bg-emerald-500 px-8 text-lg font-bold text-emerald-950 shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] ring-1 ring-white/20">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                        Garantir preço <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   PRICING
───────────────────────────────────────────── */
function PricingSection() {
    const { m, s } = useCountdown()
    const plans = [
        {
            id: "monthly",
            name: "Mensal",
            price: "12,99",
            originalPrice: "17,99",
            period: "/ mês",
            discount: "-28%",
            highlight: false,
            features: ["Acesso a todas as receitas", "Organização semanal", "Lista de compras automática", "Atualizações incluídas"],
            cta: "Começar mensalmente",
        },
        {
            id: "quarterly",
            name: "Trimestral",
            price: "29,99",
            originalPrice: "44,99",
            period: "/ 3 meses",
            discount: "-33%",
            highlight: true,
            badge: "Mais popular",
            features: ["Tudo do plano mensal", "Poupa 9 € vs. mensal", "Acesso prioritário a novas receitas", "Suporte dedicado"],
            cta: "Começar por 29,99 €",
        },
        {
            id: "annual",
            name: "Anual",
            price: "89,99",
            originalPrice: "155,99",
            period: "/ ano",
            discount: "-42%",
            highlight: false,
            badge: "Melhor valor",
            features: ["Tudo do plano trimestral", "Poupa 66 € vs. mensal", "Acesso antecipado a novas funcionalidades", "Suporte VIP"],
            cta: "Começar por 89,99 €",
        },
    ]
    return (
        <section id="pricing" className="py-28 bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30">
            <div className="mx-auto max-w-6xl px-5">
                <div className="mb-14 text-center">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Oferta especial</p>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Escolhe o teu plano</h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-slate-500">Desconto exclusivo ativo. Cancela quando quiseres.</p>
                    {/* Countdown */}
                    <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-3">
                        <Flame className="h-5 w-5 text-amber-500 shrink-0" />
                        <span className="text-sm font-bold text-slate-700">Desconto expira em</span>
                        <span className="flex items-center gap-1 rounded-xl bg-emerald-800 px-3 py-1.5 text-sm font-black text-white tabular-nums">
                            <Clock className="h-3.5 w-3.5" />
                            {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
                        </span>
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan, i) => (
                        <motion.div key={plan.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            className={cn("relative flex flex-col overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-300 hover:-translate-y-1",
                                plan.highlight
                                    ? "border-emerald-500/30 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.2)] scale-[1.03] z-10"
                                    : "border-slate-200/60 bg-white shadow-sm hover:shadow-xl")}>
                            {plan.badge && (
                                <div className={cn("absolute -top-px left-1/2 -translate-x-1/2 rounded-b-xl px-4 py-1.5 text-xs font-bold",
                                    plan.highlight ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)]" : "bg-slate-100 text-slate-600")}>
                                    {plan.badge}
                                </div>
                            )}
                            <div className="mb-6 mt-4">
                                <p className={cn("text-sm font-bold uppercase tracking-wider", plan.highlight ? "text-emerald-400" : "text-slate-500")}>{plan.name}</p>
                                <div className="mt-3 flex items-end gap-2">
                                    <span className={cn("text-5xl font-bold tracking-tighter", plan.highlight ? "text-white" : "text-slate-900")}>{plan.price} €</span>
                                    <span className={cn("mb-1.5 text-base font-medium", plan.highlight ? "text-emerald-100/80" : "text-slate-400")}>{plan.period}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={cn("text-sm font-medium line-through", plan.highlight ? "text-emerald-100/60" : "text-slate-400")}>{plan.originalPrice} €</span>
                                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", plan.highlight ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-100 text-slate-600")}>{plan.discount}</span>
                                </div>
                            </div>
                            <ul className="mb-8 flex-1 space-y-3">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-3">
                                        <CheckCircle2 className={cn("mt-0.5 h-5 w-5 shrink-0", plan.highlight ? "text-emerald-400" : "text-emerald-500")} />
                                        <span className={cn("text-sm font-medium", plan.highlight ? "text-white" : "text-slate-600")}>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/checkout"
                                className={cn("group relative overflow-hidden flex h-14 items-center justify-center gap-2 rounded-2xl text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]",
                                    plan.highlight
                                        ? "bg-white text-emerald-900 shadow-xl hover:bg-slate-50"
                                        : "bg-slate-900 text-white hover:bg-black ring-1 ring-inset ring-slate-800")}>
                                {plan.highlight && <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-emerald-100/40 to-transparent" />}
                                <span className="relative z-10 flex items-center gap-2">
                                    {plan.cta} <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </span>
                            </Link>
                            {plan.highlight && (
                                <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                                    <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-400" />
                                    Sem fidelização · Cancela quando quiseres
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
                <p className="mt-8 text-center text-sm font-semibold text-slate-400">
                    <Lock className="mr-1 inline h-4 w-4" />
                    Pagamento seguro · Sem fidelização · Cancela a qualquer momento
                </p>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   FAQ
───────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string | React.ReactNode }) {
    const [open, setOpen] = useState(false)
    return (
        <div className={cn("overflow-hidden rounded-2xl border transition-all duration-300", open ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-white")}>
            <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="text-base font-bold text-slate-900">{q}</span>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300", open && "rotate-180 text-primary")} />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className="px-6 pb-5 text-base font-medium leading-relaxed text-slate-500">{a}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function FaqSection() {
    const faqs = [
        { q: "Preciso de contar calorias?", a: "Não. O Vitaflix foi criado precisamente para eliminar essa necessidade. As quantidades já estão calculadas para ti com base no teu objetivo — só tens de seguir as receitas." },
        { q: "Funciona para perda de peso?", a: "Sim. A app foi desenhada para ajudar na perda de peso de forma sustentável, sem dietas restritivas. Ao organizar as tuas refeições com antecedência, reduces as escolhas impulsivas e manténs a consistência." },
        { q: "Posso usar no iPhone e no Android?", a: "Sim, o Vitaflix está disponível tanto para iOS como para Android. Podes usar em qualquer dispositivo e sincronizar entre eles." },
        { q: "Quantas receitas estão disponíveis?", a: "Tens acesso a mais de 300 receitas práticas para o dia a dia — pequenos-almoços, almoços, jantares, lanches e doces. Adicionamos novas receitas regularmente." },
        { q: "Posso cancelar quando quiser?", a: "Sim, sem qualquer penalização. Podes cancelar a tua subscrição a qualquer momento diretamente na app ou através do suporte. Não há fidelização nem contratos de permanência." },
        { q: "Como funciona a lista de compras automática?", a: "Depois de escolheres as tuas refeições para a semana, o Vitaflix gera automaticamente uma lista de compras organizada por categorias (frutas, legumes, proteínas, etc.). Basta um clique." },
        {
            q: "Tenho dúvidas. Posso falar com alguém?",
            a: (
                <span>
                    Claro! Podes falar connosco diretamente pelo WhatsApp.{" "}
                    <a href="https://wa.me/351910000000" target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2 hover:text-primary/80">
                        Clica aqui para abrir o WhatsApp
                    </a>
                    {" "}e respondemos em menos de 24 horas.
                </span>
            )
        },
    ]
    return (
        <section id="faq" className="py-28 bg-gradient-to-b from-white to-slate-50/50">
            <div className="mx-auto max-w-3xl px-5">
                <div className="mb-14 text-center">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Perguntas frequentes</p>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Tens dúvidas? Nós respondemos.</h2>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq) => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   FINAL CTA
───────────────────────────────────────────── */
function FinalCtaSection() {
    const { m, s } = useCountdown()
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-[#064e3b] to-emerald-950 py-28">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-[160px]" />
            </div>
            <div className="mx-auto max-w-4xl px-5 relative z-10 text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                        Oferta especial ativa
                     </div>
                    <h2 className="text-5xl font-bold leading-[1.05] tracking-tighter text-white md:text-6xl lg:text-7xl">
                        Chega de improvisar.<br />
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Começa hoje.</span>
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-relaxed text-emerald-100/80">
                        Junta-te a mais de 10.000 pessoas que já simplificaram a sua alimentação com o Vitaflix. Sem contar calorias. Sem complicações.
                    </p>
                    {/* Countdown */}
                    <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 shadow-sm backdrop-blur-sm">
                        <Flame className="h-5 w-5 text-amber-500 shrink-0" />
                        <span className="text-sm font-bold text-slate-300">Desconto expira em</span>
                        <span className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-sm font-bold text-white tabular-nums">
                            <Clock className="h-4 w-4 text-emerald-400" />
                            {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
                        </span>
                    </div>
                    {/* CTA */}
                    <div className="mt-12 flex flex-col items-center gap-4">
                        <div className="relative w-full max-w-md">
                            {/* Animated Glow */}
                            <div className="absolute -inset-1 rounded-2xl bg-white/30 blur-xl animate-[pulse-glow_2.5s_infinite]" />
                            <Link href="/checkout"
                                className="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-white px-8 py-5 shadow-[0_8px_40px_-10px_rgba(255,255,255,0.4)] ring-1 ring-white/50 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 to-transparent" />
                                
                                <div className="relative z-10 flex items-center gap-3">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-sm font-bold text-slate-400 line-through">44,99 €</span>
                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">-33%</span>
                                        </div>
                                        <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap">Começar por 29,99 € / 3 meses</p>
                                        <p className="text-sm font-medium text-slate-500">≈ 10 € / mês · Cancela quando quiseres</p>
                                    </div>
                                    <ArrowRight className="h-6 w-6 shrink-0 text-slate-900 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                        {["Acesso imediato", "Sem fidelização", "Cancela quando quiseres", "Suporte em português"].map((t) => (
                            <div key={t} className="flex items-center gap-1.5 text-sm font-semibold text-emerald-100/60">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />{t}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
    return (
        <footer className="border-t border-slate-100 bg-white py-10 pb-48 lg:pb-32">
            <div className="mx-auto max-w-6xl px-5">
                <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
                    <div className="flex items-center gap-2.5">
                        <Image src="/vitaflix_logo_light_mode.png" alt="Vitaflix" width={28} height={28} className="object-contain" />
                        <span className="text-lg font-black tracking-tight text-slate-900">Vitaflix</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
                        <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacidade</Link>
                        <Link href="/terms" className="hover:text-slate-900 transition-colors">Termos</Link>
                        <Link href="/contact" className="hover:text-slate-900 transition-colors">Contacto</Link>
                        <a href="https://wa.me/351910000000" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">WhatsApp</a>
                    </div>
                    <p className="text-sm font-semibold text-slate-400">© {new Date().getFullYear()} Vitaflix. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    )
}