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
        <section className="py-24 relative overflow-hidden bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Identificas-te com isto?</h2>
                    <p className="text-lg text-muted-foreground">O planeamento alimentar não devia ser o momento mais stressante da tua semana.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {pains.map((pain, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            key={i}
                            className={`p-6 md:p-8 rounded-[2rem] bg-white border border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${i === pains.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                        >
                            <div className="size-12 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center mb-6">
                                <pain.icon className="size-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{pain.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{pain.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
