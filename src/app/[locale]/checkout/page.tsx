import { getLocale, getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { listBillingCatalog } from "@/lib/stripe/billing"
import { getInvoicePaymentDetails } from "../../actions/invoice"

type BillingPrice = {
    id: string
    productId: string
    currency: string
    unitAmount: number | null
    recurring?: {
        interval?: string | null
        intervalCount?: number | null
    } | null
}

type BillingProduct = {
    id: string
    name: string
}

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ price?: string; invoice?: string; coupon?: string }>
}) {
    const locale = await getLocale()
    const t = await getTranslations({ locale, namespace: "Checkout" })
    const supabase = await createClient()
    const resolvedSearchParams = await searchParams
    const preSelectedPriceId = resolvedSearchParams.price
    const invoiceId = resolvedSearchParams.invoice
    const initialCoupon = resolvedSearchParams.coupon

    const { data: { session } } = await supabase.auth.getSession()

    let userProfile = null
    let currentSubscriptionPriceId: string | null = null
    if (session?.user?.id) {
        const [userRes, subRes] = await Promise.all([
            supabase
                .from("users")
                .select("display_name, avatar_url")
                .eq("id", session.user.id)
                .maybeSingle(),
            supabase
                .from("subscriptions")
                .select("stripe_price_id")
                .eq("user_id", session.user.id)
                .in("status", ["active", "trialing", "past_due"])
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle()
        ])
        
        if (userRes.data) {
            userProfile = userRes.data
        }

        if (subRes.data) {
            currentSubscriptionPriceId = subRes.data.stripe_price_id
        }
    }

    let catalog
    try {
        catalog = await listBillingCatalog()
    } catch (error) {
        console.error("Failed to load catalog:", error)
        catalog = { products: [], prices: [], coupons: [] }
    }

    let invoiceDetails = null
    let invoiceErrorCode: string | null = null
    if (invoiceId) {
        const res = await getInvoicePaymentDetails(invoiceId)
        if (res.success && res.invoice) {
            invoiceDetails = res.invoice
        } else {
            invoiceErrorCode = res.errorCode ?? null
            console.error("[Checkout] Invoice details error:", res.errorCode ?? null)
        }
    }

    const invoiceErrorMessage = (() => {
        switch (invoiceErrorCode) {
            case "unauthorized":
                return t("invoiceLoadUnauthorized")
            case "invoice_not_found":
                return t("invoiceNotFound")
            case "invoice_not_open":
                return t("invoiceNotOpen")
            case "invoice_already_paid":
                return t("invoiceAlreadyPaid")
            case "invoice_payment_unavailable":
                return t("invoicePaymentUnavailable")
            default:
                return t("invoiceLoadFailed")
        }
    })()

    if (invoiceId && !invoiceDetails) {
        return (
            <div className="flex min-h-dvh items-center justify-center p-8 text-center">
                <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
                    <h2 className="mb-2 text-lg font-bold">{t("invoiceLoadErrorTitle")}</h2>
                    <p className="text-sm">{invoiceErrorMessage}</p>
                </div>
            </div>
        )
    }

    // Filter to only include prices that have a recurring interval (subscriptions)
    const subscriptionPrices = (catalog.prices as BillingPrice[]).filter((price) => price.recurring)

    // Map products to prices
    const plans = (catalog.products as BillingProduct[]).map((product) => {
        const productPrices = subscriptionPrices.filter((price) => price.productId === product.id)
        return {
            ...product,
            prices: productPrices,
        }
    }).filter((product) => product.prices.length > 0)

    return (
        <div className="min-h-dvh flex flex-col overflow-hidden bg-white font-sans text-slate-900">
            <CheckoutForm 
                plans={plans} 
                initialSession={session} 
                userProfile={userProfile}
                locale={locale}
                preSelectedPriceId={preSelectedPriceId}
                initialCoupon={initialCoupon}
                invoiceDetails={invoiceDetails}
                currentSubscriptionPriceId={currentSubscriptionPriceId}
            />
        </div>
    )
}
