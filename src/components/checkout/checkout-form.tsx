"use client"

import * as React from "react"
import { loadStripe, type StripeElementLocale, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Loader2, Lock, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, getMediaUrl } from "@/lib/utils"
import { checkoutRegisterAndSubscribe, previewPromotionCode } from "@/app/actions/checkout"
import { usePostHog } from "posthog-js/react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type CheckoutPrice = {
    id: string
    productId: string
    currency: string
    unitAmount: number | null
    recurring?: {
        interval?: "month" | "year" | string | null
        intervalCount?: number | null
    } | null
    productName?: string
}

type CheckoutPlan = {
    id: string
    name: string
    prices: CheckoutPrice[]
}

type CheckoutSession = {
    user?: {
        email?: string | null
        phone?: string | null
        user_metadata?: {
            name?: string | null
            full_name?: string | null
            avatar_url?: string | null
            picture?: string | null
        } | null
    } | null
} | null

interface CheckoutFormProps {
    plans: CheckoutPlan[]
    initialSession: CheckoutSession
    userProfile?: {
        display_name?: string | null
        avatar_url?: string | null
    } | null
    locale: string
    preSelectedPriceId?: string
    initialCoupon?: string
    invoiceDetails?: {
        id: string
        amount: number
        currency: string
        number: string | null
        clientSecret: string
        hostedInvoiceUrl?: string | null
    } | null
    currentSubscriptionPriceId?: string | null
}

type PromotionPreviewState =
    | { status: "idle" }
    | { status: "loading" }
    | {
        status: "valid"
        code: string
        subtotalAmount: number
        discountAmount: number
        totalAmount: number
        currency: string
        percentOff: number | null
        amountOff: number | null
    }
    | {
        status: "invalid"
        reason: "required" | "invalid" | "expired" | "minimum_amount" | "currency_mismatch" | "not_applicable"
        applicableProducts?: string[]
    }

function formatPrice(amount?: number | null, currency?: string | null) {
    return ((amount ?? 0) / 100).toLocaleString(undefined, {
        style: "currency",
        currency: currency || "usd",
    })
}

function getStripeLocale(locale: string): StripeElementLocale {
    switch (locale) {
        case "pt-br":
            return "pt-BR"
        case "pt-pt":
            return "pt"
        case "es":
            return "es"
        case "en":
            return "en"
        default:
            return "auto"
    }
}

function getPlanPresentation(price: CheckoutPrice, t: ReturnType<typeof useTranslations>) {
    const interval = price.recurring?.interval ?? "month"
    const intervalCount = price.recurring?.intervalCount ?? 1

    if (interval === "month" && intervalCount === 1) {
        return {
            badge: t("monthly"),
            description: t("billedMonthly"),
            summary: t("perMonth"),
        }
    }

    if (interval === "month" && intervalCount === 3) {
        return {
            badge: t("quarterly"),
            description: t("billedQuarterly"),
            summary: t("perQuarter"),
        }
    }

    if (interval === "year" && intervalCount === 1) {
        return {
            badge: t("yearly"),
            description: t("billedYearly"),
            summary: t("perYear"),
        }
    }

    return {
        badge: `${intervalCount} ${interval === "year" ? t("years") : t("months")}`,
        description: interval === "year" ? t("billedYearly") : t("billedMonthly"),
        summary: `${t("every")} ${intervalCount} ${interval === "year" ? t("years") : t("months")}`,
    }
}

function getPlanSortValue(price: CheckoutPrice) {
    const interval = price.recurring?.interval ?? "month"
    const intervalCount = price.recurring?.intervalCount ?? 1

    if (interval === "month") return intervalCount
    if (interval === "year") return intervalCount * 12

    return Number.MAX_SAFE_INTEGER
}

function getUserInitials(name?: string | null, email?: string | null) {
    const base = (name || email || "").trim()
    if (!base) return "V"

    const parts = base.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
        return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
    }

    return base.slice(0, 2).toUpperCase()
}

