"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from "framer-motion"

const faqs = [
    {
        question: "Posso cancelar quando quiser?",
        answer: "Sim, absolutamente. A tua subscrição pode ser cancelada a qualquer momento, diretamente nas definições da tua conta, sem perguntas ou truques."
    },
    {
        question: "Está disponível para Android e iPhone?",
        answer: "Sim, a Vitaflix está disponível e otimizada tanto na App Store (iOS) como no Google Play (Android)."
    },
    {
        question: "A app inclui acompanhamento personalizado?",
        answer: "Não. A Vitaflix é uma ferramenta de organização criativa de refeições. O nosso foco é dar-te total autonomia e enorme sentido prático, não incluindo consultas ou chat de acompanhamento."
    }
]

export function FaqSection() {
    return (
        <section className="relative bg-white py-24 md:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 right-8 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
            </div>
            <div className="container mx-auto max-w-3xl px-4">
                <div className="mb-16 text-center">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Sem complicações</p>
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Perguntas Frequentes</h2>
                    <p className="text-lg text-muted-foreground">Tudo o que precisas de saber sobre a Vitaflix.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border border-border/60 bg-white/95 px-6 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-md">
                                <AccordionTrigger className="py-6 text-left text-lg font-bold hover:text-primary hover:no-underline transition-colors">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mt-10 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-6 text-center"
                >
                    <p className="text-sm font-medium text-primary/90">Apenas disponível via app móvel. Sem login web para utilizadores.</p>
                </motion.div>
            </div>
        </section>
    )
}
