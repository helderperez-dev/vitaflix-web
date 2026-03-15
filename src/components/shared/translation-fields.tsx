"use client"

import * as React from "react"
import { X, Plus, Loader2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
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
    isRichText?: boolean
}

import { RichText } from "@/components/ui/rich-text"

export function TranslationFields({
    form,
    namePrefix,
    label,
    type = "input",
    placeholder,
    isRichText = false
}: TranslationFieldsProps) {
    const locale = useLocale()
    const commonT = useTranslations("Common")
    const mealsT = useTranslations("Meals")
    const productsT = useTranslations("Products")
    const isPt = locale.startsWith("pt")
    const LANGUAGE_NAMES: Record<string, string> = React.useMemo(() => ({
        "en": isPt ? "Inglês" : "English",
        "es": isPt ? "Espanhol" : "Spanish",
        "pt-pt": isPt ? "Português (PT)" : "Portuguese (PT)",
        "pt-br": isPt ? "Português (BR)" : "Portuguese (BR)",
    }), [isPt])
    const resolvedPlaceholder = placeholder || (isPt ? "Introduza a tradução..." : "Enter translation...")

    const [availableLanguages, setAvailableLanguages] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(true)
    const [open, setOpen] = React.useState(false)

    const currentTranslations = useWatch({
        control: form.control,
        name: namePrefix,
    }) || {}

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

    const translateErrorMessage = (message: string | undefined) => {
        if (!message) return null
        if (message === "Common.translationsRequired") return commonT("translationsRequired")
        if (message === "Meals.atLeastOneCategory") return mealsT("atLeastOneCategory")
        if (message === "Products.errorKcalPositive") return productsT("errorKcalPositive")
        return message
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-secondary/20 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{label}</h3>
                    <div className="h-px w-full bg-border/60 min-w-4" />
                </div>

                {remainingLanguages.length > 0 && (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-8 w-auto min-w-[80px] justify-center px-4 text-xs font-semibold border-border/50 bg-transparent text-muted-foreground hover:bg-muted/10 rounded-lg transition-all gap-2"
                            >
                                <Plus className="h-3.5 w-3.5 opacity-50" />
                                {commonT("add")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-1.5 shadow-2xl border-border/40 rounded-lg backdrop-blur-xl bg-background/90" align="end">
                            <Command className="bg-transparent border-none">
                                <CommandInput placeholder={`${commonT("search")}...`} className="h-9 text-xs" />
                                <CommandList
                                    className="max-h-[240px] overflow-y-auto custom-scrollbar"
                                    onWheel={(e) => e.stopPropagation()}
                                    onTouchMove={(e) => e.stopPropagation()}
                                >
                                    <CommandEmpty className="py-4 text-xs font-semibold text-center text-muted-foreground/40">{commonT("noResults")}</CommandEmpty>
                                    <CommandGroup>
                                        {remainingLanguages.map((lang) => (
                                            <CommandItem
                                                key={lang}
                                                value={lang}
                                                onSelect={() => addLanguage(lang)}
                                                className="text-xs py-2 px-3 cursor-pointer font-semibold rounded-lg hover:bg-muted mb-1 last:mb-0 transition-colors"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="opacity-60 text-[10px]">{lang.split('-')[0].toUpperCase()}</span>
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
                <FormField
                    control={form.control}
                    name={namePrefix}
                    render={({ fieldState: { error } }) => (
                        <FormItem>
                            {error && (
                                <p className="text-[10px] font-semibold text-destructive px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {translateErrorMessage(error.message)}
                                </p>
                            )}
                        </FormItem>
                    )}
                />
                {activeKeys.length === 0 ? (
                    <div className="py-6 border-2 border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center bg-muted/5 group hover:border-border/60 transition-colors duration-500">
                        <p className="text-[10px] font-semibold text-muted-foreground/40">{commonT("noItemAddedYet", { item: label })}</p>
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
                                            <FormLabel className="text-[11px] font-semibold text-muted-foreground flex items-center gap-2">
                                                {LANGUAGE_NAMES[lang] || lang}
                                            </FormLabel>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeLanguage(lang)}
                                                className="h-6 w-6 rounded-lg text-muted-foreground/0 group-hover:text-muted-foreground/40 group-hover:hover:text-destructive group-hover:hover:bg-destructive/10 transition-all duration-300"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <FormControl>
                                            <div className="relative group/input">
                                                {isRichText ? (
                                                    <RichText
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder={`${resolvedPlaceholder} (${lang.toUpperCase()})`}
                                                    />
                                                ) : type === "textarea" ? (
                                                    <Textarea
                                                        placeholder={`${resolvedPlaceholder} (${lang.toUpperCase()})`}
                                                        className="resize-none min-h-[140px] bg-muted/5 focus:bg-background transition-all duration-300 rounded-lg border-border/40 focus:ring-4 ring-primary/5 p-4 text-sm font-medium leading-relaxed"
                                                        {...field}
                                                    />
                                                ) : (
                                                    <Input
                                                        placeholder={`${resolvedPlaceholder} (${lang.toUpperCase()})`}
                                                        className="h-12 bg-muted/5 focus:bg-background transition-all duration-300 rounded-lg border-border/40 focus:ring-4 ring-primary/5 px-4 text-sm font-medium"
                                                        {...field}
                                                    />
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-semibold text-destructive px-1" />
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
