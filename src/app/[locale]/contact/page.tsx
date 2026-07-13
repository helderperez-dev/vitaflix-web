import { getTranslations, setRequestLocale } from "next-intl/server"
import { Metadata } from "next"
import { Link } from "@/i18n/routing"
import { ArrowLeft, Mail } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    return {
        title: "Contact Support | Vitaflix",
        description: "Get in touch with Vitaflix support.",
    }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#f7fcfa] to-[#f5f8ff] text-foreground font-sans selection:bg-primary/30 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar / Back
                </Link>
                
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6">
                    Contact Support
                </h1>
                
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-900/5 border border-slate-100">
                    <p className="text-lg text-slate-600 mb-8">
                        Need help with your Vitaflix app or subscription? Our support team is here to help you.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">Email Support</h3>
                                <p className="text-slate-600 mb-2">
                                    Send us an email and we&apos;ll get back to you as soon as possible, usually within 24 hours.
                                </p>
                                <a href="mailto:bruno@vitaflix.app" className="text-primary font-medium hover:underline text-lg">
                                    bruno@vitaflix.app
                                </a>
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Frequently Asked Questions</h3>
                            <p className="text-slate-600 mb-4">
                                You might find the answer you&apos;re looking for in our FAQ section on the home page.
                            </p>
                            <Link href="/#faq" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all">
                                Go to FAQ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
