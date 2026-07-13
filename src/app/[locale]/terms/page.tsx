import { getTranslations, setRequestLocale } from "next-intl/server"
import { Metadata } from "next"
import { Link } from "@/i18n/routing"
import { ArrowLeft } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Landing.Footer.termsModal" })
    return {
        title: `${t("title")} | Vitaflix`,
        description: t("intro"),
    }
}

type LegalSection = {
    title: string
    paragraphs?: string[]
    bullets?: string[]
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    
    const t = await getTranslations("Landing.Footer.termsModal")
    const tGlobal = await getTranslations("Landing")
    const sections = t.raw("sections") as LegalSection[]
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#f7fcfa] to-[#f5f8ff] text-foreground font-sans selection:bg-primary/30 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar / Back
                </Link>
                
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-6">
                    {t("title")}
                </h1>
                
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-900/5 border border-slate-100 prose prose-slate max-w-none">
                    <p className="text-slate-600 mb-8 text-lg font-medium">{t("intro")}</p>
                    
                    <div className="space-y-8 text-slate-700">
                        {sections.map((section) => (
                            <section key={section.title} className="space-y-3">
                                <h3 className="font-bold text-slate-900 text-xl m-0">{section.title}</h3>
                                {section.paragraphs?.map((paragraph, i) => (
                                    <p key={i} className="leading-relaxed m-0">
                                        {paragraph}
                                    </p>
                                ))}
                                {section.bullets && section.bullets.length > 0 && (
                                    <ul className="space-y-2 pl-5 list-disc marker:text-emerald-500">
                                        {section.bullets.map((item, i) => (
                                            <li key={i} className="leading-relaxed m-0">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        ))}
                        
                        {t.has("contactLabel") && (
                            <div className="pt-6 border-t border-slate-100">
                                <p className="leading-relaxed">
                                    <span className="font-semibold text-slate-900">{t("contactLabel")} </span>
                                    <a href="mailto:bruno@vitaflix.app" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                                        bruno@vitaflix.app
                                    </a>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}