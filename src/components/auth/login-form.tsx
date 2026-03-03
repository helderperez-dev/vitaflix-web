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
import { useState } from "react"
import { loginAction } from "@/app/actions/auth"
import { useLocale, useTranslations } from "next-intl"

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
                                <FormLabel className="text-white/80 font-medium">{t("email")}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="admin@vitaflix.com"
                                        className="h-12 bg-white/10 dark:bg-white/5 text-white placeholder:text-white/40 backdrop-blur-sm border-white/20 dark:border-white/10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-white/20 dark:focus-visible:bg-white/10 transition-all duration-300"
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
                                <FormLabel className="text-white/80 font-medium">{t("password")}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-12 bg-white/10 dark:bg-white/5 text-white placeholder:text-white/40 backdrop-blur-sm border-white/20 dark:border-white/10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-white/20 dark:focus-visible:bg-white/10 transition-all duration-300"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full h-12 rounded-xl text-base font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]" disabled={isLoading}>
                    {isLoading ? t("signingIn") : t("signIn")}
                </Button>
            </form>
        </Form>
    )
}
