"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { EmailOtpType } from "@supabase/supabase-js"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"

import { createClient } from "@/lib/supabase/client"
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

type FormStatus = "checking" | "ready" | "error" | "success"

export function ResetPasswordForm() {
    const t = useTranslations("Auth")
    const [status, setStatus] = useState<FormStatus>("checking")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const supabase = useMemo(() => createClient(), [])

    const resetPasswordSchema = useMemo(() => z.object({
        password: z.string().min(6, { message: t("passwordTooShort") }),
        confirmPassword: z.string().min(6, { message: t("passwordTooShort") }),
    }).refine((values) => values.password === values.confirmPassword, {
        message: t("passwordsDoNotMatch"),
        path: ["confirmPassword"],
    }), [t])

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    useEffect(() => {
        let isMounted = true

        async function initializeRecoverySession() {
            try {
                const searchParams = new URLSearchParams(window.location.search)
                const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))

                const code = searchParams.get("code")
                const tokenHash = searchParams.get("token_hash")
                const type = searchParams.get("type")
                const accessToken = hashParams.get("access_token")
                const refreshToken = hashParams.get("refresh_token")

                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code)
                    if (error) throw error
                    window.history.replaceState({}, document.title, window.location.pathname)
                } else if (accessToken && refreshToken) {
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    })
                    if (error) throw error
                    window.history.replaceState({}, document.title, window.location.pathname)
                } else if (tokenHash && type) {
                    const { error } = await supabase.auth.verifyOtp({
                        token_hash: tokenHash,
                        type: type as EmailOtpType,
                    })
                    if (error) throw error
                    window.history.replaceState({}, document.title, window.location.pathname)
                }

                const { data, error } = await supabase.auth.getSession()
                if (error) throw error
                if (!data.session) {
                    throw new Error(t("invalidResetLinkDescription"))
                }

                if (isMounted) {
                    setError(null)
                    setStatus("ready")
                }
            } catch (sessionError) {
                if (!isMounted) return

                setError(sessionError instanceof Error ? sessionError.message : t("invalidResetLinkDescription"))
                setStatus("error")
            }
        }

        void initializeRecoverySession()

        return () => {
            isMounted = false
        }
    }, [supabase, t])

    async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
        setIsSubmitting(true)
        setError(null)

        const { error } = await supabase.auth.updateUser({
            password: values.password,
        })

        if (error) {
            setError(error.message)
            setIsSubmitting(false)
            return
        }

        await supabase.auth.signOut()
        setStatus("success")
        setIsSubmitting(false)
    }

    if (status === "checking") {
        return (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{t("verifyingResetLink")}</p>
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-5">
                    <p className="text-sm font-semibold text-foreground">{t("invalidResetLinkTitle")}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{error || t("invalidResetLinkDescription")}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <Button asChild variant="outline" className="h-11">
                        <Link href="/auth/forgot-password">{t("requestNewLink")}</Link>
                    </Button>
                    <Button asChild className="h-11">
                        <Link href="/login">{t("backToLogin")}</Link>
                    </Button>
                </div>
            </div>
        )
    }

    if (status === "success") {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-5">
                    <p className="text-sm font-semibold text-foreground">{t("resetPasswordSuccessTitle")}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{t("resetPasswordSuccessDescription")}</p>
                </div>
                <Button asChild className="h-11 w-full">
                    <Link href="/login">{t("backToLogin")}</Link>
                </Button>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-5">
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
                                        autoComplete="new-password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-foreground/80 font-medium">{t("confirmPassword")}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-12 text-base transition-all duration-300 bg-background"
                                        autoComplete="new-password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t("updatingPassword")}
                        </>
                    ) : (
                        t("updatePassword")
                    )}
                </Button>
            </form>
        </Form>
    )
}
