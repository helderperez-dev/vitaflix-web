"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Gem, Zap } from "lucide-react"
import { ImageCollage } from "@/components/landing/image-collage"

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
                        initial={{ opacity: 1, x: 0 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="relative w-full lg:w-1/2"
                    >
                        <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-tr from-primary/15 via-emerald-100/30 to-sky-200/30 blur-3xl" />

                        <ImageCollage 
                            mainImage="/images/1.jpeg"
                            topImage="/images/2.jpeg"
                            bottomImage="/images/3.jpeg"
                            label="Receitas reais para o teu dia a dia"
                        />
                    </motion.div>

                    <div className="w-full lg:w-1/2 space-y-10">
                        <div>
                            <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 text-balance sm:text-4xl md:text-5xl">Tudo num só lugar</h2>
                            <p className="text-base leading-relaxed text-slate-600 text-balance md:text-lg">
                                Apresentamos a solução definitiva. Com a Vitaflix, não perdes tempo, apenas ganhas saúde e controlo sobre as tuas refeições.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                                <div className="mb-2 inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Gem className="size-4" />
                                </div>
                                <p className="font-semibold text-slate-900">Experiência premium</p>
                                <p className="mt-1 text-sm text-slate-600">Interface limpa, rápida e desenhada para uso diário.</p>
                            </div>
                            <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                                <div className="mb-2 inline-flex size-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                                    <Zap className="size-4" />
                                </div>
                                <p className="font-semibold text-slate-900">Resultados práticos</p>
                                <p className="mt-1 text-sm text-slate-600">Decides em minutos o que cozinhar durante toda a semana.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {features.map((feature, i) => (
                                <motion.div
                                    initial={{ opacity: 1, x: 0 }}
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
                                        <h4 className="text-lg font-bold mb-1 text-slate-900">{feature.title}</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
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
