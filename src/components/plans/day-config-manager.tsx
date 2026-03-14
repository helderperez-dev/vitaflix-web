'use client'

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2, Save, Utensils } from "lucide-react"
import { getMealDayConfigs, upsertMealDayConfig } from "@/app/actions/plans"
import { type MealDayConfig } from "@/shared-schemas/plan"
import { toast } from "sonner"
import { DictionarySelector } from "@/components/shared/dictionary-selector"

export function DayConfigManager() {
    const t = useTranslations("Plans")
    const tc = useTranslations("Common")
    const [selectedCount, setSelectedCount] = useState("3")
    const [configs, setConfigs] = useState<MealDayConfig[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const numericCount = parseInt(selectedCount, 10) || 3

    useEffect(() => {
        async function load() {
            setIsLoading(true)
            const data = await getMealDayConfigs(numericCount)
            setConfigs(data)
            setIsLoading(false)
        }
        load()
    }, [numericCount])

    const handleAddSlot = () => {
        setConfigs([...configs, {
            dailyMealsCount: numericCount,
            slotIndex: configs.length,
            categoryId: ""
        }])
    }

    const handleRemoveSlot = (index: number) => {
        const newConfigs = configs.filter((_, i) => i !== index).map((c, i) => ({ ...c, slotIndex: i }))
        setConfigs(newConfigs)
    }

    const handleUpdateSlot = (index: number, categoryId: string) => {
        const newConfigs = [...configs]
        newConfigs[index].categoryId = categoryId
        setConfigs(newConfigs)
    }

    const handleSave = async () => {
        // Ensure all configs have the correct dailyMealsCount before saving
        const normalized = configs.map((c, i) => ({
            ...c,
            dailyMealsCount: numericCount,
            slotIndex: i,
        }))
        setIsSaving(true)
        const result = await upsertMealDayConfig(normalized)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(tc("updatedSuccessfully"))
            // Reload from DB to sync any generated IDs
            const fresh = await getMealDayConfigs(numericCount)
            setConfigs(fresh)
        }
        setIsSaving(false)
    }


    return (
        <Card className="border-border/60 bg-card shadow-none overflow-hidden">
            <CardHeader className="border-b border-border/50 py-5 px-8 bg-muted/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <CardTitle className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                            <Utensils className="size-4 text-primary/60" />
                            Daily sequence setup
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">
                            Configure the meal category sequence for plans with {selectedCount} daily slots.
                        </CardDescription>
                    </div>
                    <div className="w-full md:w-[220px]">
                        <DictionarySelector
                            value={selectedCount}
                            onChange={(val: string) => setSelectedCount(val)}
                            table="meal_plan_sizes"
                            placeholder="Slots number"
                            className="h-10 bg-muted/5 border-border/40 hover:bg-background transition-all"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                {isLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-4 text-muted-foreground/30">
                        <Loader2 className="size-10 animate-spin opacity-20" />
                        <p className="text-[11px] font-bold">Synchronizing slots...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {configs.map((config, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-muted/5 border border-border/40 group hover:border-primary/30 hover:bg-primary/5 transition-all">
                                <div className="size-9 rounded-lg bg-secondary/80 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 max-w-[320px]">
                                    <DictionarySelector
                                        value={config.categoryId}
                                        onChange={(val: string) => handleUpdateSlot(idx, val)}
                                        table="meal_categories"
                                        placeholder="Select category"
                                        returnIdOnly={true}
                                        className="h-10 bg-transparent border-transparent group-hover:border-border/40 transition-all font-medium text-xs"
                                    />
                                </div>
                                <div className="flex-1" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveSlot(idx)}
                                    className="size-10 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))}

                        {configs.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-lg bg-muted/5 gap-3">
                                <p className="text-xs font-semibold text-muted-foreground/60">No meal slots defined for this configuration.</p>
                                <Button
                                    variant="outline"
                                    onClick={handleAddSlot}
                                    className="h-9 rounded-lg border-dashed border-primary/20 hover:bg-primary/5 text-primary text-[11px] font-bold transition-all active:scale-95"
                                >
                                    Initialize first slot
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6 pt-6">
                            <Button
                                variant="outline"
                                onClick={handleAddSlot}
                                className="h-11 rounded-lg bg-muted/5 border-border/40 hover:bg-muted/10 font-bold text-[11px] gap-2 transition-all active:scale-95"
                            >
                                <Plus className="size-4 opacity-60" />
                                Add meal slot
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || configs.length === 0}
                                className="h-11 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-[11px] gap-2 shadow-sm transition-all active:scale-95"
                            >
                                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4 opacity-80" />}
                                Save sequence
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
