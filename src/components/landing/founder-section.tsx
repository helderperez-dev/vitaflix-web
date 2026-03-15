"use client"

import { motion } from "framer-motion"
import { GraduationCap, TrendingUp, HeartPulse, Users } from "lucide-react"

const methodPillars = [
    {
        icon: GraduationCap,
        title: "Base técnica sólida",
        desc: "Metodologia construída com formação em Educação Física e prática real com alunos."
    },
    {
        icon: TrendingUp,
        title: "Progressão sustentável",
        desc: "Foco em consistência e evolução no tempo, sem atalhos extremos ou soluções de curto prazo."
    },
    {
        icon: HeartPulse,
        title: "Rotina aplicável",
        desc: "Planeamento alimentar que encaixa no dia a dia, com decisões simples e repetíveis."
    }
]

export function FounderSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#f8fbff] to-white py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-8 left-1/2 h-72 w-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Credibilidade do método</p>
                    <h2 className="mb-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">Por trás da Vitaflix está um método, não promessas</h2>
                    <p className="mx-auto max-w-2xl text-base text-slate-600 md:text-lg">
                        A app foi desenhada com base em experiência de terreno e acompanhamento real para tornar o planeamento alimentar mais simples, consistente e sustentável.
                    </p>
                </div>

                <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
                    {methodPillars.map((pillar, index) => (
                        <motion.div
                            key={pillar.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-4 inline-flex rounded-2xl border border-primary/15 bg-primary/10 p-2.5 text-primary">
                                <pillar.icon className="size-5" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold tracking-tight text-slate-900">{pillar.title}</h3>
                            <p className="text-[15px] leading-relaxed text-slate-600">{pillar.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mx-auto mt-8 max-w-6xl rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-7"
                >
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 rounded-2xl bg-primary/10 p-2.5 text-primary">
                            <Users className="size-5" />
                        </div>
                        <p className="text-[15px] leading-relaxed text-slate-600">
                            A metodologia foi desenvolvida por Bruno Cortez com foco em resultados sustentáveis e já ajudou centenas de alunos a perder peso, ganhar massa muscular e manter hábitos consistentes.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
