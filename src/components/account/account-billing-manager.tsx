"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import {
    ArrowUpRight,
    Loader2,
    ReceiptText,
} from "lucide-react"
import { toast } from "sonner"
import { Link, useRouter } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due", "incomplete"])

type BillingSummaryResponse = {
    customer: {
        email?: string | null
        name?: string | null
        default_payment_method_id?: string | null
    } | null
    paymentMethods: Array<{
        stripe_payment_method_id: string
        brand: string | null
        last4: string | null
        exp_month: number | null
        exp_year: number | null
        is_default: boolean
        type: string | null
    }>
    subscriptions: Array<{
        id: string
        stripe_subscription_id: string | null
        stripe_price_id: string | null
        status: string
        cancel_at_period_end?: boolean | null
        current_period_end: string | null
        created_at: string
    }>
    invoices: Array<{
        id: string
        stripe_invoice_id?: string | null
        status: string
        total?: number | null
        amount_paid?: number | null
        currency?: string | null
        invoice_pdf?: string | null
        hosted_invoice_url?: string | null
        created_at: string
    }>
    transactions: Array<{
        id: string
        provider_transaction_id?: string | null
        amount: number
        currency: string
        status: string
        created_at: string
    }>
}

type BillingCatalogResponse = {
    prices: CatalogPrice[]
}

type CatalogPrice = {
    id: string
    currency: string
    unitAmount: number | null
    recurring: {
        interval: "day" | "week" | "month" | "year"
        intervalCount: number
        trialPeriodDays: number | null
    } | null
}


function formatCurrency(locale: string, currency: string | null | undefined, amount: number | null | undefined) {
    if (!currency || typeof amount !== "number") {
        return "—"
    }

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(amount / 100)
}

function formatDate(locale: string, value: string | null | undefined) {
    if (!value) {
        return "—"
    }

    return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
    }).format(new Date(value))
}

function getPlanOrder(price: CatalogPrice) {
    if (!price.recurring) {
        return 999
    }

    const { interval, intervalCount } = price.recurring
    if (interval === "month" && intervalCount === 1) {
        return 1
    }
    if (interval === "month" && intervalCount === 3) {
        return 2
    }
    if (interval === "year" && intervalCount === 1) {
        return 3
    }

    return 100 + intervalCount
}

function getPlanName(t: ReturnType<typeof useTranslations>, price: CatalogPrice) {
    if (!price.recurring) {
        return t("customPlan")
    }

    if (price.recurring.interval === "month" && price.recurring.intervalCount === 1) {
        return t("monthly")
    }

    if (price.recurring.interval === "month" && price.recurring.intervalCount === 3) {
        return t("quarterly")
    }

    if (price.recurring.interval === "year" && price.recurring.intervalCount === 1) {
        return t("yearly")
    }

    return t("customPlan")
}

function getPlanDescription(t: ReturnType<typeof useTranslations>, price: CatalogPrice) {
    if (!price.recurring) {
        return t("customPlanDescription")
    }

    if (price.recurring.interval === "month" && price.recurring.intervalCount === 1) {
        return t("monthlyDescription")
    }

    if (price.recurring.interval === "month" && price.recurring.intervalCount === 3) {
        return t("quarterlyDescription")
    }

    if (price.recurring.interval === "year" && price.recurring.intervalCount === 1) {
        return t("yearlyDescription")
    }

    return t("customPlanDescription")
}

function getSubscriptionBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    if (status === "active" || status === "trialing" || status === "paid") {
        return "default"
    }

    if (status === "canceled" || status === "unpaid" || status === "void" || status === "uncollectible") {
        return "destructive"
    }

    if (status === "past_due") {
        return "secondary"
    }

    return "outline"
}

function translateStatus(status: string, t: ReturnType<typeof useTranslations>) {
    switch (status) {
        case "active": return t("status_active");
        case "trialing": return t("status_trialing");
        case "past_due": return t("status_past_due");
        case "canceled": return t("status_canceled");
        case "unpaid": return t("status_unpaid");
        case "incomplete": return t("status_incomplete");
        case "incomplete_expired": return t("status_incomplete_expired");
        case "paused": return t("status_paused");
        case "paid": return t("status_paid");
        case "open": return t("status_open");
        case "void": return t("status_void");
        case "uncollectible": return t("status_uncollectible");
        case "draft": return t("status_draft");
        default: return status;
    }
}

async function readJson<T>(response: Response): Promise<T> {
    const text = await response.text()
    return (text ? JSON.parse(text) : {}) as T
}

