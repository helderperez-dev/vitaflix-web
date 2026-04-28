import { setRequestLocale, getTranslations } from "next-intl/server"
import { CaloricCalculator } from "@/components/calculator/caloric-calculator"
import Image from "next/image"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Calculator.Meta" })
    
    return {
        title: t("title"),
        description: t("description"),
    }
}

export default async function CaloricCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations({ locale, namespace: "Calculator.Page" })
    
    return (
        <main className="min-h-screen bg-[#FAFCFF] px-4 pt-20">
            <div className="mx-auto max-w-4xl text-center space-y-4 mb-16">
                <div className="flex justify-center mb-8">
                    <Image 
                        src="/vitaflix_logo_light_mode.png" 
                        alt="Vitaflix" 
                        width={48} 
                        height={48} 
                        className="h-12 w-12 object-contain" 
                        priority 
                    />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-secondary sm:text-5xl lg:text-6xl">
                    {t("title")} <span className="text-primary">{t("titleHighlight")}</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>
            
            <CaloricCalculator />
        </main>
    )
}
