"use client"

import * as React from"react"
import { Trash2, Plus, GripVertical, Soup } from"lucide-react"
import { useTranslations, useLocale } from"next-intl"
import { useFieldArray } from"react-hook-form"

import { Button } from"@/components/ui/button"
import { FormField, FormItem, FormLabel, FormMessage } from"@/components/ui/form"
import { TranslationFields } from"@/components/shared/translation-fields"
import { cn } from"@/lib/utils"

interface PreparationStepsProps {
    form: any
    namePrefix: string
    label: string
}

export function PreparationSteps({ form, namePrefix, label }: PreparationStepsProps) {
    const t = useTranslations("Meals")
    const commonT = useTranslations("Common")
    const locale = useLocale()
    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: namePrefix
    })

    const [isAdding, setIsAdding] = React.useState(false)

    // Temporary watch for the new step being added
    const newStepValues = form.watch("newPrepStep") || {}
    const hasNewStepData = Object.values(newStepValues).some((val: any) => typeof val === 'string' && val.trim().length > 0)

    const handleAddStep = () => {
        if (hasNewStepData) {
            append(newStepValues)
            form.setValue("newPrepStep", {})
            setIsAdding(false)
        }
    }

    const cancelAdding = () => {
        form.setValue("newPrepStep", {})
        setIsAdding(false)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <h2 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("preparationMode")}</h2>
                    <div className="h-px w-full bg-border/60"/>
                </div>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => {
                    const stepData = form.watch(`${namePrefix}.${index}`) || {}
                    const displayText = stepData[locale] || stepData['en'] || Object.values(stepData)[0] || t("emptyStep")

                    return (
                        <div key={field.id} className="group relative flex gap-5 p-5 rounded-2xl border border-border/30 bg-white dark:bg-slate-900/50 hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary font-semibold text-xs shadow-sm">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-sm font-medium text-secondary dark:text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                    {displayText as string}
                                </p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    className="h-9 w-9 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                                <div className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors">
                                    <GripVertical className="h-4 w-4"/>
                                </div>
                            </div>
                            {/* Vertical accent */}
                            <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-full"/>
                        </div>
                    )
                })}

                {fields.length === 0 && !isAdding && (
                    <div className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl bg-muted/10 border-2 border-dashed border-border/20">
                        <p className="text-[10px] font-semibold text-muted-foreground/40">
                            {t("noPrepSteps")}
                        </p>
                    </div>
                )}
            </div>

            {isAdding ? (
                <div className="p-8 rounded-3xl border-2 border-primary/20 bg-primary/[0.02] space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <TranslationFields
                        form={form}
                        namePrefix="newPrepStep"
                        label={t("stepInstructions")}
                        type="textarea"
                        placeholder={t("stepPlaceholder")}
                    />
                    <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={cancelAdding}
                            className="h-10 px-6 text-xs font-semibold rounded-xl border-border/60"
                        >
                            {commonT("cancel")}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddStep}
                            disabled={!hasNewStepData}
                            className="h-10 px-8 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            {commonT("save")}
                        </Button>
                    </div>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(true)}
                    className="w-full h-14 border-dashed border-2 border-border/40 hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-2xl flex items-center justify-center gap-3 group"
                >
                    <div className="h-8 w-8 rounded-lg bg-muted/20 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Plus className="h-4 w-4"/>
                    </div>
                    <span className="font-semibold text-xs">{t("addPrepStep")}</span>
                </Button>
            )}
        </div>
    )
}
