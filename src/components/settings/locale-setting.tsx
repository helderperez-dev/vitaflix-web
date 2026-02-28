"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateDefaultLocale } from "@/app/actions/settings"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface LocaleSettingProps {
    initialLocale: string
}

export function LocaleSetting({ initialLocale }: LocaleSettingProps) {
    const t = useTranslations("Dashboard") // Or a new Settings namespace
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
        <Card className="shadow-lg border-primary/10 overflow-hidden">
            <CardHeader className="bg-muted/50">
                <CardTitle className="text-xl">Platform Language</CardTitle>
                <CardDescription>
                    Define the system-wide default language for the entire platform.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Default Locale</label>
                        <Select value={locale} onValueChange={setLocale}>
                            <SelectTrigger className="w-full md:w-[300px] h-11 border-primary/20 bg-background/50 backdrop-blur-sm">
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent className="backdrop-blur-md">
                                <SelectItem value="en">🇺🇸 English (United States)</SelectItem>
                                <SelectItem value="es">🇪🇸 Español (Spain)</SelectItem>
                                <SelectItem value="pt-pt">🇵🇹 Português (Portugal)</SelectItem>
                                <SelectItem value="pt-br">🇧🇷 Português (Brazil)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                        <h4 className="text-xs font-bold text-primary uppercase">Administrative Replication</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This setting will automatically be replicated to all new users who gain access to the platform without a pre-selected language preference. Existing users will maintain their current preferences.
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t py-4">
                <Button
                    onClick={handleSave}
                    disabled={isLoading || locale === initialLocale}
                    className="ml-auto px-8 h-10 font-bold tracking-tight shadow-md hover:shadow-lg transition-transform active:scale-95"
                >
                    {isLoading ? "Preserving Context..." : "Commit Platform Default"}
                </Button>
            </CardFooter>
        </Card>
    )
}
