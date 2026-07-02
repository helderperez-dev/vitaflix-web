"use client"

import { useRef, useState } from "react"
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
} from "@/components/ui/form"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { usePostHog } from "@posthog/next"
import { useRouter } from "@/i18n/routing"

export function NewsletterForm({ inputId }: { inputId?: string }) {
    const t = useTranslations("Landing.NewsletterForm")
    const posthog = usePostHog()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
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
        posthog.capture("landing_newsletter_submit_clicked", {
            source: "landing_newsletter",
        })

        try {
            const response = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    source: "landing_newsletter",
                }),
            })

            if (!response.ok) throw new Error("Failed to submit")

            posthog.capture("landing_newsletter_submitted", {
                source: "landing_newsletter",
            })
            // Success toast removed as we now redirect to a dedicated page
            
            // Redirect to thank you page
            router.push("/thank-you")
        } catch (error) {
            posthog.capture("landing_newsletter_submit_failed", {
                source: "landing_newsletter",
            })
            console.error(error)
            toast.error(t("error.toast"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full relative z-10">
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 p-1.5 bg-white border border-slate-200 rounded-2xl sm:rounded-[32px] shadow-lg shadow-slate-200/40 focus-within:ring-4 focus-within:ring-primary/10 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="w-full sm:flex-1 mb-0 sm:border-r sm:border-slate-200">
                                <FormControl>
                                    <Input
                                        id={inputId}
                                        placeholder={t("placeholders.name")}
                                        className="h-12 border-0 bg-transparent text-slate-900 placeholder:text-slate-500 focus-visible:ring-0 shadow-none px-4 font-medium text-sm w-full truncate"
                                        onFocus={() => {
                                            if (!hasTrackedNameFocus.current) {
                                                hasTrackedNameFocus.current = true
                                                posthog.capture("landing_newsletter_name_input_focused", {
                                                    source: "landing_newsletter",
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
                            <FormItem className="w-full sm:flex-1 mb-0">
                                <FormControl>
                                    <Input
                                        placeholder={t("placeholders.email")}
                                        className="h-12 border-0 bg-transparent text-slate-900 placeholder:text-slate-500 focus-visible:ring-0 shadow-none px-4 font-medium text-sm w-full truncate"
                                        onFocus={() => {
                                            if (!hasTrackedEmailFocus.current) {
                                                hasTrackedEmailFocus.current = true
                                                posthog.capture("landing_newsletter_email_input_focused", {
                                                    source: "landing_newsletter",
                                                    email: field.value
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
                        className="h-12 sm:h-[46px] rounded-xl sm:rounded-full bg-primary text-white font-bold text-sm px-5 hover:bg-primary/90 active:scale-[0.98] transition-all shrink-0 relative overflow-hidden group w-full sm:w-auto mt-2 sm:mt-0"
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
