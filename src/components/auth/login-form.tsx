"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { loginAction } from "@/app/actions/auth"
import { useLocale, useTranslations } from "next-intl"
import posthog from "posthog-js"

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const locale = useLocale()
    const t = useTranslations("Auth")

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true)
        setError(null)

        const result = await loginAction({ ...values, locale })

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
            posthog.capture('login_failed', { error: result.error })
        } else {
            posthog.identify(values.email, { email: values.email })
            posthog.capture('user_logged_in', { email: values.email })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-5">
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
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-foreground/80 font-medium">{t("password")}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-12 text-base transition-all duration-300 bg-background"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full h-12 text-base font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t("signingIn")}
                        </>
                    ) : (
                        t("signIn")
                    )}
                </Button>
            </form>
        </Form>
    )
}
