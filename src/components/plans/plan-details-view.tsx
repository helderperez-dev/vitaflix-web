'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    ArrowLeft,
    Loader2,
    Calendar,
    Clock,
    Check,
    X,
    ChevronDown,
    UtensilsCrossed
} from "lucide-react"
import { type MealDayConfig } from "@/shared-schemas/plan"
import { getMealDayConfigs } from "@/app/actions/plans"
import { getMealsByCategory, getMealOptionsByIds } from "@/app/actions/meals"
import { updateMealPlan } from "@/app/actions/plans"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { MediaDisplay } from "@/components/shared/media-display"

interface PlanDetailsViewProps {
    plan: any
    onBack: () => void
    onUpdate?: () => void
}

export function PlanDetailsView({ plan, onBack, onUpdate }: PlanDetailsViewProps) {
    const t = useTranslations("Plans")
    const locale = useLocale()
    const isPt = locale.startsWith("pt")

    const dailyCount = plan.dailyMealsCount || plan.daily_meals_count
    const createdAt = plan.createdAt || plan.created_at
    const planCountryId = plan.countryId || plan.country_id

    const [isLoadingConfigs, setIsLoadingConfigs] = useState(true)
    const [configs, setConfigs] = useState<(MealDayConfig & { category?: any })[]>([])
    const [selectedMeals, setSelectedMeals] = useState<Record<string, string>>(
        plan.selectedMeals || plan.selected_meals || {}
    )
    const [isSaving, setIsSaving] = useState(false)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Meals cache per category
    const [mealsCache, setMealsCache] = useState<Record<string, any[]>>({})
    const [loadingCategory, setLoadingCategory] = useState<string | null>(null)
    // Track which popover is open
    const [openSlot, setOpenSlot] = useState<number | null>(null)
    // Keep resolved meal details for display
    const [mealDetails, setMealDetails] = useState<Record<string, {
        name: string,
        mealName: string,
        mealId: string,
        image?: string,
        kcal?: number,
        macros?: { protein: number; carbs: number; fat: number },
        fullMeal?: any
    }>>({})
    // Prevent auto-selection on open
    const [isMenuJustOpened, setIsMenuJustOpened] = useState(false)

    // Update internal state when plan prop changes (after background refresh)
    useEffect(() => {
        const propMeals = plan.selectedMeals || plan.selected_meals || {}
        setSelectedMeals(propMeals)
    }, [plan.id, plan.selected_meals, plan.selectedMeals])

    // Load details for already selected meal variations
    useEffect(() => {
        async function fetchMissingDetails() {
            const ids = Object.values(selectedMeals).filter(id => id && !mealDetails[id])
            if (ids.length === 0) return

            const options = await getMealOptionsByIds(ids, planCountryId)
            const newDetails: typeof mealDetails = {}
            for (const opt of options) {
                const mealName = opt.meal?.name?.[locale] || opt.meal?.name?.en || (isPt ? "Sem nome" : "Unnamed")
                const name = `${mealName} (${opt.kcal} kcal)`
                const img = opt.images?.find((i: any) => i.isDefault)?.url ||
                    opt.meal?.images?.find((i: any) => i.isDefault)?.url ||
                    opt.images?.[0]?.url || opt.meal?.images?.[0]?.url

                newDetails[opt.id] = {
                    name,
                    mealName,
                    mealId: opt.meal?.id,
                    image: img,
                    kcal: opt.kcal,
                    macros: opt.macros,
                    fullMeal: opt.meal // Note: opt.meal here might not have all options, but it's okay for display
                }
            }
            setMealDetails(prev => ({ ...prev, ...newDetails }))
        }
        fetchMissingDetails()
    }, [selectedMeals, locale, planCountryId])

    useEffect(() => {
        async function load() {
            setIsLoadingConfigs(true)
            const configsData = await getMealDayConfigs(dailyCount)
            setConfigs(configsData)
            setIsLoadingConfigs(false)
        }
        load()
    }, [dailyCount])

    const loadMealsForCategory = async (categoryId: string) => {
        if (mealsCache[categoryId]) return
        setLoadingCategory(categoryId)
        const meals = await getMealsByCategory(categoryId, planCountryId)
        setMealsCache(prev => ({ ...prev, [categoryId]: meals }))

        // Also populate mealDetails from newly loaded options
        const newDetails: typeof mealDetails = {}
        for (const meal of meals) {
            const mealName = meal.name?.[locale] || meal.name?.en || (isPt ? "Sem nome" : "Unnamed")
            const mealImg = meal.images?.find((i: any) => i.isDefault)?.url || meal.images?.[0]?.url

            if (meal.options) {
                for (const opt of meal.options) {
                    const optImg = opt.images?.find((i: any) => i.isDefault)?.url || opt.images?.[0]?.url || mealImg
                    newDetails[opt.id] = {
                        name: `${mealName} (${opt.kcal} kcal)`,
                        mealName,
                        mealId: meal.id,
                        image: optImg,
                        kcal: opt.kcal,
                        macros: opt.macros,
                        fullMeal: meal
                    }
                }
            }
        }
        setMealDetails(prev => ({ ...prev, ...newDetails }))
        setLoadingCategory(null)
    }

    const autoSave = useCallback(async (meals: Record<string, string>) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true)
            try {
                const result = await updateMealPlan(plan.id, {
                    userId: plan.userId || plan.user_id,
                    countryId: planCountryId,
                    name: plan.name,
                    dailyMealsCount: dailyCount,
                    selectedMeals: meals,
                })
                if (result?.error) {
                    toast.error(result.error)
                } else {
                    onUpdate?.()
                }
            } catch (error) {
                console.error("Auto-save failed:", error)
                toast.error(isPt ? "Falha ao guardar seleção de refeição" : "Failed to save meal selection")
            } finally {
                setIsSaving(false)
            }
        }, 1000) // Increase debounce to 1s for safety
    }, [isPt, plan.id, plan.userId, plan.user_id, plan.name, dailyCount, onUpdate, planCountryId])

    const handleSelectMeal = (slotIndex: number, mealId: string) => {
        const updated = { ...selectedMeals, [slotIndex.toString()]: mealId }
        setSelectedMeals(updated)
        setOpenSlot(null)
        autoSave(updated)
    }

    const handleClearMeal = (slotIndex: number) => {
        const updated = { ...selectedMeals }
        delete updated[slotIndex.toString()]
        setSelectedMeals(updated)
        autoSave(updated)
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="rounded-lg hover:bg-muted/10 shrink-0"
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-secondary dark:text-white truncate">{plan.name}</h2>
                    <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground capitalize tracking-wider font-bold whitespace-nowrap">
                            <Calendar className="size-3" />
                            <span suppressHydrationWarning>
                                {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <div className="size-1 shrink-0 rounded-full bg-border" />
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground capitalize tracking-wider font-bold whitespace-nowrap">
                            <Clock className="size-3" />
                            {dailyCount} {t("mealsLabel")}
                        </div>
                    </div>
                </div>
            </div>

            {/* Slots List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <h3 className="text-[10px] font-bold text-muted-foreground capitalize tracking-widest flex-1">
                        {isPt ? "Sequência diária de refeições" : "Daily Meal Sequence"}
                    </h3>
                    <div className="h-px flex-[2] bg-border/40" />
                </div>

                {isLoadingConfigs ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground/40">
                        <Loader2 className="size-6 animate-spin" />
                        <p className="text-[11px] font-semibold text-secondary">{isPt ? "A carregar slots..." : "Loading slots..."}</p>
                    </div>
                ) : configs.length === 0 ? (
                    <div className="p-8 text-center rounded-lg bg-muted/5 border border-dashed border-border/60">
                        <p className="text-xs text-muted-foreground">{isPt ? `Nenhum slot configurado para ${dailyCount} refeições.` : `No slots configured for ${dailyCount} meals.`}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1 italic">{isPt ? "Configure isto nas Definições de Admin." : "Please configure this in Admin Settings."}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {configs.map((config, idx) => {
                            const slotKey = config.slotIndex.toString()
                            const selectedOptionId = selectedMeals[slotKey]
                            const categoryName = config.category?.name?.[locale] || config.category?.name?.en || (isPt ? 'Slot padrão' : 'Standard Slot')
                            const detail = selectedOptionId ? mealDetails[selectedOptionId] : null
                            const categoryMeals = mealsCache[config.categoryId] || []
                            const isOpen = openSlot === config.slotIndex

                            return (
                                <div
                                    key={config.id || idx}
                                    className={cn(
                                        "group relative overflow-hidden rounded-lg border transition-all duration-300",
                                        selectedOptionId
                                            ? "border-primary/20 bg-primary/5 shadow-sm"
                                            : "border-border/40 bg-white dark:bg-zinc-900/50 hover:border-border/60"
                                    )}
                                >
                                    <div className="p-5 flex flex-col gap-4">
                                        <div className="flex items-center gap-5">
                                            {/* Slot leading image */}
                                            <div className={cn(
                                                "size-20 rounded-lg flex items-center justify-center transition-all shrink-0 overflow-hidden border shadow-inner",
                                                selectedOptionId
                                                    ? "border-primary/20 bg-primary/5 shadow-primary/5"
                                                    : "border-border/40 bg-muted/10 text-muted-foreground/30"
                                            )}>
                                                {detail?.image ? (
                                                    <MediaDisplay
                                                        src={detail.image}
                                                        alt={detail.name}
                                                        className="transition-transform group-hover:scale-105"
                                                    />
                                                ) : selectedOptionId ? (
                                                    <div className="bg-primary text-white w-full h-full flex items-center justify-center">
                                                        <Check className="size-8" />
                                                    </div>
                                                ) : (
                                                    <UtensilsCrossed className="size-8 opacity-20" />
                                                )}
                                            </div>

                                            {/* Main Content */}
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div className="flex items-center justify-between gap-4">
                                                    <p className="text-[10px] font-bold text-muted-foreground/60 capitalize tracking-[0.2em]">
                                                        {categoryName}
                                                    </p>
                                                    {selectedOptionId && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 rounded-lg text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/5 transition-all -mr-2"
                                                            onClick={() => handleClearMeal(config.slotIndex)}
                                                        >
                                                            <X className="size-3.5" />
                                                        </Button>
                                                    )}
                                                </div>

                                                {/* Meal Selector */}
                                                <Popover
                                                    open={isOpen}
                                                    onOpenChange={(val) => {
                                                        if (val) {
                                                            setOpenSlot(config.slotIndex)
                                                            setIsMenuJustOpened(true)
                                                            loadMealsForCategory(config.categoryId)
                                                            setTimeout(() => setIsMenuJustOpened(false), 200)
                                                        } else {
                                                            setOpenSlot(null)
                                                        }
                                                    }}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <button
                                                            className={cn(
                                                                "w-full flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] group/trigger",
                                                                selectedOptionId ? "h-auto py-1" : "h-11 px-4 rounded-lg border border-border/50 bg-white dark:bg-zinc-900/50 hover:border-primary/30"
                                                            )}
                                                        >
                                                            {selectedOptionId ? (
                                                                <h4 className="text-base font-bold text-secondary dark:text-white truncate group-hover/trigger:text-primary transition-colors">
                                                                    {detail?.mealName}
                                                                </h4>
                                                            ) : (
                                                                <span className="truncate text-sm font-medium text-muted-foreground/40">
                                                                    {isPt ? `Selecionar refeição para ${categoryName.toLowerCase()}...` : `Select meal for ${categoryName.toLowerCase()}...`}
                                                                </span>
                                                            )}
                                                            {!selectedOptionId && <ChevronDown className="size-4 shrink-0 opacity-40" />}
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-[320px] p-0 rounded-lg border-border/40 shadow-2xl backdrop-blur-xl bg-background/90"
                                                        align="start"
                                                        sideOffset={8}
                                                    >
                                                        <Command className="bg-transparent border-none">
                                                            <CommandInput
                                                                placeholder={isPt ? `Pesquisar refeições de ${categoryName}...` : `Search ${categoryName} meals...`}
                                                                className="h-12 text-sm border-none focus:ring-0"
                                                            />
                                                            <CommandList className="max-h-[340px] p-2 custom-scrollbar">
                                                                {loadingCategory === config.categoryId ? (
                                                                    <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground/40">
                                                                        <Loader2 className="size-6 animate-spin" />
                                                                        <span className="text-[11px] font-bold tracking-widest capitalize">{isPt ? "A obter menu..." : "Fetching Menu..."}</span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <CommandEmpty className="py-10 text-center">
                                                                            <UtensilsCrossed className="size-8 mx-auto text-muted-foreground/20 mb-3" />
                                                                            <p className="text-xs font-semibold text-muted-foreground/60">{isPt ? "Nenhuma refeição encontrada." : "No meals found."}</p>
                                                                        </CommandEmpty>

                                                                        {categoryMeals.map((meal: any) => {
                                                                            const mealName = meal.name?.[locale] || meal.name?.en || (isPt ? "Sem nome" : "Unnamed")
                                                                            const mealImg = meal.images?.find((i: any) => i.isDefault)?.url || meal.images?.[0]?.url

                                                                            return (
                                                                                <CommandItem
                                                                                    key={meal.id}
                                                                                    value={meal.id}
                                                                                    keywords={[mealName]}
                                                                                    onSelect={() => {
                                                                                        if (isMenuJustOpened) return
                                                                                        // Default to first variation
                                                                                        if (meal.options?.[0]) {
                                                                                            handleSelectMeal(config.slotIndex, meal.options[0].id)
                                                                                        }
                                                                                    }}
                                                                                    className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-primary/5 transition-all group"
                                                                                >
                                                                                    <div className="size-10 rounded-lg overflow-hidden border border-border/40 shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                                                        <MediaDisplay
                                                                                            src={mealImg || "/product_placeholder.png"}
                                                                                            alt={mealName}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-sm font-bold text-secondary dark:text-white truncate">
                                                                                            {mealName}
                                                                                        </p>
                                                                                        <p className="text-[10px] text-muted-foreground/60 font-medium">
                                                                                            {isPt
                                                                                                ? `${meal.options?.length || 0} variações • Desde ${Math.min(...(meal.options?.map((o: any) => o.kcal) || [0]))} kcal`
                                                                                                : `${meal.options?.length || 0} variations • From ${Math.min(...(meal.options?.map((o: any) => o.kcal) || [0]))} kcal`}
                                                                                        </p>
                                                                                    </div>
                                                                                    {detail?.mealId === meal.id && (
                                                                                        <Check className="size-4 text-primary" />
                                                                                    )}
                                                                                </CommandItem>
                                                                            )
                                                                        })}
                                                                    </>
                                                                )}
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>

                                                {/* Variation Selector (Dedicated Button) */}
                                                {selectedOptionId && detail?.fullMeal && (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95 group/variation">
                                                                <span className="text-[11px] font-bold tracking-tight">
                                                                    {isPt ? `${detail.kcal} kcal variação` : `${detail.kcal} kcal variation`}
                                                                </span>
                                                                <ChevronDown className="size-3 opacity-60 group-hover/variation:opacity-100 transition-opacity" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[280px] p-2 rounded-lg border-border/40 shadow-2xl bg-background/95 backdrop-blur-md" align="start">
                                                            <div className="space-y-1">
                                                                <p className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground/50 capitalize tracking-widest">{isPt ? "Variações disponíveis" : "Available Variations"}</p>
                                                                {(detail.fullMeal.options || []).map((opt: any) => (
                                                                    <button
                                                                        key={opt.id}
                                                                        onClick={() => handleSelectMeal(config.slotIndex, opt.id)}
                                                                        className={cn(
                                                                            "w-full flex items-center justify-between p-2.5 rounded-lg transition-all text-left",
                                                                            selectedOptionId === opt.id
                                                                                ? "bg-primary/10 text-primary shadow-sm"
                                                                                : "hover:bg-muted/50 text-secondary dark:text-white"
                                                                        )}
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs font-bold">{opt.kcal} kcal</span>
                                                                            <span className="text-[9px] font-medium opacity-60">
                                                                                {opt.macros?.protein}P • {opt.macros?.carbs}C • {opt.macros?.fat}F
                                                                            </span>
                                                                        </div>
                                                                        {selectedOptionId === opt.id && <Check className="size-3.5" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </div>
                                        </div>

                                        {/* Nutrition Footer */}
                                        {selectedOptionId && detail?.macros && (
                                            <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-primary/10 shadow-sm animate-in zoom-in-95 duration-300">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-muted-foreground/50 capitalize tracking-widest mb-1">{isPt ? "Resumo nutricional" : "Nutrition Breakdown"}</span>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-secondary dark:text-white tabular-nums">{detail.macros.protein}g</span>
                                                            <span className="text-[8px] font-semibold text-primary/60 capitalize">{isPt ? "Proteína" : "Protein"}</span>
                                                        </div>
                                                        <div className="w-px h-6 bg-border/40" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-secondary dark:text-white tabular-nums">{detail.macros.carbs}g</span>
                                                            <span className="text-[8px] font-semibold text-amber-500/60 capitalize">{isPt ? "Hidratos" : "Carbs"}</span>
                                                        </div>
                                                        <div className="w-px h-6 bg-border/40" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-secondary dark:text-white tabular-nums">{detail.macros.fat}g</span>
                                                            <span className="text-[8px] font-semibold text-rose-500/60 capitalize">{isPt ? "Gordura" : "Fat"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-secondary dark:text-white leading-none mb-0.5">{detail.kcal}</p>
                                                    <p className="text-[8px] font-bold text-muted-foreground/40 capitalize tracking-wider">{isPt ? "Kcal total" : "Total Kcal"}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Glass reflection effect for premium feel */}
                                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Auto-save indicator */}
            {isSaving && (
                <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground/50 animate-in fade-in duration-200">
                    <Loader2 className="size-3 animate-spin" />
                    <span className="text-[10px] font-semibold">{isPt ? "A guardar..." : "Saving..."}</span>
                </div>
            )}
        </div>
    )
}
