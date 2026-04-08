import { getTranslations, setRequestLocale } from "next-intl/server"
import { Metadata } from "next"
import { ThankYouView } from "@/components/landing/thank-you-view"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Landing.ThankYou" })
    
    return {
        title: t("metaTitle"),
    }
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    
    return <ThankYouView />
}
