"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

const plans = [
    {
        name: "Plano Mensal",
        price: "12.99€",
        period: "/mês",
        desc: "Ideal para quem quer apenas testar.",
        features: ["Acesso total a +300 receitas", "Planeamento semanal completo", "Lista de compras automática", "Filtros e variações de macros"],
        highlight: false
    },
    {
        name: "Plano Trimestral",
        price: "29.99€",
        period: "/3 meses",
        desc: "O favorito para resultados reais.",
        features: ["Acesso total a +300 receitas", "Planeamento semanal completo", "Lista de compras automática", "Filtros e variações de macros", "Equivale a 9.99€/mês"],
        highlight: true,
        tag: "Mais Popular"
    },
    {
        name: "Plano Anual",
        price: "69.99€",
        period: "/ano",
        desc: "O melhor valor a longo prazo.",
        features: ["Acesso total a +300 receitas", "Planeamento semanal completo", "Lista de compras automática", "Filtros e variações de macros", "Acesso aos novos updates", "Equivale a 5.83€/mês"],
        highlight: false,
    }
]

export function PricingTable() {
    return (
        <section className="py-24 relative bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Investe na tua rotina</h2>
                    <p className="text-lg text-muted-foreground">Planos simples e transparentes. Sem letras pequenas ou contratos longos.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`relative flex flex-col p-8 rounded-[2.5rem] bg-white border shadow-sm transition-transform duration-300
                                ${plan.highlight
                                    ? 'border-primary shadow-xl shadow-primary/10 scale-105 md:-mt-8 z-10'
                                    : 'border-border/40 hover:-translate-y-2'
                                }
                            `}
                        >
                            {plan.tag && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                                    {plan.tag}
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{plan.desc}</p>
                            </div>

                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-4xl md:text-5xl font-black tracking-tight">{plan.price}</span>
                                <span className="text-muted-foreground font-medium">{plan.period}</span>
                            </div>

                            <div className="space-y-4 flex-1">
                                {plan.features.map((feature, j) => (
                                    <div key={j} className="flex items-start gap-3">
                                        <div className="mt-1 size-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Check className="size-3 text-primary stroke-[3]" />
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className={`w-full mt-8 py-4 rounded-2xl font-bold transition-all shadow-sm
                                ${plan.highlight
                                    ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-primary/25'
                                    : 'bg-muted/50 text-foreground hover:bg-muted'
                                }
                            `}>
                                Começar Agora
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
