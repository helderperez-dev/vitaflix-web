"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, Instagram, MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type LegalSection = {
    title: string
    paragraphs?: string[]
    bullets?: string[]
}

export function Footer() {
    const t = useTranslations("Landing.Footer")
    const tHeader = useTranslations("Landing.Header")
    const tWhatsApp = useTranslations("Landing.WhatsApp")
    const whatsappUrl = `https://wa.me/351915466286?text=${encodeURIComponent(tWhatsApp("message"))}`
    const privacySections = t.raw("privacyModal.sections") as LegalSection[]
    const termsSections = t.raw("termsModal.sections") as LegalSection[]
    
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
                                width={40} 
                                height={40} 
                                className="h-10 w-10 object-contain"
                            />
                        </Link>
                        <p className="text-slate-500 mb-8 max-w-sm">
                            {t("desc")}
                        </p>
                        <div className="flex gap-4 mb-8">
                            <SocialLink href="https://www.instagram.com/brunocortezpt/" icon={Instagram} label="Instagram" />
                            <SocialLink href="https://vm.tiktok.com/ZMerGLPqH/" icon={TikTokIcon} label="TikTok" />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a 
                                href="https://apps.apple.com/br/app/vitaflix/id6762494302" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-center gap-2.5 min-w-[140px] px-3.5 h-[46px] rounded-[10px] bg-black text-white hover:bg-slate-800 transition-all shadow-sm"
                            >
                                <svg viewBox="0 0 384 512" className="h-[22px] w-[22px] fill-current" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                                </svg>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-[9px] font-medium leading-none opacity-80 mb-0.5 whitespace-nowrap">{t("apps.downloadOnThe")}</span>
                                    <span className="text-[15px] font-semibold leading-none whitespace-nowrap">App Store</span>
                                </div>
                            </a>

                            <a 
                                href="https://play.google.com/store/apps/details?id=com.vitaflix.app" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-center gap-2.5 min-w-[140px] px-3.5 h-[46px] rounded-[10px] bg-black text-white hover:bg-slate-800 transition-all shadow-sm"
                            >
                                <svg viewBox="0 0 512 512" className="h-[22px] w-[22px] fill-current" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                                </svg>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-[9px] font-medium leading-none opacity-80 mb-0.5 whitespace-nowrap">{t("apps.getItOn")}</span>
                                    <span className="text-[15px] font-semibold leading-none whitespace-nowrap">Google Play</span>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-6">{t("cols.product")}</h3>
                        <ul className="space-y-4">
                            <FooterLink href="#video">{tHeader("video")}</FooterLink>
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
                            <FooterModalTrigger label={t("links.privacy")}>
                                <LegalPolicyModalContent
                                    title={t("privacyModal.title")}
                                    intro={t("privacyModal.intro")}
                                    sections={privacySections}
                                    contactLabel={t("privacyModal.contactLabel")}
                                />
                            </FooterModalTrigger>
                            <FooterModalTrigger label={t("links.terms")}>
                                <LegalPolicyModalContent
                                    title={t("termsModal.title")}
                                    intro={t("termsModal.intro")}
                                    sections={termsSections}
                                />
                            </FooterModalTrigger>
                        </ul>
                    </div>

                    {/* Newsletter / Contact Column */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-6">{t("cols.contact")}</h3>
                        <div className="space-y-4">
                            <Link
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-95"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>{tWhatsApp("cta")}</span>
                            </Link>
                             <p className="text-sm text-slate-400">
                                {t("contact.help")}
                            </p>
                            <p className="text-sm text-slate-400 inline-flex items-center gap-1.5">
                                <span>{t("contact.madeWith")}</span>
                                <Heart className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
                                <span>{t("contact.inPortugal")}</span>
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
                        <FooterModalInlineTrigger label={t("links.privacy")}>
                            <LegalPolicyModalContent
                                title={t("privacyModal.title")}
                                intro={t("privacyModal.intro")}
                                sections={privacySections}
                                contactLabel={t("privacyModal.contactLabel")}
                            />
                        </FooterModalInlineTrigger>
                        <FooterModalInlineTrigger label={t("links.terms")}>
                            <LegalPolicyModalContent
                                title={t("termsModal.title")}
                                intro={t("termsModal.intro")}
                                sections={termsSections}
                            />
                        </FooterModalInlineTrigger>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function LegalPolicyModalContent({
    title,
    intro,
    sections,
    contactLabel,
}: {
    title: string
    intro: string
    sections: LegalSection[]
    contactLabel?: string
}) {
    return (
        <>
            <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="text-xl sm:text-2xl">{title}</DialogTitle>
                <p className="text-sm text-slate-600">{intro}</p>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
                <div className="space-y-6 text-sm text-slate-700">
                    {sections.map((section) => (
                        <section key={section.title} className="space-y-2">
                            <h4 className="font-semibold text-slate-900">{section.title}</h4>
                            {section.paragraphs?.map((paragraph) => (
                                <p key={paragraph} className="leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}
                            {section.bullets && section.bullets.length > 0 && (
                                <ul className="space-y-1.5 pl-5 list-disc marker:text-slate-500">
                                    {section.bullets.map((item) => (
                                        <li key={item} className="leading-relaxed">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                    {contactLabel && (
                        <p className="leading-relaxed">
                            <span className="font-semibold text-slate-900">{contactLabel} </span>
                            <a href="mailto:bruno@vitaflix.app" className="text-primary hover:underline">
                                bruno@vitaflix.app
                            </a>
                        </p>
                    )}
                </div>
            </ScrollArea>
        </>
    )
}

function SocialLink({ href, icon: Icon, label }: { href: string, icon: React.ElementType<{ className?: string }>, label: string }) {
    return (
        <a 
            href={href} 
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all duration-300"
        >
            <Icon className="w-5 h-5" />
        </a>
    )
}

function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M16.6 5.82c1.26.9 2.5 1.24 3.4 1.29v3.2a8.47 8.47 0 0 1-3.37-.67v5.42c0 3.69-2.9 6.69-6.47 6.69a6.58 6.58 0 0 1-6.16-4.31 6.77 6.77 0 0 1-.42-2.37c0-3.69 2.9-6.69 6.48-6.69.28 0 .56.02.83.06v3.32a3.3 3.3 0 0 0-.83-.11c-1.77 0-3.2 1.5-3.2 3.35 0 1.29.7 2.42 1.72 2.98.45.25.96.39 1.48.39 1.77 0 3.2-1.5 3.2-3.35V2.25h3.34z" />
        </svg>
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

function FooterModalTrigger({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <li>
            <Dialog>
                <DialogTrigger asChild>
                    <button type="button" className="text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-1 group">
                        <span className="relative">
                            {label}
                            <span className="absolute left-0 bottom-0 w-0 h-px bg-primary transition-all group-hover:w-full" />
                        </span>
                    </button>
                </DialogTrigger>
                <DialogContent
                    className="max-w-3xl p-6 sm:p-8"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    {children}
                </DialogContent>
            </Dialog>
        </li>
    )
}

function FooterModalInlineTrigger({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button type="button" className="hover:text-primary transition-colors">
                    {label}
                </button>
            </DialogTrigger>
            <DialogContent
                className="max-w-3xl p-6 sm:p-8"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                {children}
            </DialogContent>
        </Dialog>
    )
}
