"use client"

import * as React from "react"
import { X, Plus, Check } from "lucide-react"
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
            <div className="space-y-4 animate-pulse">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">{label}</h3>
                    <div className="h-px w-full bg-border/40" />
                </div>

                {remainingLanguages.length > 0 && (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-[8px] font-bold uppercase tracking-widest border-border/50 bg-transparent text-muted-foreground/60 hover:text-foreground hover:bg-muted/5 transition-all gap-1"
                            >
                                <Plus className="h-2.5 w-2.5" />
                                Add translation
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[180px] p-0" align="end">
                            <Command className="bg-popover border-border shadow-lg">
                                <CommandInput placeholder="Search..." className="h-8 text-xs" />
                                <CommandList>
                                    <CommandEmpty className="py-2 text-[10px] text-center text-muted-foreground">None</CommandEmpty>
                                    <CommandGroup>
                                        {remainingLanguages.map((lang) => (
                                            <CommandItem
                                                key={lang}
                                                value={lang}
                                                onSelect={() => addLanguage(lang)}
                                                className="text-[10px] py-1.5 cursor-pointer uppercase font-semibold tracking-wider"
                                            >
                                                <Check className={cn("mr-2 h-3 w-3 opacity-0")} />
                                                {LANGUAGE_NAMES[lang] || lang}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            <div className="space-y-5">
                {activeKeys.length === 0 ? (
                    <div className="py-6 border border-dashed border-border/60 rounded-lg flex flex-col items-center justify-center bg-muted/5">
                        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">No keys added</p>
                    </div>
                ) : (
                    activeKeys.map((lang) => (
                        <div key={lang} className="relative group animate-in fade-in slide-in-from-top-1 duration-200">
                            <FormField
                                control={form.control}
                                name={`${namePrefix}.${lang}`}
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                                            {LANGUAGE_NAMES[lang] || lang}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative group/input">
                                                {type === "textarea" ? (
                                                    <div className="relative">
                                                        <Textarea
                                                            placeholder={`${placeholder} (${lang.toUpperCase()})`}
                                                            className="resize-none min-h-[120px] bg-muted/5 focus:bg-background transition-all pr-10 rounded-lg border-border"
                                                            {...field}
                                                        />
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover/input:opacity-100 transition-all duration-200">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeLanguage(lang)}
                                                                className="h-7 w-7 rounded-full text-muted-foreground/30 hover:text-destructive hover:bg-destructive/5 transition-all"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <Input
                                                            placeholder={`${placeholder} (${lang.toUpperCase()})`}
                                                            className="h-11 bg-muted/5 focus:bg-background transition-all pr-10 rounded-lg border-border"
                                                            {...field}
                                                        />
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition-all duration-200">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeLanguage(lang)}
                                                                className="h-7 w-7 rounded-full text-muted-foreground/30 hover:text-destructive hover:bg-destructive/5 transition-all"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[9px] font-medium" />
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