function translateStripeErrorMessage(message: string | undefined, t: ReturnType<typeof useTranslations>) {
    if (!message) {
        return t("checkPaymentDetails")
    }

    const normalized = message.trim().toLowerCase()

    if (normalized.includes("expiration date is in the past")) {
        return t("stripeErrorCardExpired")
    }
    if (normalized.includes("security code is incomplete") || normalized.includes("security code is invalid")) {
        return t("stripeErrorCardCvc")
    }
    if (normalized.includes("card number is incomplete") || normalized.includes("card number is invalid")) {
        return t("stripeErrorCardNumber")
    }
    if (normalized.includes("expiration date is incomplete") || normalized.includes("expiration date is invalid")) {
        return t("stripeErrorCardExpiry")
    }
    if (normalized.includes("card was declined")) {
        return t("stripeErrorCardDeclined")
    }

    return t("checkPaymentDetails")
}

function translateCheckoutErrorMessage(message: string | undefined, t: ReturnType<typeof useTranslations>) {
    if (!message) {
        return t("failedToCreateSubscription")
    }

    const [ns, key] = message.includes(".") ? message.split(".") : [null, null]

    if (ns === "Checkout" && key) {
        return t(key as never)
    }

    return translateStripeErrorMessage(message, t)
}

export function CheckoutForm({ plans, initialSession, userProfile, locale, preSelectedPriceId, initialCoupon, invoiceDetails, currentSubscriptionPriceId }: CheckoutFormProps) {
    const orderedPlanPrices = React.useMemo(
        () =>
            plans
                .flatMap((plan) => plan.prices.map((price) => ({ ...price, productName: plan.name })))
                .filter((price) => price.id !== currentSubscriptionPriceId)
                .sort((a, b) => getPlanSortValue(a) - getPlanSortValue(b)),
        [plans, currentSubscriptionPriceId]
    )

    const isInvoicePayment = !!invoiceDetails

    const [selectedPriceId, setSelectedPriceId] = React.useState<string>(() => {
        if (isInvoicePayment) return ""
        if (preSelectedPriceId) {
            const exists = orderedPlanPrices.some(p => p.id === preSelectedPriceId)
            if (exists) return preSelectedPriceId
        }
        return orderedPlanPrices[0]?.id || ""
    })
    const basePrice = orderedPlanPrices[0] ?? null
    
    const selectedPrice = orderedPlanPrices.find((price) => price.id === selectedPriceId) || null

    const options = React.useMemo<StripeElementsOptions>(() => {
        if (isInvoicePayment && invoiceDetails?.clientSecret) {
            return {
                clientSecret: invoiceDetails.clientSecret,
                locale: getStripeLocale(locale),
                appearance: {
                    theme: "stripe",
                    variables: {
                        colorPrimary: "#13A57E",
                        colorBackground: "#ffffff",
                        colorText: "#0f172a",
                        colorDanger: "#ef4444",
                        fontFamily: "system-ui, sans-serif",
                        borderRadius: "6px",
                    },
                },
            }
        }

        return {
            // Keep Elements mounted while the user switches plans; the actual price used
            // for the subscription still comes from `selectedPriceId` on submit.
            mode: "subscription",
            amount: basePrice?.unitAmount || 1000,
            currency: basePrice?.currency || "usd",
            locale: getStripeLocale(locale),
            appearance: {
                theme: "stripe",
                variables: {
                    colorPrimary: "#13A57E",
                    colorBackground: "#ffffff",
                    colorText: "#0f172a",
                    colorDanger: "#ef4444",
                    fontFamily: "system-ui, sans-serif",
                    borderRadius: "6px",
                },
            },
        }
    }, [basePrice?.currency, basePrice?.unitAmount, locale, isInvoicePayment, invoiceDetails])

    if (orderedPlanPrices.length === 0 && !isInvoicePayment) {
        return <div className="p-8 text-center text-red-500">Nenhum plano configurado no Stripe.</div>
    }

    return (
        <Elements stripe={stripePromise} options={options}>
            <CheckoutFormContent 
                initialSession={initialSession} 
                userProfile={userProfile}
                selectedPriceId={selectedPriceId}
                setSelectedPriceId={setSelectedPriceId}
                selectedPrice={selectedPrice}
                orderedPlanPrices={orderedPlanPrices}
                initialCoupon={initialCoupon}
                invoiceDetails={invoiceDetails}
                locale={locale}
            />
        </Elements>
    )
}

