"use client"

import * as React from "react"
import { Loader2, Sparkles, WandSparkles, Languages } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { generateTextWithAI, translateTextWithAI } from "@/app/actions/ai"

interface AITextActionsProps {
    language: string
    availableLanguages: string[]
    value: string
    allValues: Record<string, string>
    fieldLabel: string
    entityName?: string
    context?: string
    runtimeContext?: Record<string, unknown>
    onApply: (value: string) => void
    onApplyMany: (values: Record<string, string>) => void
}

export function AITextActions({
    language,
    availableLanguages,
    value,
    allValues,
    fieldLabel,
    entityName,
    context,
    runtimeContext,
    onApply,
    onApplyMany,
}: AITextActionsProps) {
    const t = useTranslations("AIActions")
    const [loadingAction, setLoadingAction] = React.useState<"generate" | "enhance" | "translate" | null>(null)

    const fallbackText = React.useMemo(() => {
        if (value?.trim()) return value.trim()
        const firstNonEmpty = Object.values(allValues || {}).find(text => typeof text === "string" && text.trim().length > 0)
        return firstNonEmpty?.trim() || ""
    }, [allValues, value])

    const resolveContext = React.useMemo(() => {
        if (context?.trim()) return context.trim()
        return fallbackText || fieldLabel
    }, [context, fallbackText, fieldLabel])

    const handleGenerate = async () => {
        setLoadingAction("generate")
        const result = await generateTextWithAI({
            action: "generate",
            inputText: fallbackText,
            targetLanguage: language,
            fieldLabel,
            entityName,
            context: resolveContext,
            runtimeContext,
        })
        if (result.error || !result.text) {
            toast.error(result.error || t("genericError"))
        } else {
            onApply(result.text)
            toast.success(t("textGenerated"))
        }
        setLoadingAction(null)
    }

    const handleEnhance = async () => {
        if (!fallbackText) {
            toast.error(t("missingSourceText"))
            return
        }
        setLoadingAction("enhance")
        const result = await generateTextWithAI({
            action: "enhance",
            inputText: fallbackText,
            targetLanguage: language,
            fieldLabel,
            entityName,
            context: resolveContext,
            runtimeContext,
        })
        if (result.error || !result.text) {
            toast.error(result.error || t("genericError"))
        } else {
            onApply(result.text)
            toast.success(t("textEnhanced"))
        }
        setLoadingAction(null)
    }

    const handleTranslateAll = async () => {
        if (!fallbackText) {
            toast.error(t("missingSourceText"))
            return
        }
        const targetLanguages = availableLanguages.filter(lang => lang !== language)
        if (targetLanguages.length === 0) return

        setLoadingAction("translate")
        const result = await translateTextWithAI({
            sourceText: fallbackText,
            sourceLanguage: language,
            targetLanguages,
            fieldLabel,
            entityName,
            context: resolveContext,
            runtimeContext,
        })
        if (result.error) {
            toast.error(result.error)
        } else {
            const mergedValues = {
                ...result.translations,
                [language]: fallbackText,
            }
            onApplyMany(mergedValues)
            toast.success(t("translationsApplied"))
        }
        setLoadingAction(null)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md text-muted-foreground/50 hover:text-primary hover:bg-primary/10"
                    disabled={loadingAction !== null}
                >
                    {loadingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleGenerate} disabled={loadingAction !== null}>
                    <WandSparkles className="mr-2 h-4 w-4" />
                    {t("generate")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEnhance} disabled={loadingAction !== null}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("enhance")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTranslateAll} disabled={loadingAction !== null}>
                    <Languages className="mr-2 h-4 w-4" />
                    {t("translateAll")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
