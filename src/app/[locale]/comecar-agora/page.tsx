import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { LandingPageV2 } from "@/components/landing-v2/landing-page-v2"

export const metadata: Metadata = {
    title: "Para de improvisar o que comes | App Vitaflix",
    description:
        "O Vitaflix dá-te mais de 300 receitas com quantidades já calculadas, organiza as tuas refeições da semana e cria a tua lista de compras com um clique — sem contar uma única caloria.",
    openGraph: {
        title: "Para de improvisar o que comes | App Vitaflix",
        description:
            "O Vitaflix dá-te mais de 300 receitas com quantidades já calculadas, organiza as tuas refeições da semana e cria a tua lista de compras com um clique — sem contar uma única caloria.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Para de improvisar o que comes | App Vitaflix",
        description:
            "O Vitaflix dá-te mais de 300 receitas com quantidades já calculadas, organiza as tuas refeições da semana e cria a tua lista de compras com um clique — sem contar uma única caloria.",
    },
}

export default async function OrganizaAlimentacaoPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)

    return <LandingPageV2 />
}
