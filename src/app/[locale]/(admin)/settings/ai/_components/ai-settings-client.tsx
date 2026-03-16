"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateAIPrompt } from "@/app/actions/ai-settings"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Link } from "@/i18n/routing"

interface Prompt {
    key: string
    prompt_template: string
    description: string
    category: string
    action_type: string
    input_type: string
    is_active: boolean
}

export default function AISettingsClient({ prompts }: { prompts: Prompt[] }) {
    const t = useTranslations("AISettings")
    const navigationT = useTranslations("Navigation")
    const [loading, setLoading] = useState<string | null>(null)
    const [localPrompts, setLocalPrompts] = useState(prompts)

    const handleSave = async (key: string, value: string) => {
        setLoading(key)
        try {
            const result = await updateAIPrompt(key, value)
            if (result.error) {
                toast.error(t('error'))
            } else {
                toast.success(t('saved'))
            }
        } catch (error) {
            toast.error(t('error'))
        } finally {
            setLoading(null)
        }
    }

    const handleChange = (key: string, value: string) => {
        setLocalPrompts(prev => prev.map(p => p.key === key ? { ...p, prompt_template: value } : p))
    }

    const getLabel = (key: string) => {
        if (key === 'text_generation') return t('textGeneration')
        if (key === 'text_enhancement') return t('textEnhancement')
        if (key === 'text_translation') return t('textTranslation')
        if (key === 'image_generation') return t('imageGeneration')
        if (key === 'image_enhancement') return t('imageEnhancement')
        return key
    }

    return (
        <div className="h-full flex flex-col pt-0 overflow-hidden bg-white dark:bg-background">
             <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-white dark:from-white/[0.03] dark:to-transparent pointer-events-none" />

                <div className="flex flex-col relative z-10 w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-full opacity-80" />
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white leading-none">
                            {navigationT("aiSettings")}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 ml-0">
                        <Link href="/settings">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 -ml-1 rounded-lg text-muted-foreground/30 hover:text-primary transition-all group"
                            >
                                <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                            </Button>
                        </Link>
                        <p className="text-[11px] font-medium text-muted-foreground/70 dark:text-white/40 max-w-2xl leading-relaxed">
                            {t("description")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-transparent custom-scrollbar py-12">
                <div className="px-10 max-w-6xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                    {localPrompts.map((prompt) => (
                        <Card key={prompt.key} className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium">{getLabel(prompt.key)}</CardTitle>
                                <CardDescription className="space-y-1">
                                    <span className="block">{prompt.description}</span>
                                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/70">
                                        {prompt.category} · {prompt.input_type} · {prompt.action_type}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor={prompt.key}>{t("promptTemplate")}</Label>
                                    <Textarea
                                        id={prompt.key}
                                        value={prompt.prompt_template}
                                        onChange={(e) => handleChange(prompt.key, e.target.value)}
                                        className="min-h-[100px] font-mono text-sm"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={() => handleSave(prompt.key, prompt.prompt_template)}
                                        disabled={loading === prompt.key}
                                    >
                                        {loading === prompt.key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('save')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
