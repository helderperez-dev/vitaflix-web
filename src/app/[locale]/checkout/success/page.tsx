import { getLocale, getTranslations } from "next-intl/server"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default async function CheckoutSuccessPage() {
    const locale = await getLocale()
    const t = await getTranslations("Checkout")

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center bg-[#F4F4F5] p-4 font-sans">
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

                <div className="w-full pt-8 mt-2 border-t border-slate-100">
                    <Link href={`/${locale}/dashboard`} passHref>
                        <Button className="w-full h-12 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 text-white shadow-none transition-all">
                            {t("goToDashboard")}
                            <ArrowRight className="size-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