export function AccountBillingManager() {
    const router = useRouter()
    const t = useTranslations("AccountBilling")
    const locale = useLocale()
    const [summary, setSummary] = React.useState<BillingSummaryResponse | null>(null)
    const [catalogPrices, setCatalogPrices] = React.useState<CatalogPrice[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [togglingCancellation, setTogglingCancellation] = React.useState(false)

    const loadBilling = React.useCallback(async (background = false) => {
        if (!background) {
            setIsLoading(true)
        }

        try {
            const [summaryResponse, catalogResponse] = await Promise.all([
                fetch("/api/billing/summary", { cache: "no-store" }),
                fetch("/api/billing/catalog", { cache: "no-store" }),
            ])

            const summaryJson = await readJson<BillingSummaryResponse & { error?: string }>(summaryResponse)
            const catalogJson = await readJson<BillingCatalogResponse & { error?: string }>(catalogResponse)

            if (!summaryResponse.ok) {
                throw new Error(summaryJson.error || t("loadError"))
            }

            if (!catalogResponse.ok) {
                throw new Error(catalogJson.error || t("catalogLoadError"))
            }

            setSummary(summaryJson)
            setCatalogPrices(
                (catalogJson.prices || [])
                    .filter(price => !!price.recurring)
                    .sort((left, right) => getPlanOrder(left) - getPlanOrder(right))
            )
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t("loadError"))
        } finally {
            setIsLoading(false)
        }
    }, [t])

    React.useEffect(() => {
        void loadBilling()
    }, [loadBilling])

    const currentSubscription = React.useMemo(() => {
        if (!summary?.subscriptions?.length) {
            return null
        }

        return (
            summary.subscriptions.find(subscription => ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status))
            ?? summary.subscriptions[0]
        )
    }, [summary])

    const currentPrice = React.useMemo(() => {
        if (!currentSubscription?.stripe_price_id) {
            return null
        }

        return catalogPrices.find(price => price.id === currentSubscription.stripe_price_id) ?? null
    }, [catalogPrices, currentSubscription])


    const handleToggleCancellation = async (cancelAtPeriodEnd: boolean) => {
        if (!currentSubscription?.stripe_subscription_id) {
            toast.error(t("missingSubscription"))
            return
        }

        setTogglingCancellation(true)

        try {
            const response = await fetch(`/api/billing/subscriptions/${currentSubscription.stripe_subscription_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ cancelAtPeriodEnd }),
            })
            const json = await readJson<{ error?: string }>(response)

            if (!response.ok) {
                throw new Error(json.error || t("subscriptionUpdateError"))
            }

            toast.success(cancelAtPeriodEnd ? t("cancelScheduled") : t("subscriptionResumed"))
            await loadBilling(true)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t("subscriptionUpdateError"))
        } finally {
            setTogglingCancellation(false)
        }
    }

    const handlePlanChange = async (priceId: string) => {
        if (currentSubscription?.stripe_price_id === priceId) {
            return
        }

        router.push(`/checkout?price=${priceId}`)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">{t("billingTitle")}</h2>
                    <p className="text-sm text-muted-foreground">{t("billingDescription")}</p>
                </div>
            </div>

            <Tabs defaultValue="subscription" className="gap-6">
                <TabsList>
                    <TabsTrigger value="subscription">{t("subscriptionTab")}</TabsTrigger>
                    <TabsTrigger value="history">{t("historyTab")}</TabsTrigger>
                </TabsList>

                <TabsContent value="subscription" className="space-y-6">
                    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-2">
                                        <CardTitle>{t("subscriptionSectionTitle")}</CardTitle>
                                        <CardDescription>{t("subscriptionSectionDescription")}</CardDescription>
                                    </div>
                                    {currentSubscription ? (
                                        <Badge className="capitalize" variant={getSubscriptionBadgeVariant(currentSubscription.status)}>
                                            {translateStatus(currentSubscription.status, t)}
                                        </Badge>
                                    ) : null}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {currentSubscription ? (
                                    <>
                                        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                                            <div className="text-sm text-muted-foreground">{t("currentPlanLabel")}</div>
                                            <div className="mt-1 text-lg font-semibold">
                                                {currentPrice ? getPlanName(t, currentPrice) : t("customPlan")}
                                            </div>
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                {currentPrice
                                                    ? formatCurrency(locale, currentPrice.currency, currentPrice.unitAmount)
                                                    : "—"}
                                            </div>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl border border-border/60 p-4">
                                                <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("nextBillingDate")}</div>
                                                <div className="mt-2 font-medium">{formatDate(locale, currentSubscription.current_period_end)}</div>
                                            </div>
                                            <div className="rounded-xl border border-border/60 p-4">
                                                <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("autoRenewal")}</div>
                                                <div className="mt-2 font-medium">
                                                    {currentSubscription.cancel_at_period_end ? t("scheduledToCancel") : t("activeRenewal")}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                                        {t("noSubscriptionDescription")}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-3">
                                {currentSubscription ? (
                                    <>
                                        {currentSubscription.cancel_at_period_end ? (
                                            <Button
                                                variant="default"
                                                onClick={() => void handleToggleCancellation(false)}
                                                disabled={togglingCancellation}
                                            >
                                                {togglingCancellation ? <Loader2 className="size-4 animate-spin" /> : null}
                                                {t("reactivate")}
                                            </Button>
                                        ) : (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" disabled={togglingCancellation}>
                                                        {t("cancelAtPeriodEnd")}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t("cancelConfirmTitle")}</AlertDialogTitle>
                                                        <AlertDialogDescription>{t("cancelConfirmDescription")}</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{t("keepSubscription")}</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            variant="destructive"
                                                            onClick={() => void handleToggleCancellation(true)}
                                                            disabled={togglingCancellation}
                                                        >
                                                            {togglingCancellation ? <Loader2 className="size-4 animate-spin" /> : null}
                                                            {t("confirmCancellation")}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </>
                                ) : (
                                    <Button asChild>
                                        <Link href="/checkout">{t("subscribeNow")}</Link>
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("plansSectionTitle")}</CardTitle>
                                <CardDescription>{t("plansSectionDescription")}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {catalogPrices.map(price => {
                                    const isCurrent = price.id === currentSubscription?.stripe_price_id

                                    return (
                                        <div
                                            key={price.id}
                                            className={`rounded-2xl border p-5 transition-all ${
                                                isCurrent ? "border-primary bg-primary/4" : "border-border/60"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-foreground">{getPlanName(t, price)}</h3>
                                                        {isCurrent ? <Badge>{t("currentPlanBadge")}</Badge> : null}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{getPlanDescription(t, price)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-semibold text-foreground">
                                                        {formatCurrency(locale, price.currency, price.unitAmount)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{t("billedLabel")}</div>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex flex-wrap gap-3">
                                                {currentSubscription ? (
                                                    <Button
                                                        variant={isCurrent ? "outline" : "default"}
                                                        onClick={() => void handlePlanChange(price.id)}
                                                        disabled={isCurrent}
                                                    >
                                                        {isCurrent ? t("currentPlanButton") : t("switchPlan")}
                                                    </Button>
                                                ) : (
                                                    <Button asChild>
                                                        <Link href="/checkout">{t("subscribeNow")}</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>


                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("invoicesTitle")}</CardTitle>
                            <CardDescription>{t("invoicesDescription")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {summary?.invoices.length ? (
                                <div className="flex flex-col space-y-3">
                                    {[...summary.invoices]
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        .filter(inv => inv.status !== "draft" && inv.status !== "void" && !(inv.status === "open" && (inv as any).billing_reason === "subscription_update"))
                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                        .slice(0, 15)
                                        .map(invoice => (
                                        <div key={invoice.id} className="rounded-xl border border-border/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-accent/30 transition-colors">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 font-medium text-foreground">
                                                    <ReceiptText className="size-4 text-muted-foreground" />
                                                    <span>{formatCurrency(locale, invoice.currency || "EUR", invoice.total ?? invoice.amount_paid ?? null)}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDate(locale, invoice.created_at)}
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                <Badge className="capitalize" variant={getSubscriptionBadgeVariant(invoice.status)}>
                                                    {translateStatus(invoice.status, t)}
                                                </Badge>
                                                {(invoice.invoice_pdf || invoice.hosted_invoice_url) ? (
                                                    <Button asChild variant="outline" size="sm" className="h-8">
                                                        <a
                                                            href={invoice.invoice_pdf || invoice.hosted_invoice_url || "#"}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <ArrowUpRight className="size-3.5 mr-1" />
                                                            {t("viewInvoice")}
                                                        </a>
                                                    </Button>
                                                ) : null}
                                                {invoice.status === "open" || invoice.status === "past_due" ? (
                                                    <Button asChild variant="default" size="sm" className="h-8">
                                                        <Link href={`/checkout?invoice=${invoice.stripe_invoice_id}`}>
                                                            {t("payInvoice")}
                                                        </Link>
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                                    {t("noInvoices")}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>
    )
}
