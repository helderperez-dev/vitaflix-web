import { getTranslations, setRequestLocale } from "next-intl/server"
import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    return {
        title: "Privacy Policy | Vitaflix",
        description: "Privacy Policy for Vitaflix app.",
    }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#f7fcfa] to-[#f5f8ff] text-foreground font-sans selection:bg-primary/30 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
                
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6">
                    Privacy Policy
                </h1>
                
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-900/5 border border-slate-100 prose prose-slate max-w-none">
                    <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    
                    <h3>1. Introduction</h3>
                    <p>
                        Welcome to Vitaflix. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our app and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h3>2. The data we collect about you</h3>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                    </p>
                    <ul>
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
                        <li><strong>Health and Nutrition Data</strong> includes your dietary preferences, physical metrics you choose to provide (like height, weight), and your nutritional goals to provide our core services.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                    </ul>

                    <h3>3. How we use your personal data</h3>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul>
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal obligation.</li>
                    </ul>

                    <h3>4. Data security</h3>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                    </p>

                    <h3>5. Your legal rights</h3>
                    <p>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
                    </p>
                    
                    <h3>6. Contact us</h3>
                    <p>
                        If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:support@vitaflix.app" className="text-primary hover:underline">support@vitaflix.app</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}
