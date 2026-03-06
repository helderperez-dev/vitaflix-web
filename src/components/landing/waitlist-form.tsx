"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const waitlistSchema = z.object({
    name: z.string().min(2, { message: "Nome é obrigatório." }),
    email: z.string().email({ message: "Email inválido." }),
})

export function WaitlistForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const form = useForm<z.infer<typeof waitlistSchema>>({
        resolver: zodResolver(waitlistSchema),
        defaultValues: {
            name: "",
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof waitlistSchema>) {
        setIsSubmitting(true)

        try {
            // We'll post to our internal leads API
            const response = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    source: "landing_waitlist",
                    // We don't have a specific funnel ID yet, the webhook or admin will assign.
                }),
            })

            if (!response.ok) throw new Error("Failed to submit")

            setIsSuccess(true)
            toast.success("Obrigado por te juntares à lista de espera!")
        } catch (error) {
            console.error(error)
            toast.error("Ocorreu um erro. Tenta novamente mais tarde.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/10 border border-primary/20 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto"
            >
                <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Lugar Garantido!</h3>
                <p className="text-muted-foreground text-sm">
                    Ficarás a saber antes de todos assim que lançarmos. Fica atento ao teu email.
                </p>
            </motion.div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm mx-auto space-y-4 relative z-10">
                <div className="flex flex-col gap-3">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="O teu nome"
                                        className="h-12 bg-white/60 dark:bg-white/5 backdrop-blur-md border-white/20 dark:border-white/10 rounded-xl px-4 text-sm"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs text-red-400" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="O teu melhor email"
                                        className="h-12 bg-white/60 dark:bg-white/5 backdrop-blur-md border-white/20 dark:border-white/10 rounded-xl px-4 text-sm"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs text-red-400" />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 rounded-xl bg-primary text-white font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/25 relative overflow-hidden group w-full"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center justify-center gap-2">
                            {isSubmitting ? "A entrar na lista..." : "Quero acesso antecipado"}
                            {!isSubmitting && <ArrowRight className="size-4" />}
                        </span>
                    </Button>
                </div>
            </form>
        </Form>
    )
}
