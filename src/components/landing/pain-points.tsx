"use client"

import { motion } from "framer-motion"
import { Clock, Frown, HelpCircle, UtensilsCrossed, Scale } from "lucide-react"

const pains = [
    {
        icon: Clock,
        title: "Falta de Tempo",
        desc: "Equilibrar trabalho, família e ainda encontrar tempo para planear refeições saudáveis parece impossível."
    },
    {
        icon: Frown,
        title: "Dietas Restritivas",
        desc: "A sensação constante de que 'fazer dieta' é sinónimo de comer pratos secos e sem sabor."
    },
    {
        icon: HelpCircle,
        title: "A Eterna Dúvida",
        desc: "\"O que é que vou comer hoje?\" é a pergunta mais stressante do dia a dia."
    },
    {
        icon: UtensilsCrossed,
        title: "Monotonia",
        desc: "Acabas por comer sempre frango com arroz porque não sabes como variar sem sair do plano."
    },
    {
        icon: Scale,
        title: "Erro nas Quantidades",
        desc: "Desconhecimento de quanto precisas comer para o teu objetivo, levando à frustração por falta de resultados."
    }
]

export function PainPoints() {
    return (
        <section className="py-28 relative overflow-hidden bg-gradient-to-b from-[#f5f8ff] to-white">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 left-1/3 h-72 w-72 rounded-full bg-sky-100 blur-[120px]" />
                <div className="absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-rose-100/70 blur-[100px]" />
            </div>
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">As dores mais comuns</p>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-balance">Identificas-te com isto?</h2>
                    <p className="text-lg text-muted-foreground text-balance">O planeamento alimentar não devia ser o momento mais stressante da tua semana.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {pains.map((pain, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            key={i}
                            className={`group p-6 md:p-8 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 ${i === pains.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                        >
                            <div className="mb-6 inline-flex rounded-2xl bg-white p-3 shadow-sm border border-slate-100 text-destructive">
                                <pain.icon className="size-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{pain.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{pain.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="max-w-4xl mx-auto mt-14 rounded-[2rem] border border-white bg-white/90 px-6 py-8 sm:px-8 shadow-lg"
                >
                    <p className="text-center text-lg text-muted-foreground">
                        A Vitaflix transforma este caos num sistema simples: escolhes o teu objetivo e a app trata do resto.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
