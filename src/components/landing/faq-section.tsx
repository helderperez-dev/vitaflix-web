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
        <section className="py-24 relative bg-background">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Perguntas Frequentes</h2>
                    <p className="text-muted-foreground text-lg">Tudo o que precisas de saber sobre a Vitaflix.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="bg-muted/30 border border-border/40 rounded-lg px-6">
                                <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-primary transition-colors py-6">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    )
}
