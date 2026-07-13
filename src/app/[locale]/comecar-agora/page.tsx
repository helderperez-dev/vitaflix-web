import { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { LandingPageV2 } from "@/components/landing-v2/landing-page-v2"

export const metadata: Metadata = {
    title: "Organiza a tua alimentação e perde peso sem contar calorias | Vitaflix",
    description:
        "Mais de 300 receitas práticas, quantidades ajustadas ao teu objetivo, organização semanal e lista de compras automática numa só aplicação.",
    openGraph: {
        title: "Organiza a tua alimentação e perde peso sem contar calorias | Vitaflix",
        description:
            "Descobre a nova landing page do Vitaflix com receitas práticas, organização semanal e lista de compras automática.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Organiza a tua alimentação e perde peso sem contar calorias | Vitaflix",
        description:
            "Receitas práticas, quantidades ajustadas e lista de compras automática numa só app.",
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
