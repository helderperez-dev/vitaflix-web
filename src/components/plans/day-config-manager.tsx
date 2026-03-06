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

interface DayConfigManagerProps { }

export function DayConfigManager({ }: DayConfigManagerProps = {}) {
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
        <Card className="rounded-3xl border-none shadow-xl bg-white dark:bg-zinc-950 overflow-hidden">
            <CardHeader className="bg-muted/5 border-b border-border/40 p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2">
                            <Utensils className="size-5 text-primary" />
                            Daily Sequence Setup
                        </CardTitle>
                        <CardDescription>Configure meal slots for plans with {selectedCount} daily meals.</CardDescription>
                    </div>
                    <div className="w-[200px]">
                        <DictionarySelector
                            value={selectedCount}
                            onChange={(val: string) => setSelectedCount(val)}
                            table="meal_plan_sizes"
                            placeholder="Select quantity"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                        <Loader2 className="size-10 animate-spin" />
                        <p className="text-sm font-bold uppercase tracking-widest">Synchronizing slots...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {configs.map((config, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/5 border border-border/40 group hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <div className="size-10 rounded-xl bg-secondary text-white flex items-center justify-center font-bold shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 max-w-[280px]">
                                    <DictionarySelector
                                        value={config.categoryId}
                                        onChange={(val: string) => handleUpdateSlot(idx, val)}
                                        table="meal_categories"
                                        placeholder="Select meal type"
                                        returnIdOnly={true}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveSlot(idx)}
                                    className="size-11 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))}

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <Button
                                variant="outline"
                                onClick={handleAddSlot}
                                className="h-12 rounded-2xl border-dashed border-border/60 hover:bg-muted/10 font-bold text-[11px] uppercase tracking-wider gap-2"
                            >
                                <Plus className="size-4" />
                                Add Slot
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || configs.length === 0}
                                className="h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-[11px] uppercase tracking-wider gap-2 shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
                            >
                                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                Save Configuration
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
