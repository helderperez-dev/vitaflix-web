import { getTranslations, setRequestLocale } from "next-intl/server"
import { Metadata } from "next"
import { LandingPage } from "@/components/landing/landing-page"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Landing.Meta" })
    
    return {
        title: t("title"),
        description: t("description"),
        openGraph: {
            title: t("title"),
            description: t("description"),
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: t("title"),
            description: t("description"),
        }
    }
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    
    return <LandingPage />
}
