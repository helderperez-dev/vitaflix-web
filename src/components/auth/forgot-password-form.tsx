"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"

import { requestPasswordReset } from "@/app/actions/users"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const forgotPasswordSchema = z.object({
    email: z.email({ message: "Invalid email address." }),
})

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const locale = useLocale()
    const t = useTranslations("Auth")

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        setIsLoading(true)
        setError(null)

        const result = await requestPasswordReset(values.email, locale)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
            return
        }

        setIsSubmitted(true)
        setIsLoading(false)
    }

    if (isSubmitted) {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-5">
                    <p className="text-sm font-semibold text-foreground">{t("forgotPasswordEmailSentTitle")}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{t("forgotPasswordEmailSentDescription")}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => setIsSubmitted(false)}
                    >
                        {t("requestNewLink")}
                    </Button>
                    <Button asChild className="h-11">
                        <Link href="/login">{t("backToLogin")}</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-foreground/80 font-medium">{t("email")}</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={t("emailPlaceholder")}
                                    className="h-12 text-base transition-all duration-300 bg-background"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t("sendingResetLink")}
                        </>
                    ) : (
                        t("sendResetLink")
                    )}
                </Button>
                <div className="flex justify-center">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                        {t("backToLogin")}
                    </Link>
                </div>
            </form>
        </Form>
    )
}
