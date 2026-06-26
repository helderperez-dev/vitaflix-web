import { getLocale, getTranslations } from "next-intl/server"
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CheckoutSuccessTracker } from "@/components/checkout/checkout-success-tracker"

export default async function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const locale = await getLocale()
    const t = await getTranslations("Checkout")
    const params = await searchParams
    const redirectStatus = params.redirect_status as string | undefined

    if (redirectStatus && redirectStatus !== "succeeded") {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center bg-[#F4F4F5] p-4 font-sans">
                <div className="max-w-md w-full p-10 rounded-2xl bg-white shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-6">
                    <div className="size-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2 animate-in zoom-in duration-500">
                        <XCircle className="size-8" />
                    </div>
                    
                    <div className="space-y-3">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {t("paymentConfirmationFailed")}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            {t("stripeErrorCardDeclined")}
                        </p>
                    </div>

                    <div className="w-full pt-8 mt-2 border-t border-slate-100">
                        <Link href={`/${locale}/checkout`} passHref>
                            <Button variant="outline" className="w-full h-12 rounded-xl font-bold text-base transition-all">
                                <ArrowLeft className="size-4 mr-2" />
                                {t("tryAgain")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center bg-[#F4F4F5] p-4 font-sans">
            <CheckoutSuccessTracker />
            <div className="max-w-md w-full p-10 rounded-2xl bg-white shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-6">
                <div className="size-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2 animate-in zoom-in duration-500">
                    <CheckCircle2 className="size-8" />
                </div>
                
                <div className="space-y-3">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {t("paymentSuccessful")}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        {t("paymentSuccessfulDesc")}
                    </p>
                </div>

                <div className="w-full flex flex-col gap-3 mt-6">
                    <a 
                        href="https://apps.apple.com/br/app/vitaflix/id6762494302" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center gap-3 w-full h-14 rounded-xl bg-black text-white hover:bg-slate-800 transition-all"
                    >
                        <svg viewBox="0 0 384 512" className="size-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                        </svg>
                        <div className="flex flex-col items-start text-left">
                            <span className="text-[10px] leading-none opacity-80">{t("downloadOnThe")}</span>
                            <span className="text-lg font-semibold leading-none mt-1">App Store</span>
                        </div>
                    </a>

                    <div className="flex items-center justify-center gap-3 w-full h-14 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200">
                        <svg viewBox="0 0 512 512" className="size-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                        </svg>
                        <div className="flex flex-col items-start text-left">
                            <span className="text-[10px] leading-none opacity-80">{t("comingSoonDays")}</span>
                            <span className="text-lg font-semibold leading-none mt-1">Google Play</span>
                        </div>
                    </div>
                </div>

                <div className="w-full pt-6 mt-2 border-t border-slate-100">
                    <Link href={`/${locale}/dashboard`} passHref>
                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold text-base shadow-none transition-all text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                            {t("goToDashboard")}
                            <ArrowRight className="size-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
