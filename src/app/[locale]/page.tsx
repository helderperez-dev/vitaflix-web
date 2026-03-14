import { HeroSection } from "@/components/landing/hero-section"
import { PainPoints } from "@/components/landing/pain-points"
import { SolutionFeatures } from "@/components/landing/solution-features"
import { PricingTable } from "@/components/landing/pricing-table"
import { FaqSection } from "@/components/landing/faq-section"
import Link from "next/link"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Navigation (Optional minimalist nav could go here) */}
            <header className="fixed top-0 inset-x-0 z-50 h-20 flex items-center justify-between px-6 lg:px-12 bg-white/95 backdrop-blur-md border-b border-border/40 shadow-sm">
                <div className="flex items-center gap-2">
                    <img src="/vitaflix_logo_dark_mode.png" alt="Vitaflix" className="h-8 dark:block hidden" />
                    <img src="/vitaflix_logo_light_mode.png" alt="Vitaflix" className="h-8 dark:hidden block" />
                    <span className="font-bold text-xl tracking-tight ml-2">Vitaflix</span>
                </div>
                <div>
                    <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mr-1">
                        Login Admin
                    </Link>
                </div>
            </header>

            <main className="flex flex-col min-h-screen overflow-hidden">
                <HeroSection />
                <PainPoints />
                <SolutionFeatures />
                <PricingTable />
                <FaqSection />
            </main>

            <footer className="py-12 bg-muted/50 border-t border-border/40 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                    &copy; {new Date().getFullYear()} Vitaflix. Todos os direitos reservados.
                </p>
            </footer>
        </div>
    )
}
