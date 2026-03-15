"use client"

import { WaitlistForm } from "./waitlist-form"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Apple, Check, ChevronRight } from "lucide-react"
import Image from "next/image"

const heroPersonas = [
    {
        name: "Marta · Mãe ocupada",
        avatar: "/avatars/persona-marta.svg",
    },
    {
        name: "Diogo · Profissional ativo",
        avatar: "/avatars/persona-diogo.svg",
    },
    {
        name: "Inês · Estudante-atleta",
        avatar: "/avatars/persona-ines.svg",
    },
    {
        name: "Rui · Foco em recomposição",
        avatar: "/avatars/persona-rui.svg",
    }
]

export function HeroSection() {
    const [activeCard, setActiveCard] = useState(0)
    const [checkedItems, setCheckedItems] = useState<number[]>([])
    const [videoIndex, setVideoIndex] = useState(0)
    
    const videos = ["1.mp4", "2.mp4", "3.mp4", "4.mp4", "5.mp4"]

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveCard((prev) => (prev + 1) % 3)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const videoInterval = setInterval(() => {
            setVideoIndex((prev) => (prev + 1) % videos.length)
        }, 8000)
        return () => clearInterval(videoInterval)
    }, [videos.length])

    useEffect(() => {
        if (activeCard === 1) {
            // Animate checkboxes when shopping list is active
            let current = 0;
            setCheckedItems([]);
            const checkInterval = setInterval(() => {
                if (current < 4) {
                    setCheckedItems(prev => [...prev, current]);
                    current++;
                } else {
                    clearInterval(checkInterval);
                }
            }, 600);
            return () => clearInterval(checkInterval);
        } else {
            setCheckedItems([]);
        }
    }, [activeCard])

    return (
        <section
            id="waitlist"
            className="relative overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24 min-h-screen flex items-center"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-[#FAFCFF]" />
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-sky-100/60 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[20%] h-[400px] w-[400px] rounded-full bg-teal-50/80 blur-[80px]" />
            </div>

            <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center">
                    {/* Left Column: Text & Form */}
                    <div className="max-w-2xl mx-auto lg:mx-0 lg:ml-auto text-center lg:text-left relative z-10 w-full pt-10 lg:pt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200/60 px-4 py-1.5 shadow-sm mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span className="text-xs font-bold tracking-wide text-slate-700 uppercase">
                                    Vagas limitadas para Beta
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold tracking-tight text-slate-900 leading-[1.05] mb-5 font-['Poppins',sans-serif]">
                                A tua nutrição, <br className="hidden lg:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-teal-500 whitespace-nowrap font-extrabold">
                                    finalmente simples.
                                </span>
                            </h1>

                            <p className="text-base text-slate-600 leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0 font-medium">
                                Esquece as folhas de excel e as dúvidas no supermercado.
                                A Vitaflix cria o teu plano semanal, lista de compras e receitas em segundos.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-6 text-sm font-semibold text-slate-600">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {heroPersonas.map((persona) => (
                                            <div key={persona.name} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] overflow-hidden shadow-sm">
                                                <Image src={persona.avatar} alt={persona.name} width={32} height={32} className="h-full w-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs">+2.000 na lista de espera</span>
                                </div>
                            </div>

                            <div className="mt-8 w-full max-w-[600px] mx-auto lg:mx-0">
                                <WaitlistForm />
                            </div>

                            <div className="mt-4 flex items-center justify-center lg:justify-start gap-5 text-[11px] font-medium text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Check className="size-2.5 text-emerald-600" />
                                    </div>
                                    <span>Sem cartão de crédito</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Check className="size-2.5 text-emerald-600" />
                                    </div>
                                    <span>Cancela quando quiseres</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Floating Cards Composition */}
                    <div className="relative h-[450px] sm:h-[600px] lg:h-[700px] w-full mt-12 lg:mt-0 perspective-[1000px] flex items-center justify-center">
                        <motion.div style={{ y: 0, opacity: 1 }} className="absolute inset-0 flex items-center justify-center">
                            
                            {/* Central High-Def iPhone Mockup */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                                className="relative z-20 w-[260px] sm:w-[290px] h-[530px] sm:h-[590px] rounded-[40px] sm:rounded-[45px] border-[6px] sm:border-[8px] border-[#1f2937] bg-black shadow-[0_0_0_2px_rgba(255,255,255,0.1),_0_20px_60px_-15px_rgba(0,0,0,0.4)] sm:shadow-[0_0_0_2px_rgba(255,255,255,0.1),_0_40px_80px_-20px_rgba(0,0,0,0.4)] overflow-hidden"
                            >
                                {/* Dynamic Island / Notch Area */}
                                <div className="absolute top-2 inset-x-0 h-6 sm:h-7 flex justify-center z-30">
                                    <div className="w-[80px] sm:w-[90px] h-full bg-black rounded-full flex items-center justify-between px-2.5 shadow-sm border border-white/5">
                                        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1a1a24] flex items-center justify-center">
                                            <div className="w-1 h-1 rounded-full bg-blue-500/30" />
                                        </div>
                                        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1a1a24]" />
                                    </div>
                                </div>
                                
                                {/* Side Buttons */}
                                <div className="absolute top-20 sm:top-24 -left-[8px] sm:-left-[10px] w-1 h-6 bg-slate-800 rounded-l-sm" />
                                <div className="absolute top-32 sm:top-36 -left-[8px] sm:-left-[10px] w-1 h-10 sm:h-12 bg-slate-800 rounded-l-sm" />
                                <div className="absolute top-48 sm:top-52 -left-[8px] sm:-left-[10px] w-1 h-10 sm:h-12 bg-slate-800 rounded-l-sm" />
                                <div className="absolute top-36 sm:top-40 -right-[8px] sm:-right-[10px] w-1 h-14 sm:h-16 bg-slate-800 rounded-r-sm" />
                                
                                {/* Video Player */}
                                <div className="relative w-full h-full rounded-[34px] sm:rounded-[37px] overflow-hidden bg-black">
                                    <video
                                        key={videos[videoIndex]}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover"
                                        src={`/videos/${videos[videoIndex]}`}
                                    />
                                    
                                    {/* Glass Overlay for realism */}
                                    <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] z-20 pointer-events-none" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 z-20 pointer-events-none mix-blend-overlay" />
                                </div>
                            </motion.div>

                            {/* Main Card (Center Right) - Meal Card */}
                            <motion.div
                                animate={{ 
                                    scale: activeCard === 0 ? 1 : 0.85,
                                    zIndex: activeCard === 0 ? 30 : 10,
                                    opacity: activeCard === 0 ? 1 : 0.7,
                                    x: activeCard === 0 ? 100 : 120,
                                    y: activeCard === 0 ? -40 : -20,
                                    rotate: activeCard === 0 ? 4 : 8
                                }}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[300px] lg:!translate-x-[calc(-50%+80px)]"
                            >
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="rounded-[2rem] bg-white/95 border border-white/60 shadow-2xl p-4 ring-1 ring-black/5 backdrop-blur-md transition-transform hover:scale-105 duration-500">
                                        <div className="rounded-[1.5rem] bg-slate-50/80 p-5 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoje, 12:30</span>
                                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">Bowl de Salmão</h3>
                                                <p className="text-slate-500 text-sm">Com abacate e quinoa</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="px-2.5 py-1 rounded-lg bg-white text-xs font-semibold text-slate-600 shadow-sm border border-slate-100">540 kcal</span>
                                                <span className="px-2.5 py-1 rounded-lg bg-white text-xs font-semibold text-slate-600 shadow-sm border border-slate-100">32g Prot</span>
                                            </div>
                                            <div className="h-24 rounded-xl bg-slate-200/50 w-full animate-pulse" />
                                        </div>
                                        <div className="mt-4 flex items-center justify-between px-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <Check className="size-4" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600">Registar</span>
                                            </div>
                                            <ChevronRight className="size-4 text-slate-400" />
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Back Card 1 (Top Left) - Shopping List */}
                            <motion.div
                                animate={{ 
                                    scale: activeCard === 1 ? 1 : 0.85,
                                    zIndex: activeCard === 1 ? 30 : 10,
                                    opacity: activeCard === 1 ? 1 : 0.7,
                                    x: activeCard === 1 ? -100 : -80,
                                    y: activeCard === 1 ? -140 : -120,
                                    rotate: activeCard === 1 ? -6 : -10
                                }}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[260px] lg:!translate-x-[calc(-50%-60px)]"
                            >
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                >
                                    <div className="rounded-[1.5rem] bg-white/95 border border-white/60 shadow-xl p-4 ring-1 ring-black/5 backdrop-blur-md transition-transform duration-500 hover:scale-105">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                                <Apple className="size-4 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">Lista de Compras</p>
                                                <p className="text-[10px] text-slate-500">Pingo Doce</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {['Ovos M', 'Espinafres', 'Aveia', 'Mirtilos'].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/50">
                                                    <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors duration-300 ${checkedItems.includes(i) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                        {checkedItems.includes(i) && <Check className="size-3" />}
                                                    </div>
                                                    <span className={`text-xs font-medium transition-colors duration-300 ${checkedItems.includes(i) ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Back Card 2 (Bottom Left) - Progress */}
                            <motion.div
                                animate={{ 
                                    scale: activeCard === 2 ? 1.1 : 0.85,
                                    zIndex: activeCard === 2 ? 30 : 10,
                                    opacity: activeCard === 2 ? 1 : 0.7,
                                    x: activeCard === 2 ? -80 : -60,
                                    y: activeCard === 2 ? 160 : 140,
                                    rotate: activeCard === 2 ? -2 : -6
                                }}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[240px] lg:!translate-x-[calc(-50%-40px)]"
                            >
                                <motion.div
                                    animate={{ y: [0, -12, 0] }}
                                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                >
                                    <div className="rounded-[1.5rem] bg-white/95 border border-white/60 shadow-xl p-4 ring-1 ring-black/5 backdrop-blur-md transition-transform duration-500 hover:scale-105">
                                        <div className="mb-4 flex items-end">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Progresso</p>
                                                <p className="text-2xl font-black text-slate-900">-2.4kg</p>
                                            </div>
                                        </div>
                                        <div className="h-16 w-full flex items-end justify-between gap-1">
                                            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                                <motion.div 
                                                    key={i} 
                                                    initial={{ height: 0 }}
                                                    animate={{ height: activeCard === 2 ? `${h}%` : '20%' }}
                                                    transition={{ duration: 1, delay: activeCard === 2 ? i * 0.1 : 0, type: "spring" }}
                                                    className="w-full bg-emerald-500/30 rounded-t-sm" 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
