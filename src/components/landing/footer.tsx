"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Twitter, Mail } from "lucide-react"
import { useTranslations } from "next-intl"

export function Footer() {
    const t = useTranslations("Landing.Footer")
    const tHeader = useTranslations("Landing.Header")
    
    return (
        <footer className="relative bg-white pt-24 pb-12 border-t border-slate-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                        <Link href="/" className="inline-block mb-6">
                            <Image 
                                src="/vitaflix_logo_light_mode.png" 
                                alt="Vitaflix" 
                                width={140} 
                                height={32} 
                                className="h-8 w-auto"
                            />
                        </Link>
                        <p className="text-slate-500 mb-8 max-w-sm">
                            {t("desc")}
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={Instagram} label="Instagram" />
                            <SocialLink href="#" icon={Facebook} label="Facebook" />
                            <SocialLink href="#" icon={Twitter} label="Twitter" />
                            <SocialLink href="#" icon={Linkedin} label="LinkedIn" />
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-6">{t("cols.product")}</h3>
                        <ul className="space-y-4">
                            <FooterLink href="#beneficios">{tHeader("benefits")}</FooterLink>
                            <FooterLink href="#sobre">{tHeader("method")}</FooterLink>
                            <FooterLink href="#testemunhos">{tHeader("testimonials")}</FooterLink>
                            <FooterLink href="#pricing">{tHeader("pricing")}</FooterLink>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-6">{t("cols.support")}</h3>
                        <ul className="space-y-4">
                            <FooterLink href="#faq">{tHeader("faq")}</FooterLink>
                            <FooterLink href="/contact">{t("links.contact")}</FooterLink>
                            <FooterLink href="/privacy">{t("links.privacy")}</FooterLink>
                            <FooterLink href="/terms">{t("links.terms")}</FooterLink>
                        </ul>
                    </div>

                    {/* Newsletter / Contact Column */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-6">{t("cols.contact")}</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-slate-500">
                                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span>ola@vitaflix.pt</span>
                            </li>
                        </ul>
                        <div className="mt-8 pt-8 border-t border-slate-100">
                             <p className="text-sm text-slate-400">
                                {t("contact.help")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500 text-center md:text-left">
                        &copy; {new Date().getFullYear()} Vitaflix. {t("rights")}
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link href="/privacy" className="hover:text-primary transition-colors">{t("links.privacy")}</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">{t("links.terms")}</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function SocialLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
        <a 
            href={href} 
            aria-label={label}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all duration-300"
        >
            <Icon className="w-5 h-5" />
        </a>
    )
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <li>
            <Link 
                href={href} 
                className="text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-1 group"
            >
                <span className="relative">
                    {children}
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-primary transition-all group-hover:w-full" />
                </span>
            </Link>
        </li>
    )
}
