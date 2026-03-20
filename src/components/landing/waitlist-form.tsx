"use client"

import { useRef, useState } from "react"
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
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { usePostHog } from "@posthog/next"

export function WaitlistForm({ inputId }: { inputId?: string }) {
    const t = useTranslations("Landing.WaitlistForm")
    const posthog = usePostHog()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const hasTrackedNameFocus = useRef(false)
    const hasTrackedEmailFocus = useRef(false)

    const waitlistSchema = z.object({
        name: z.string().min(2, { message: t("validation.nameRequired") }),
        email: z.string().email({ message: t("validation.emailInvalid") }),
    })

    const form = useForm<z.infer<typeof waitlistSchema>>({
        resolver: zodResolver(waitlistSchema),
        defaultValues: {
            name: "",
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof waitlistSchema>) {
        setIsSubmitting(true)
        posthog.capture("landing_waitlist_submit_clicked", {
            source: "landing_waitlist",
        })

        try {
            const response = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    source: "landing_waitlist",
                }),
            })

            if (!response.ok) throw new Error("Failed to submit")

            setIsSuccess(true)
            posthog.capture("landing_waitlist_submitted", {
                source: "landing_waitlist",
            })
            toast.success(t("success.toast"))
        } catch (error) {
            posthog.capture("landing_waitlist_submit_failed", {
                source: "landing_waitlist",
            })
            console.error(error)
            toast.error(t("error.toast"))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/10 border border-primary/20 rounded-2xl px-5 py-6 md:px-6 md:py-7 flex items-center justify-center max-w-[600px] mx-auto"
            >
                <div className="inline-flex items-center gap-3 text-center">
                    <div className="size-9 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="size-5 text-primary" />
                    </div>
                    <p className="text-sm md:text-[15px] font-semibold text-slate-800 whitespace-nowrap">
                        {t("success.message")}
                    </p>
                </div>
            </motion.div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full relative z-10">
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 p-1.5 bg-white border border-slate-200 rounded-2xl sm:rounded-full shadow-lg shadow-slate-200/40 focus-within:ring-4 focus-within:ring-primary/10 transition-all hover:shadow-xl hover:shadow-slate-200/50 overflow-hidden">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="flex-1 mb-0 sm:border-r sm:border-slate-200 px-2">
                                <FormControl>
                                    <Input
                                        id={inputId}
                                        placeholder={t("placeholders.name")}
                                        className="h-12 border-0 bg-transparent text-slate-900 placeholder:text-slate-500 focus-visible:ring-0 shadow-none px-3 font-medium text-sm"
                                        onFocus={() => {
                                            if (!hasTrackedNameFocus.current) {
                                                hasTrackedNameFocus.current = true
                                                posthog.capture("landing_waitlist_name_input_focused", {
                                                    source: "landing_waitlist",
                                                })
                                            }
                                        }}
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="h-[1px] w-full bg-slate-200 sm:hidden mx-2" />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="flex-[2] mb-0 px-2">
                                <FormControl>
                                    <Input
                                        placeholder={t("placeholders.email")}
                                        className="h-12 border-0 bg-transparent text-slate-900 placeholder:text-slate-500 focus-visible:ring-0 shadow-none px-3 font-medium text-sm"
                                        onFocus={() => {
                                            if (!hasTrackedEmailFocus.current) {
                                                hasTrackedEmailFocus.current = true
                                                posthog.capture("landing_waitlist_email_input_focused", {
                                                    source: "landing_waitlist",
                                                })
                                            }
                                        }}
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 sm:h-[46px] rounded-xl sm:rounded-full bg-primary text-white font-bold text-sm px-6 sm:px-8 hover:bg-primary/90 active:scale-[0.98] transition-all shrink-0 relative overflow-hidden group w-full sm:w-auto mt-2 sm:mt-0 sm:ml-1"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center justify-center gap-2 whitespace-nowrap">
                            {isSubmitting ? t("button.loading") : t("button.submit")}
                        </span>
                    </Button>
                </div>
                
                {/* Error messages positioned absolutely below to not break the pill layout */}
                <div className="absolute left-6 -bottom-6 flex gap-4 text-[10px] text-red-500 font-medium">
                    {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}
                    {form.formState.errors.email && !form.formState.errors.name && <span>{form.formState.errors.email.message}</span>}
                </div>
            </form>
        </Form>
    )
}
