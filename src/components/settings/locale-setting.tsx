"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateDefaultLocale } from "@/app/actions/settings"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Globe } from "lucide-react"

interface LocaleSettingProps {
    initialLocale: string
}


export function LocaleSetting({ initialLocale }: LocaleSettingProps) {
    const [locale, setLocale] = useState(initialLocale)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSave() {
        setIsLoading(true)
        const result = await updateDefaultLocale(locale)
        setIsLoading(false)

        if (result.success) {
            toast.success("Default locale updated successfully")
        } else {
            toast.error(result.error || "Failed to update default locale")
        }
    }

    return (
        <Card className="border-border/60 bg-card shadow-none overflow-hidden">
            <CardHeader className="border-b border-border/50 py-4 px-6 bg-muted/5">
                <CardTitle className="text-[14px] font-bold text-foreground/90">Platform Language</CardTitle>
                <CardDescription className="text-[11px] font-medium text-muted-foreground/70">
                    Define the system-wide default language for the entire platform.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-8 px-8">
                <div className="space-y-6">
                    <div className="grid gap-3">
                        <label className="text-[11px] font-bold capitalize tracking-tight text-muted-foreground/70 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" />
                            Default Locale
                        </label>
                        <Select value={locale} onValueChange={setLocale}>
                            <SelectTrigger className="w-full md:w-[350px] h-10 bg-muted/5 border-border/40 focus:bg-background transition-all">
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-border/40 shadow-2xl">
                                <SelectItem value="en" className="text-xs font-medium py-3 cursor-pointer">🇺🇸 English (United States)</SelectItem>
                                <SelectItem value="es" className="text-xs font-medium py-3 cursor-pointer">🇪🇸 Español (Spain)</SelectItem>
                                <SelectItem value="pt-pt" className="text-xs font-medium py-3 cursor-pointer">🇵🇹 Português (Portugal)</SelectItem>
                                <SelectItem value="pt-br" className="text-xs font-medium py-3 cursor-pointer">🇧🇷 Português (Brazil)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-5 rounded-lg border border-border/40 bg-muted/5 group transition-all hover:bg-muted/10">
                        <div className="flex items-start gap-4">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary/20">
                                <Globe className="size-4" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-foreground capitalize tracking-tight">Administrative Replication</h4>
                                <p className="text-[11px] text-muted-foreground/60 leading-relaxed max-w-lg">
                                    This setting will automatically be replicated to all new users who gain access to the platform without a pre-selected language preference. Existing users will maintain their current preferences.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t py-4 flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isLoading || locale === initialLocale}
                    className="h-9 px-8 text-xs font-bold rounded-lg"
                >
                    {isLoading ? "Saving..." : "Update Language"}
                </Button>
            </CardFooter>
        </Card>
    )
}

