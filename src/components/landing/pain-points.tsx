"use client"

import { motion } from "framer-motion"
import { Clock3, Soup, CircleHelp, Repeat2, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const pains = [
    {
        icon: Clock3,
        title: "Pouco Tempo",
        desc: "Entre trabalho, família e rotina, planear refeições equilibradas acaba sempre por ficar para depois."
    },
    {
        icon: Soup,
        title: "Refeições Sem Sabor",
        desc: "Muitas opções parecem repetitivas e pouco apelativas, o que torna difícil manter consistência."
    },
    {
        icon: CircleHelp,
        title: "Dúvida Constante",
        desc: "Decidir o que cozinhar todos os dias consome tempo e energia que podias usar noutras prioridades."
    },
    {
        icon: Repeat2,
        title: "Falta de Variedade",
        desc: "Acabas por repetir as mesmas refeições por não teres um sistema simples para variar."
    },
    {
        icon: Target,
        title: "Quantidades Incertas",
        desc: "Sem orientação clara, é difícil ajustar porções ao teu objetivo e manter resultados consistentes."
    }
]

export function PainPoints() {
    return (
        <section className="relative overflow-hidden bg-[#f8fbff] py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-0 h-60 w-[36rem] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
            </div>
            <div className="container relative z-10 mx-auto px-4 sm:px-6">
                <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">No dia a dia</p>
                    <h2 className="mb-5 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">O que costuma complicar o teu planeamento</h2>
                    <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">Com a Vitaflix, estes bloqueios deixam de travar a tua rotina e o planeamento passa a ser leve e rápido.</p>
                </div>

                <div className="mx-auto grid max-w-6xl gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-6">
                    {pains.map((pain, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            key={i}
                            className={cn(
                                "group rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 md:min-h-[230px] md:p-7",
                                i < 3 ? "lg:col-span-2" : "lg:col-span-3"
                            )}
                        >
                            <div className="mb-5 inline-flex rounded-2xl border border-primary/15 bg-primary/5 p-3 text-primary transition-colors group-hover:bg-primary/10">
                                <pain.icon className="size-6" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold tracking-tight text-slate-900">{pain.title}</h3>
                            <p className="text-[15px] leading-relaxed text-slate-600">{pain.desc}</p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    )
}
