"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { useTranslations } from "next-intl"

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
        <section className="py-24 relative bg-background">
            <div className="container mx-auto px-4 sm:px-6">

                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Visual Showcase (Vitrine Visual) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="w-full lg:w-1/2 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-[3rem] blur-3xl -z-10" />
                        <div className="relative bg-black/5 dark:bg-white/5 border border-border/50 rounded-[2.5rem] p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
                            <div className="aspect-[4/5] sm:aspect-square md:aspect-[4/3] w-full rounded-lg overflow-hidden bg-white/5 relative border border-white/10 flex flex-col pt-12">
                                <div className="absolute top-4 left-4 right-4 flex gap-2">
                                    <div className="w-8 h-2 bg-primary/20 rounded-lg" />
                                    <div className="w-16 h-2 bg-primary/10 rounded-lg" />
                                    <div className="w-4 h-2 bg-primary/10 rounded-lg ml-auto" />
                                </div>

                                <div className="flex-1 w-full bg-cover bg-center rounded-t-2xl shadow-xl shadow-black/10 overflow-hidden relative group" style={{ backgroundImage: "url('https://placekitten.com/1000/1000')" }}>
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                                        <div className="h-4 w-3/4 bg-white/20 rounded-md mb-2" />
                                        <div className="h-3 w-1/2 bg-white/10 rounded-md" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Features List */}
                    <div className="w-full lg:w-1/2 space-y-10">
                        <div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">Tudo num só lugar</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Apresentamos a solução definitiva. Com a Vitaflix, não perdes tempo, apenas ganhas saúde e controlo sobre as tuas refeições.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {features.map((feature, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    key={i}
                                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
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