function CheckoutFormContent({ 
    initialSession, 
    userProfile,
    selectedPriceId, 
    setSelectedPriceId,
    selectedPrice,
    orderedPlanPrices,
    initialCoupon,
    locale,
    invoiceDetails
}: {
    initialSession: CheckoutSession
    userProfile?: {
        display_name?: string | null
        avatar_url?: string | null
    } | null
    selectedPriceId: string
    setSelectedPriceId: React.Dispatch<React.SetStateAction<string>>
    selectedPrice: CheckoutPrice | null
    orderedPlanPrices: (CheckoutPrice & { productName?: string })[]
    initialCoupon?: string
    locale: string
    invoiceDetails?: {
        id: string
        amount: number
        currency: string
        number: string | null
        clientSecret: string
        hostedInvoiceUrl?: string | null
    } | null
}) {
    const stripe = useStripe()
    const elements = useElements()
    const router = useRouter()
    const posthog = usePostHog()
    const t = useTranslations("Checkout")
    const selectedPlanPresentation = selectedPrice ? getPlanPresentation(selectedPrice, t) : null
    const sessionEmail = initialSession?.user?.email || ""
    const sessionName =
        userProfile?.display_name ||
        initialSession?.user?.user_metadata?.name ||
        initialSession?.user?.user_metadata?.full_name ||
        ""
    const sessionPhone = initialSession?.user?.phone || ""
    const sessionAvatar =
        userProfile?.avatar_url ||
        initialSession?.user?.user_metadata?.avatar_url ||
        initialSession?.user?.user_metadata?.picture ||
        ""
    const identityName = sessionName || sessionEmail.split("@")[0] || "Vitaflix"

    const isInvoicePayment = !!invoiceDetails
    
    const [email, setEmail] = React.useState(sessionEmail)
    const [password, setPassword] = React.useState("")
    const [name, setName] = React.useState(sessionName)
    const [couponCode, setCouponCode] = React.useState(initialCoupon || "")
    
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [promotionPreview, setPromotionPreview] = React.useState<PromotionPreviewState>({ status: "idle" })

    const subtotalAmount = isInvoicePayment ? (invoiceDetails?.amount ?? 0) : (selectedPrice?.unitAmount ?? 0)
    const checkoutCurrency = isInvoicePayment ? (invoiceDetails?.currency ?? "usd") : (selectedPrice?.currency ?? "usd")

    const effectiveTotalAmount =
        promotionPreview.status === "valid" && promotionPreview.currency === checkoutCurrency
            ? promotionPreview.totalAmount
            : subtotalAmount
    const effectiveDiscountAmount =
        promotionPreview.status === "valid" && promotionPreview.currency === checkoutCurrency
            ? promotionPreview.discountAmount
            : 0
    const hasValidPromotion = promotionPreview.status === "valid" && effectiveDiscountAmount > 0

    React.useEffect(() => {
        if (selectedPrice) {
            posthog?.capture("checkout_started", {
                price_id: selectedPrice.id,
                plan_name: selectedPrice.productName,
                currency: selectedPrice.currency,
                amount: selectedPrice.unitAmount,
                is_invoice_payment: isInvoicePayment
            })
        } else if (isInvoicePayment && invoiceDetails) {
            posthog?.capture("checkout_started", {
                invoice_id: invoiceDetails.id,
                currency: invoiceDetails.currency,
                amount: invoiceDetails.amount,
                is_invoice_payment: true
            })
        }
    }, [posthog, selectedPrice?.id, selectedPrice?.productName, selectedPrice?.currency, selectedPrice?.unitAmount, isInvoicePayment, invoiceDetails?.id, invoiceDetails?.currency, invoiceDetails?.amount])

    const paymentElementOptions = React.useMemo(() => {
        if (isInvoicePayment) {
            return {
                defaultValues: {
                    billingDetails: {
                        email: email || undefined,
                        name: name || sessionName || undefined,
                        phone: sessionPhone || undefined,
                    },
                },
                layout: "accordion" as const,
            }
        }

        return {
            layout: "tabs" as const,
            defaultValues: {
                billingDetails: {
                    email: email || undefined,
                    name: name || sessionName || undefined,
                    phone: sessionPhone || undefined,
                },
            },
            fields: {
                billingDetails: {
                    name: "never" as const,
                    email: "never" as const,
                    address: "if_required" as const,
                },
            },
            wallets: {
                link: "never" as const,
                applePay: "auto" as const,
                googlePay: "auto" as const,
            },
            terms: {
                card: "never" as const,
                applePay: "never" as const,
                googlePay: "never" as const,
            },
        }
    }, [email, isInvoicePayment, name, sessionName, sessionPhone])

    React.useEffect(() => {
        const trimmedCode = couponCode.trim()

        if (!trimmedCode) {
            setPromotionPreview({ status: "idle" })
            return
        }

        let isActive = true
        setPromotionPreview({ status: "loading" })

        const timeoutId = window.setTimeout(async () => {
            try {
                const result = await previewPromotionCode({
                    priceId: selectedPriceId,
                    promotionCode: trimmedCode,
                })

                if (!isActive) return

                if (result.valid) {
                    setPromotionPreview({
                        status: "valid",
                        code: result.code,
                        subtotalAmount: result.subtotalAmount,
                        discountAmount: result.discountAmount,
                        totalAmount: result.totalAmount,
                        currency: result.currency,
                        percentOff: result.percentOff,
                        amountOff: result.amountOff,
                    })
                    posthog?.capture("promotion_applied", {
                        code: result.code,
                        discount_amount: result.discountAmount,
                        percent_off: result.percentOff,
                        amount_off: result.amountOff
                    })
                    return
                }

                setPromotionPreview({
                    status: "invalid",
                    reason: result.reason,
                    applicableProducts: 'applicableProducts' in result ? result.applicableProducts : undefined,
                })
                posthog?.capture("promotion_invalid", {
                    code: trimmedCode,
                    reason: result.reason
                })
            } catch (error) {
                if (!isActive) return
                console.error("Promotion code preview failed:", error)
                setPromotionPreview({
                    status: "invalid",
                    reason: "invalid",
                })
            }
        }, 350)

        return () => {
            isActive = false
            window.clearTimeout(timeoutId)
        }
    }, [couponCode, selectedPriceId])

    const handleSubmit: NonNullable<React.ComponentProps<"form">["onSubmit"]> = async (e) => {
        e.preventDefault()

        if (!stripe || !elements) {
            toast.error(t("stripeNotReady"))
            return
        }

        if (!initialSession) {
            if (!name.trim()) {
                toast.error(t("nameRequired"))
                return
            }

            if (!email.trim()) {
                toast.error(t("emailRequired"))
                return
            }

            if (!password.trim()) {
                toast.error(t("passwordRequired"))
                return
            }

            if (password.trim().length < 6) {
                toast.error(t("passwordTooShort"))
                return
            }
        }

        setIsSubmitting(true)
        posthog?.capture("payment_submitted", {
            price_id: selectedPriceId,
            amount: effectiveTotalAmount,
            currency: checkoutCurrency,
            has_promotion: hasValidPromotion,
            is_invoice_payment: isInvoicePayment,
            invoice_id: invoiceDetails?.id
        })

        try {
            const { error: submitError } = await elements.submit()
            if (submitError) {
                toast.error(translateStripeErrorMessage(submitError.message, t))
                setIsSubmitting(false)
                posthog?.capture("payment_failed", {
                    reason: "elements_submit_error",
                    error_message: submitError.message
                })
                return
            }

            let confirmClientSecret = ""
            
            if (isInvoicePayment && invoiceDetails?.clientSecret) {
                confirmClientSecret = invoiceDetails.clientSecret
            } else {
                const result = await checkoutRegisterAndSubscribe({
                    email,
                    password: initialSession ? undefined : password,
                    name,
                    priceId: selectedPriceId,
                    promotionCode: promotionPreview.status === "valid" ? promotionPreview.code : undefined,
                })

                if (result.error) {
                    toast.error(translateCheckoutErrorMessage(result.error, t))
                    setIsSubmitting(false)
                    posthog?.capture("payment_failed", {
                        reason: "backend_checkout_error",
                        error_message: result.error
                    })
                    return
                }

                if (!result.clientSecret) {
                    posthog?.capture("payment_success", {
                        price_id: selectedPriceId,
                        amount: effectiveTotalAmount,
                        currency: checkoutCurrency,
                        method: "free_or_100_percent_discount"
                    })
                    router.push(`/${locale}/checkout/success`)
                    return
                }
                
                confirmClientSecret = result.clientSecret
            }

            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                clientSecret: confirmClientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/${locale}/checkout/success`,
                    payment_method_data: {
                        billing_details: {
                            email,
                            name: name || undefined,
                            ...(sessionPhone ? { phone: sessionPhone } : {}),
                        }
                    }
                },
            })

            if (confirmError) {
                toast.error(translateStripeErrorMessage(confirmError.message, t))
                setIsSubmitting(false)
                posthog?.capture("payment_failed", {
                    reason: "stripe_confirm_error",
                    error_message: confirmError.message
                })
            }
            // If there's no confirmError, Stripe will redirect to return_url automatically.
        } catch (err: unknown) {
            console.error("Checkout error:", err)
            toast.error(t("unexpectedCheckoutError"))
            setIsSubmitting(false)
            posthog?.capture("payment_failed", {
                reason: "unexpected_error",
                error_message: err instanceof Error ? err.message : String(err)
            })
        }
    }

    return (
        <div className="flex min-h-dvh w-full flex-col overflow-hidden md:h-dvh md:flex-row">
            
            {/* LEFT SIDE - SUMMARY (Gray) */}
            <div className="flex w-full flex-col border-b border-slate-200 bg-[#F4F4F5] p-5 md:border-b-0 md:border-r md:sticky md:top-0 md:h-dvh md:w-[34%] md:self-start md:px-7 md:py-7 md:overflow-hidden lg:w-[31%] lg:px-8">
                
                {/* Logo and Back */}
                <div className="mb-6 flex items-center gap-4 md:mb-10">
                    <button type="button" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="size-5" />
                    </button>
                    <div className="relative w-28 h-8">
                        <Image
                            src="/vitaflix_logo_light_mode.png"
                            alt="Vitaflix Logo"
                            fill
                            priority
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Invoice Payment Display */}
                {isInvoicePayment && invoiceDetails ? (
                    <div className="flex flex-1 flex-col gap-3">
                        <h2 className="text-xl font-semibold text-slate-900">{t("payInvoiceTitle", { number: invoiceDetails.number || invoiceDetails.id })}</h2>
                        <p className="text-sm text-slate-500">{t("payInvoiceDescription")}</p>
                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="text-sm text-slate-500">{t("invoiceTotal")}</div>
                            <div className="mt-1 text-2xl font-bold text-slate-900">
                                {formatPrice(invoiceDetails.amount, invoiceDetails.currency)}
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className={cn("flex-1 space-y-5 md:space-y-4", isInvoicePayment && "hidden")}>
                    <p className="text-slate-500 font-medium">{t("subscribeToVitaflix")}</p>
                    
                    <div className="flex items-end justify-between">
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-[2.7rem]">
                            {formatPrice(effectiveTotalAmount, checkoutCurrency)}
                        </h2>
                        <span className="mb-1 text-sm font-medium tracking-tight text-slate-500">{selectedPlanPresentation?.summary}</span>
                    </div>

                    <div className="space-y-2.5 border-t border-slate-200 pt-4">
                        <div className="flex justify-between text-sm font-semibold">
                            <div>
                                <span className="block text-slate-700">{selectedPrice?.productName}</span>
                                <span className="mt-0.5 block text-xs font-medium text-slate-400">{selectedPlanPresentation?.description}</span>
                            </div>
                            <span className="text-slate-900">{formatPrice(subtotalAmount, checkoutCurrency)}</span>
                        </div>

                        {hasValidPromotion ? (
                            <div className="flex justify-between text-sm font-semibold text-primary">
                                <span>{t("discount")} {promotionPreview.status === "valid" ? `(${promotionPreview.code})` : ""}</span>
                                <span>-{formatPrice(effectiveDiscountAmount, checkoutCurrency)}</span>
                            </div>
                        ) : null}

                        <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold">
                            <span className="text-slate-500">{t("totalDueToday")}</span>
                            <span className="text-slate-900">{formatPrice(effectiveTotalAmount, checkoutCurrency)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 flex items-center gap-1.5 text-[11px] font-semibold tracking-tight uppercase text-slate-500 md:mt-10">
                    <Lock className="size-3" />
                    {t("poweredByStripe")}
                </div>
            </div>

            {/* RIGHT SIDE - FORM (White) */}
            <div className="flex w-full flex-col bg-white p-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:h-dvh md:w-[66%] md:px-8 md:py-7 md:overflow-y-auto md:overflow-x-hidden lg:w-[69%] lg:px-10">
                <form noValidate onSubmit={handleSubmit} className="mx-auto mt-1 w-full max-w-2xl space-y-5 pb-8 md:mt-0 md:pb-6">
                    <div className={cn("space-y-2.5", isInvoicePayment && "hidden")}>
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-lg font-bold tracking-tight text-slate-900">{t("plan")}</h3>
                            {initialSession?.user?.email ? (
                                <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                                    <Avatar size="sm" className="border border-primary/10 bg-white size-7">
                                        {sessionAvatar ? <AvatarImage src={getMediaUrl(sessionAvatar)} alt={identityName} /> : null}
                                        <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                                            {getUserInitials(sessionName, sessionEmail)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 leading-none">
                                        <p className="truncate text-xs font-semibold text-slate-900">{identityName}</p>
                                        <p className="mt-1 truncate text-[11px] font-medium text-slate-500">{sessionEmail}</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
                            {orderedPlanPrices.map((price) => (
                                <label
                                    key={price.id} 
                                    aria-checked={selectedPriceId === price.id}
                                    className={cn(
                                        "cursor-pointer rounded-2xl border p-3.5 transition-all",
                                        selectedPriceId === price.id
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-slate-200 hover:border-slate-300"
                                    )}
                                    onClick={() => setSelectedPriceId(price.id)}
                                >
                                    {(() => {
                                        const presentation = getPlanPresentation(price, t)

                                        return (
                                            <div className="flex h-full flex-col">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className={cn("mt-0.5 flex size-4 rounded-full border items-center justify-center", selectedPriceId === price.id ? "border-primary" : "border-slate-300")}>
                                            {selectedPriceId === price.id && <div className="size-2 rounded-full bg-primary" />}
                                                    </div>
                                                    <span className="text-right text-sm font-semibold text-slate-900">
                                                        {formatPrice(price.unitAmount, price.currency)}
                                                    </span>
                                                </div>
                                                <div className="mt-3">
                                                    <p className="text-sm font-bold text-slate-900">{presentation.badge}</p>
                                                    <p className="mt-1 text-xs leading-4 text-slate-500">{presentation.description}</p>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </label>
                            ))}
                        </div>
                    </div>

                    {!initialSession ? (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold tracking-tight text-slate-900">{t("contact")}</h3>
                                <p className="text-sm font-medium text-slate-500">{t("guestCheckoutDescription")}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                                <Input 
                                    type="text" 
                                    required
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder={t("namePlaceholder")}
                                    className="h-11 border-slate-200 bg-white font-medium md:col-span-2"
                                />
                                <Input 
                                    type="email" 
                                    required 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder={t("emailPlaceholder")}
                                    className="h-11 border-slate-200 bg-white font-medium"
                                />
                                <Input 
                                    type="password" 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder={t("passwordPlaceholder")}
                                    className="h-11 border-slate-200 bg-white font-medium"
                                    minLength={6}
                                />
                            </div>
                        </div>
                    ) : null}

                    {/* Payment */}
                    <div className="space-y-2.5">
                        <h3 className="text-lg font-bold tracking-tight text-slate-900">{t("payment")}</h3>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <PaymentElement
                                key={invoiceDetails?.id || selectedPriceId}
                                options={paymentElementOptions}
                            />
                        </div>
                    </div>

                    <div className={cn("space-y-1.5 pt-2 pb-1", isInvoicePayment && "hidden")}>
                        <Input 
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder={t("addPromotionCode")}
                            className="bg-white border-slate-200 shadow-sm h-11 text-sm font-medium"
                        />
                        {promotionPreview.status === "loading" ? (
                            <p className="text-xs font-medium text-slate-400">{t("checkingPromotionCode")}</p>
                        ) : null}
                        {promotionPreview.status === "valid" ? (
                            <p className="text-xs font-medium text-primary">
                                {promotionPreview.percentOff
                                    ? t("promotionAppliedPercent", { percent: promotionPreview.percentOff })
                                    : t("promotionAppliedAmount", { amount: formatPrice(promotionPreview.amountOff, checkoutCurrency) })}
                            </p>
                        ) : null}
                        {promotionPreview.status === "invalid" ? (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-red-500">
                                    {promotionPreview.reason === "expired"
                                        ? t("promotionCodeExpired")
                                        : promotionPreview.reason === "minimum_amount"
                                            ? t("promotionCodeMinimumAmount")
                                            : promotionPreview.reason === "currency_mismatch"
                                                ? t("promotionCodeCurrencyMismatch")
                                                : promotionPreview.reason === "not_applicable"
                                                    ? t("promotionCodeNotApplicable")
                                                    : t("promotionCodeInvalid")}
                                </p>
                                {promotionPreview.reason === "not_applicable" && promotionPreview.applicableProducts && promotionPreview.applicableProducts.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {orderedPlanPrices
                                            .filter((p) => promotionPreview.applicableProducts!.includes(p.productId))
                                            .map((p) => {
                                                const presentation = getPlanPresentation(p, t)
                                                return (
                                                    <Button
                                                        key={p.id}
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 hover:text-primary"
                                                        onClick={() => setSelectedPriceId(p.id)}
                                                    >
                                                        {t("applyToPlan", { plan: presentation.badge })}
                                                    </Button>
                                                )
                                            })}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <Button 
                        type="submit" 
                        disabled={!stripe || isSubmitting} 
                        className="mt-1 h-11 w-full rounded-xl bg-primary text-sm font-bold text-white shadow-none hover:bg-primary/90"
                    >
                        {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : t("payAmount", { amount: formatPrice(effectiveTotalAmount, checkoutCurrency) })}
                    </Button>
                </form>
            </div>

        </div>
    )
}
