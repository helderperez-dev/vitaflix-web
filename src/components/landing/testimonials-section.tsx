"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Quote, Star } from "lucide-react"

const testimonials = [
    {
        name: "Marta Silva",
        role: "Mãe de 2 filhos",
        image: "/avatars/persona-marta.svg",
        quote: "Antes perdia imenso tempo a decidir o que cozinhar. Com a Vitaflix passei a planear a semana em poucos minutos e a família come muito melhor."
    },
    {
        name: "Diogo Almeida",
        role: "Profissional de TI",
        image: "/avatars/persona-diogo.svg",
        quote: "A maior diferença foi a consistência. Deixei de improvisar refeições e finalmente consegui manter uma rotina alimentar alinhada com os meus objetivos."
    },
    {
        name: "Inês Rocha",
        role: "Estudante-atleta",
        image: "/avatars/persona-ines.svg",
        quote: "Gosto da forma simples como tudo está organizado. Tenho variedade, sei as porções certas e não fico perdida quando a semana aperta."
    }
]

export function TestimonialsSection() {
    return (
        <section className="relative overflow-hidden bg-white py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 h-64 w-[34rem] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6">
                <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Testemunhos</p>
                    <h2 className="mb-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">O que os nossos utilizadores dizem</h2>
                    <p className="mx-auto max-w-2xl text-base text-slate-600 md:text-lg">
                        Experiências reais de pessoas que simplificaram o planeamento alimentar e ganharam consistência no dia a dia.
                    </p>
                </div>

                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <motion.article
                            key={testimonial.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.45, delay: index * 0.08 }}
                            className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-200">
                                        <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" sizes="48px" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{testimonial.name}</p>
                                        <p className="text-xs text-slate-500">{testimonial.role}</p>
                                    </div>
                                </div>
                                <Quote className="size-4 text-primary/60" />
                            </div>

                            <p className="text-[15px] leading-relaxed text-slate-600">{testimonial.quote}</p>

                            <div className="mt-5 flex items-center gap-1 text-amber-400">
                                <Star className="size-4 fill-current" />
                                <Star className="size-4 fill-current" />
                                <Star className="size-4 fill-current" />
                                <Star className="size-4 fill-current" />
                                <Star className="size-4 fill-current" />
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    )
}
