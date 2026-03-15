"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Gem, Zap } from "lucide-react"

const features = [
    {
        title: "+300 Receitas",
        desc: "Variedade real para todos os gostos, sem monotonia."
    },
    {
        title: "Variações Calóricas",
        desc: "A mesma refeição adaptada a vários objetivos (perda, ganho, foco)."
    },
    {
        title: "Lista de Compras Automática",
        desc: "Não percas tempo com idas desnecessárias ao supermercado."
    },
    {
        title: "Planeamento Semanal",
        desc: "Ferramenta intuitiva para organizar a semana inteira num relance."
    },
    {
        title: "Filtros Inteligentes",
        desc: "Encontra o que queres (carne, peixe, vegan, s/ lactose) num segundo."
    }
]

export function SolutionFeatures() {
    return (
        <section className="relative overflow-hidden bg-white py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-16 right-0 h-80 w-80 rounded-full bg-primary/15 blur-[120px]" />
                <div className="absolute bottom-10 left-0 h-64 w-64 rounded-full bg-sky-100/80 blur-[110px]" />
            </div>
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="w-full lg:w-1/2 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-sky-300/30 rounded-[3rem] blur-3xl -z-10" />

                        <div className="relative rotate-[-2deg] rounded-[2.5rem] border border-white/60 bg-white/95 p-6 shadow-2xl transition-transform duration-500 hover:rotate-0">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">O teu plano</p>
                                    <h3 className="text-xl font-bold text-slate-900">Semana 12</h3>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100" />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {["Segunda", "Terça", "Quarta"].map((day, i) => (
                                    <div key={day} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${i === 0 ? 'bg-primary/10 text-primary' : 'bg-white text-slate-400'}`}>
                                            {day.substring(0, 3)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-2 w-24 bg-slate-200 rounded-full mb-1.5" />
                                            <div className="h-1.5 w-16 bg-slate-100 rounded-full" />
                                        </div>
                                        <div className="text-xs font-medium text-slate-500">
                                            {3 + i} ref.
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <CheckCircle2 className="size-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">Lista de compras pronta</p>
                                    <p className="text-xs text-emerald-700">32 itens adicionados</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="w-full lg:w-1/2 space-y-10">
                        <div>
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">A solução</p>
                            <h2 className="mb-6 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">Tudo num só lugar</h2>
                            <p className="text-base leading-relaxed text-muted-foreground text-balance md:text-lg">
                                Apresentamos a solução definitiva. Com a Vitaflix, não perdes tempo, apenas ganhas saúde e controlo sobre as tuas refeições.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                                <div className="mb-2 inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Gem className="size-4" />
                                </div>
                                <p className="font-semibold">Experiência premium</p>
                                <p className="mt-1 text-sm text-muted-foreground">Interface limpa, rápida e desenhada para uso diário.</p>
                            </div>
                            <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                                <div className="mb-2 inline-flex size-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                                    <Zap className="size-4" />
                                </div>
                                <p className="font-semibold">Resultados práticos</p>
                                <p className="mt-1 text-sm text-muted-foreground">Decides em minutos o que cozinhar durante toda a semana.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {features.map((feature, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    key={i}
                                    className="flex items-start gap-4 rounded-2xl border border-transparent bg-white/70 p-4 transition-all duration-300 hover:border-border/60 hover:bg-white hover:shadow-sm"
                                >
                                    <div className="shrink-0 mt-1">
                                        <CheckCircle2 className="size-6 text-primary fill-primary/20" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold mb-1">{feature.title}</h4>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
