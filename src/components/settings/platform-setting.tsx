"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { updateSystemConfig } from "@/app/actions/settings"
import { toast } from "sonner"
import { useLocale } from "next-intl"

import { ShieldCheck, Mail, Phone, Globe, Instagram, Facebook, Construction, Link as LinkIcon } from "lucide-react"

interface PlatformSettingProps {
    initialPlatformName: string
    initialSupportEmail: string
    initialAllowSignups: boolean
    initialMaintenanceMode: boolean
    initialSupportPhone: string
    initialTermsUrl: string
    initialPrivacyUrl: string
    initialInstagramUrl: string
    initialFacebookUrl: string
    initialLogoUrl: string
    initialFaviconUrl: string
}

export function PlatformSetting({
    initialPlatformName,
    initialSupportEmail,
    initialAllowSignups,
    initialMaintenanceMode,
    initialSupportPhone,
    initialTermsUrl,
    initialPrivacyUrl,
    initialInstagramUrl,
    initialFacebookUrl,
    initialLogoUrl,
    initialFaviconUrl
}: PlatformSettingProps) {
    const locale = useLocale()
    const isPt = locale.startsWith("pt")
    const [platformName, setPlatformName] = useState(initialPlatformName)
    const [supportEmail, setSupportEmail] = useState(initialSupportEmail)
    const [allowSignups, setAllowSignups] = useState(initialAllowSignups)
    const [maintenanceMode, setMaintenanceMode] = useState(initialMaintenanceMode)
    const [supportPhone, setSupportPhone] = useState(initialSupportPhone)
    const [termsUrl, setTermsUrl] = useState(initialTermsUrl)
    const [privacyUrl, setPrivacyUrl] = useState(initialPrivacyUrl)
    const [instagramUrl, setInstagramUrl] = useState(initialInstagramUrl)
    const [facebookUrl, setFacebookUrl] = useState(initialFacebookUrl)
    const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
    const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSave() {
        setIsLoading(true)
        try {
            await Promise.all([
                updateSystemConfig('platform_name', platformName),
                updateSystemConfig('support_email', supportEmail),
                updateSystemConfig('allow_signups', allowSignups),
                updateSystemConfig('maintenance_mode', maintenanceMode),
                updateSystemConfig('support_phone', supportPhone),
                updateSystemConfig('terms_url', termsUrl),
                updateSystemConfig('privacy_url', privacyUrl),
                updateSystemConfig('instagram_url', instagramUrl),
                updateSystemConfig('facebook_url', facebookUrl),
                updateSystemConfig('logo_url', logoUrl),
                updateSystemConfig('favicon_url', faviconUrl),
            ])
            toast.success(isPt ? "Definições da plataforma atualizadas com sucesso" : "Platform settings updated successfully")
        } catch (error) {
            toast.error(isPt ? "Falha ao atualizar algumas definições da plataforma" : "Failed to update some platform settings")
        } finally {
            setIsLoading(false)
        }
    }

    const isChanged =
        platformName !== initialPlatformName ||
        supportEmail !== initialSupportEmail ||
        allowSignups !== initialAllowSignups ||
        maintenanceMode !== initialMaintenanceMode ||
        supportPhone !== initialSupportPhone ||
        termsUrl !== initialTermsUrl ||
        privacyUrl !== initialPrivacyUrl ||
        instagramUrl !== initialInstagramUrl ||
        facebookUrl !== initialFacebookUrl ||
        logoUrl !== initialLogoUrl ||
        faviconUrl !== initialFaviconUrl

    return (
        <Card className="border-border/60 bg-card shadow-none overflow-hidden">
            <CardHeader className="border-b border-border/50 py-4 px-6 bg-muted/5">
                <CardTitle className="text-[14px] font-bold text-foreground/90">{isPt ? "Configuração da plataforma" : "Platform Configuration"}</CardTitle>
                <CardDescription className="text-[11px] font-medium text-muted-foreground/70">
                    {isPt ? "Gerir definições base, identidade da marca e controlos de acesso." : "Manage core settings, branding, and access controls."}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-10 px-8">
                {/* Identity Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold capitalize tracking-widest text-primary/70">{isPt ? "Identidade e marca" : "Identity & Branding"}</span>
                        <div className="h-px flex-1 bg-border/40" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <label className="text-[11px] font-bold capitalize tracking-tight text-muted-foreground/70">
                                {isPt ? "Nome da plataforma" : "Platform Name"}
                            </label>
                            <Input
                                value={platformName}
                                onChange={(e) => setPlatformName(e.target.value)}
                                placeholder="Vitaflix"
                                className="h-10 bg-muted/5 border-border/40 focus:bg-background transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-[11px] font-bold capitalize tracking-tight text-muted-foreground/70">
                                Logo URL
                            </label>
                            <Input
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://..."
                                className="h-10 bg-muted/5 border-border/40 focus:bg-background transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-[11px] font-bold capitalize tracking-tight text-muted-foreground/70">
                                Favicon URL
                            </label>
                            <Input
                                value={faviconUrl}
                                onChange={(e) => setFaviconUrl(e.target.value)}
                                placeholder="https://..."
                                className="h-10 bg-muted/5 border-border/40 focus:bg-background transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-[11px] font-bold capitalize tracking-tight text-muted-foreground/70">
                                {isPt ? "Modo de manutenção" : "Maintenance Mode"}
                            </label>
                            <div className="flex items-center justify-between p-2.5 px-4 rounded-lg border border-border/40 bg-muted/5 h-10">
                                <span className="text-xs font-semibold flex items-center gap-2">
                                    <Construction className="size-3.5 text-amber-500" />
                                    {isPt ? "Ativo" : "Active"}
                                </span>
                                <Switch
                                    checked={maintenanceMode}
                                    onCheckedChange={setMaintenanceMode}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-muted/5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary/60" />
                                {isPt ? "Permitir novos registos" : "Allow New Registrations"}
                            </label>
                            <p className="text-xs text-muted-foreground">
                                {isPt ? "Se desativado, novos utilizadores não poderão registar-se de forma autónoma." : "If disabled, new users will not be able to sign up independently."}
                            </p>
                        </div>
                        <Switch
                            checked={allowSignups}
                            onCheckedChange={setAllowSignups}
                        />
                    </div>
                </div>

                {/* Support & Contact Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold capitalize tracking-widest text-primary/70">{isPt ? "Suporte e contacto" : "Support & Contact"}</span>
                        <div className="h-px flex-1 bg-border/40" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <label className="text-[11px] font-bold capitalize tracking-tight text-muted-foreground/70 flex items-center gap-2">
                                <Mail className="size-3.5 opacity-40" />
                                {isPt ? "E-mail de suporte" : "Support Email"}
                            </label>
                            <Input
                                value={supportEmail}
                                onChange={(e) => setSupportEmail(e.target.value)}
                                placeholder="support@example.com"
                                className="h-10 bg-muted/5 border-border/40 focus:bg-background transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-[11px] font-bold capitalize tracking-tight text-muted-foreground/70 flex items-center gap-2">
                                <Phone className="size-3.5 opacity-40" />
                                {isPt ? "Telefone de suporte / WhatsApp" : "Support Phone / WhatsApp"}
                            </label>
                            <Input
                                value={supportPhone}
                                onChange={(e) => setSupportPhone(e.target.value)}
                                placeholder="+1 234 567 890"
                                className="h-10 bg-muted/5 border-border/40 focus:bg-background transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Social & Legal Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold capitalize tracking-widest text-primary/70">{isPt ? "Social e legal" : "Social & Legal"}</span>
                        <div className="h-px flex-1 bg-border/40" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-[11px] font-bold capitalize tracking-tight text-muted-foreground/70 flex items-center gap-2">
                                    <Instagram className="size-3.5 text-pink-500/60" />
                                {isPt ? "URL do perfil de Instagram" : "Instagram Profile URL"}
                                </label>
                                <Input
                                    value={instagramUrl}
                                    onChange={(e) => setInstagramUrl(e.target.value)}
                                    placeholder="https://instagram.com/..."
                                    className="h-9 text-xs bg-muted/5 border-border/40 focus:bg-background transition-all"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-[11px] font-bold capitalize tracking-tight text-muted-foreground/70 flex items-center gap-2">
                                    <Facebook className="size-3.5 text-blue-600/60" />
                                {isPt ? "URL da página de Facebook" : "Facebook Page URL"}
                                </label>
                                <Input
                                    value={facebookUrl}
                                    onChange={(e) => setFacebookUrl(e.target.value)}
                                    placeholder="https://facebook.com/..."
                                    className="h-9 text-xs bg-muted/5 border-border/40 focus:bg-background transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-[11px] font-bold capitalize tracking-tight text-muted-foreground/70 flex items-center gap-2">
                                    <LinkIcon className="size-3.5 opacity-40" />
                                {isPt ? "URL dos termos de serviço" : "Terms of Service URL"}
                                </label>
                                <Input
                                    value={termsUrl}
                                    onChange={(e) => setTermsUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="h-9 text-xs bg-muted/5 border-border/40 focus:bg-background transition-all"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-[11px] font-bold capitalize tracking-tight text-muted-foreground/70 flex items-center gap-2">
                                    <Globe className="size-3.5 opacity-40" />
                                {isPt ? "URL da política de privacidade" : "Privacy Policy URL"}
                                </label>
                                <Input
                                    value={privacyUrl}
                                    onChange={(e) => setPrivacyUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="h-9 text-xs bg-muted/5 border-border/40 focus:bg-background transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t py-4 flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isLoading || !isChanged}
                    className="h-9 px-8 text-xs font-bold rounded-lg"
                >
                    {isLoading ? (isPt ? "A guardar definições..." : "Saving Settings...") : (isPt ? "Atualizar configuração da plataforma" : "Update Platform Config")}
                </Button>
            </CardFooter>
        </Card>
    )
}
