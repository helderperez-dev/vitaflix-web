"use client"

import * as React from "react"
import { X, Plus, Check, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { getSupportedLanguages } from "@/app/actions/settings"
import { cn } from "@/lib/utils"
import { useWatch } from "react-hook-form"

interface TranslationFieldsProps {
    form: any
    namePrefix: string
    label: string
    type?: "input" | "textarea"
    placeholder?: string
}

const LANGUAGE_NAMES: Record<string, string> = {
    "en": "English",
    "es": "Spanish",
    "pt-pt": "Portuguese (PT)",
    "pt-br": "Portuguese (BR)",
}

export function TranslationFields({
    form,
    namePrefix,
    label,
    type = "input",
    placeholder = "Enter translation..."
}: TranslationFieldsProps) {
    const t = useTranslations("Common")
    const [availableLanguages, setAvailableLanguages] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(true)
    const [open, setOpen] = React.useState(false)

    // Watch the values of the translations to see which ones are currently added
    const currentTranslations = useWatch({
        control: form.control,
        name: namePrefix,
    }) || {}

    // Get active keys
    const activeKeys = Object.keys(currentTranslations).filter(k => currentTranslations[k] !== undefined)

    React.useEffect(() => {
        async function fetchLanguages() {
            const data = await getSupportedLanguages()
            setAvailableLanguages(data)
            setLoading(false)
        }
        fetchLanguages()
    }, [])

    const remainingLanguages = availableLanguages.filter(lang => !activeKeys.includes(lang))

    const addLanguage = (lang: string) => {
        form.setValue(`${namePrefix}.${lang}`, "")
        setOpen(false)
    }

    const removeLanguage = (lang: string) => {
        const newTranslations = { ...currentTranslations }
        delete newTranslations[lang]
        form.setValue(namePrefix, newTranslations)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <h3 className="font-black text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] whitespace-nowrap">{label}</h3>
                    <div className="h-px w-full bg-sidebar-border/30" />
                </div>

                {remainingLanguages.length > 0 && (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-[9px] font-black uppercase tracking-[0.1em] border-sidebar-border/50 bg-sidebar-accent/10 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all gap-1.5 rounded-full"
                            >
                                <Plus className="h-3 w-3" />
                                <span>{t("addLocalization")}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-1.5 shadow-2xl border-sidebar-border/40 rounded-2xl backdrop-blur-xl bg-background/90" align="end">
                            <Command className="bg-transparent border-none">
                                <CommandInput placeholder={`${t("search")}...`} className="h-9 text-xs" />
                                <CommandList className="max-h-[240px]">
                                    <CommandEmpty className="py-4 text-[10px] font-bold text-center text-muted-foreground/40 uppercase tracking-widest">{t("noResults")}</CommandEmpty>
                                    <CommandGroup>
                                        {remainingLanguages.map((lang) => (
                                            <CommandItem
                                                key={lang}
                                                value={lang}
                                                onSelect={() => addLanguage(lang)}
                                                className="text-[11px] py-2 px-3 cursor-pointer uppercase font-bold tracking-tight rounded-xl hover:bg-primary/10 hover:text-primary mb-1 last:mb-0 transition-colors"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="opacity-60">{lang.split('-')[0].toUpperCase()}</span>
                                                    {LANGUAGE_NAMES[lang] || lang}
                                                </span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            <div className="space-y-6">
                {activeKeys.length === 0 ? (
                    <div className="py-10 border-2 border-dashed border-sidebar-border/40 rounded-3xl flex flex-col items-center justify-center bg-muted/5 group hover:border-primary/20 transition-colors duration-500">
                        <div className="p-3 rounded-2xl bg-muted/10 text-muted-foreground/20 group-hover:text-primary/20 group-hover:scale-110 transition-all duration-500">
                            <Plus className="h-6 w-6" />
                        </div>
                        <p className="mt-3 text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.25em]">{t("translationsRequired")}</p>
                    </div>
                ) : (
                    activeKeys.map((lang) => (
                        <div key={lang} className="relative group animate-in fade-in slide-in-from-top-2 duration-500">
                            <FormField
                                control={form.control}
                                name={`${namePrefix}.${lang}`}
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                                {LANGUAGE_NAMES[lang] || lang}
                                            </FormLabel>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeLanguage(lang)}
                                                className="h-6 w-6 rounded-full text-muted-foreground/0 group-hover:text-muted-foreground/40 group-hover:hover:text-destructive group-hover:hover:bg-destructive/10 transition-all duration-300"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <FormControl>
                                            <div className="relative group/input">
                                                {type === "textarea" ? (
                                                    <Textarea
                                                        placeholder={`${placeholder} (${lang.toUpperCase()})`}
                                                        className="resize-none min-h-[140px] bg-muted/5 focus:bg-background transition-all duration-300 rounded-2xl border-sidebar-border/40 focus:ring-4 ring-primary/5 p-4 text-sm font-medium leading-relaxed"
                                                        {...field}
                                                    />
                                                ) : (
                                                    <Input
                                                        placeholder={`${placeholder} (${lang.toUpperCase()})`}
                                                        className="h-12 bg-muted/5 focus:bg-background transition-all duration-300 rounded-2xl border-sidebar-border/40 focus:ring-4 ring-primary/5 px-4 text-sm font-medium"
                                                        {...field}
                                                    />
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold text-destructive px-1" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

