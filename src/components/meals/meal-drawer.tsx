"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, FileText, Layers } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { mealSchema, type Meal } from "@/shared-schemas/meal"
import { upsertMeal } from "@/app/actions/meals"
import { TranslationFields } from "@/components/shared/translation-fields"
import { TagSelector } from "@/components/shared/tag-selector"
import { Stepper } from "@/components/ui/stepper"
import { PreparationSteps } from "@/components/shared/preparation-steps"
import { ImageUploader } from "@/components/shared/image-uploader"
import { MealOptionsList } from "./meal-options-list"
import { getMealOptions } from "@/app/actions/meals"
import { cn } from "@/lib/utils"

type DrawerView = "details" | "variations"

interface MealDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    meal?: Meal | null
}

export function MealDrawer({ open, onOpenChange, meal }: MealDrawerProps) {
    const t = useTranslations("Meals")
    const commonT = useTranslations("Common")
    const productsT = useTranslations("Products")

    const translateError = (message?: string) => {
        if (!message) return null

        // Handle generic zod errors that might slip through
        if (message.includes("expected array")) return commonT("invalidFormat") || message

        const [ns, key] = message.includes(".") ? message.split(".") : [null, message]

        if (ns === "Common") return commonT(key as any)
        if (ns === "Meals") return t(key as any)
        if (ns === "Products") return productsT(key as any)

        return message
    }

    const ensureArray = (val: any) => Array.isArray(val) ? val : []

    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [formId] = React.useState(() => crypto.randomUUID())
    const [activeView, setActiveView] = React.useState<DrawerView>("details")
    const [isEditingOption, setIsEditingOption] = React.useState(false)

    const form = useForm({
        resolver: zodResolver(mealSchema),
        defaultValues: {
            name: {},
            mealTypes: [],
            cookTime: 0,
            preparationMode: [],
            satiety: 5,
            restrictions: [],
            publishOn: null,
            images: [],
            isPublic: false,
            id: formId,
            options: [],
        },
    }) as any

    const lastInitializedId = React.useRef<string | null>(null)
    React.useEffect(() => {
        if (!open) {
            lastInitializedId.current = null
            return
        }

        async function initData() {
            const currentId = meal?.id || "new"
            if (lastInitializedId.current === currentId) return

            if (meal && meal.id) {
                const options = await getMealOptions(meal.id)
                form.reset({
                    ...meal,
                    name: meal.name || {},
                    cookTime: Number((meal as any).cook_time ?? (meal as any).cookTime ?? 0),
                    mealTypes: ensureArray((meal as any).meal_types || (meal as any).mealTypes),
                    preparationMode: ensureArray((meal as any).preparation_mode || (meal as any).preparationMode),
                    restrictions: ensureArray((meal as any).restrictions || (meal as any).restrictions),
                    isPublic: (meal as any).is_public ?? (meal as any).isPublic ?? false,
                    options: options || []
                })
            } else {
                form.reset({
                    name: {},
                    mealTypes: [],
                    cookTime: 0,
                    preparationMode: [],
                    satiety: 5,
                    restrictions: [],
                    publishOn: null,
                    images: [],
                    isPublic: false,
                    id: crypto.randomUUID(),
                    options: []
                })
            }
            lastInitializedId.current = currentId
        }
        initData()
    }, [meal, form, open])

    // Reset to details view when the drawer opens
    React.useEffect(() => {
        if (open) {
            setActiveView("details")
            setIsEditingOption(false)
        }
    }, [open])

    async function onSubmit(values: Meal) {
        setIsSubmitting(true)
        try {
            const result = await upsertMeal(values)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(meal ? commonT("updatedSuccessfully") : commonT("createdSuccessfully"))
                onOpenChange(false)
            }
        } catch (error) {
            console.error("Error saving meal:", error)
            toast.error(commonT("errorSaving"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const onInvalid = (errors: any) => {
        // More descriptive logging to help debugging
        const flattenedErrors: Record<string, any> = {}
        const extractErrors = (obj: any, prefix = "") => {
            if (!obj) return
            if (obj.message) {
                flattenedErrors[prefix || "root"] = obj.message
                return
            }
            Object.keys(obj).forEach(key => {
                const newPrefix = prefix ? `${prefix}.${key}` : key
                if (typeof obj[key] === "object") {
                    extractErrors(obj[key], newPrefix)
                }
            })
        }
        extractErrors(errors)

        console.warn("Form Validation Failed:", {
            errorCount: Object.keys(flattenedErrors).length,
            fields: Object.keys(flattenedErrors),
            details: flattenedErrors,
            raw: errors
        })
        toast.error(commonT("pleaseCheckForm"))
    }

    const optionsCount = (form.watch("options") || []).length

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl p-0 flex flex-col bg-background border-l border-border">
                {/* High-End Ambient Glow */}
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-50 via-white to-white pointer-events-none -z-10" />

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
                    {!isEditingOption && (
                        <SheetHeader className="px-8 py-6 space-y-3">
                            <div>
                                <SheetTitle className="text-2xl font-semibold tracking-tight text-secondary dark:text-foreground">
                                    {meal ? t("editMeal") : t("newMeal")}
                                </SheetTitle>
                                <SheetDescription className="text-sm">
                                    {t("description")}
                                </SheetDescription>
                            </div>

                            {/* Minimalist Tabs with Sliding Highlight */}
                            <div className="flex items-center gap-10 border-b border-border/40 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveView("details")}
                                    className={cn(
                                        "relative pb-4 text-[11px] font-semibold transition-all duration-300",
                                        activeView === "details"
                                            ? "text-secondary dark:text-foreground"
                                            : "text-muted-foreground/30 hover:text-muted-foreground/60"
                                    )}
                                >
                                    {t("mealDetails")}
                                    {activeView === "details" && (
                                        <motion.div
                                            layoutId="activeTabUnderline"
                                            className="absolute -bottom-px left-0 right-0 h-px bg-primary z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveView("variations")}
                                    className={cn(
                                        "relative pb-4 text-[11px] font-semibold transition-all duration-300 flex items-center gap-2",
                                        activeView === "variations"
                                            ? "text-secondary dark:text-foreground"
                                            : "text-muted-foreground/30 hover:text-muted-foreground/60"
                                    )}
                                >
                                    {t("mealVariations")}
                                    <AnimatePresence mode="popLayout">
                                        {optionsCount > 0 && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className={cn(
                                                    "inline-flex items-center justify-center h-4.5 min-w-[18px] px-1 rounded-full text-[9px] font-semibold transition-all",
                                                    activeView === "variations"
                                                        ? "bg-primary text-white shadow-sm shadow-primary/20"
                                                        : "bg-muted-foreground/10 text-muted-foreground/40 group-hover:bg-muted-foreground/20"
                                                )}
                                            >
                                                {optionsCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    {activeView === "variations" && (
                                        <motion.div
                                            layoutId="activeTabUnderline"
                                            className="absolute -bottom-px left-0 right-0 h-px bg-primary z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            </div>
                        </SheetHeader>
                    )}

                    <Form {...form}>
                        <form
                            id="meal-form"
                            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                            className="flex-1 flex flex-col min-h-0 overflow-hidden"
                        >
                            <div className={cn(
                                "flex-1 custom-scrollbar min-h-0",
                                !isEditingOption ? "px-8 py-4 overflow-y-auto" : "p-0 overflow-hidden h-full"
                            )}>
                                {/* Details View */}
                                <div className={cn(
                                    "transition-opacity duration-200",
                                    activeView === "details" ? "block" : "hidden"
                                )}>
                                    <div className="space-y-12">
                                        <TranslationFields
                                            form={form}
                                            namePrefix="name"
                                            label={t("table.name")}
                                            placeholder={t("namePlaceholder")}
                                        />

                                        {/* Media Gallery */}
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="flex flex-col">
                                                        <h3 className="font-semibold text-xs text-secondary dark:text-white">{t("mediaGallery")}</h3>
                                                        <p className="text-[10px] text-muted-foreground/60">{t("mediaGalleryDescription")}</p>
                                                    </div>
                                                    <div className="h-px flex-1 bg-border/60" />
                                                </div>
                                            </div>
                                            <ImageUploader
                                                folder={`meals/${form.watch("id") || formId}`}
                                                value={form.watch("images") || []}
                                                onChange={(images) => form.setValue("images", images, { shouldDirty: true })}
                                            />
                                        </div>

                                        {/* Culinary Metrics */}
                                        <div className="space-y-10">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <h3 className="font-semibold text-xs text-secondary dark:text-white">{t("culinaryManagement")}</h3>
                                                    <p className="text-[10px] text-muted-foreground/60">{t("culinaryDescription")}</p>
                                                </div>
                                                <div className="h-px flex-1 bg-border/60 ml-4" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-12 gap-y-10 pl-2">
                                                <FormField
                                                    control={form.control}
                                                    name="cookTime"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40">{t("prepTime")}</FormLabel>
                                                            <FormControl>
                                                                <Stepper
                                                                    value={field.value ?? 0}
                                                                    onChange={field.onChange}
                                                                    unit="MIN"
                                                                />
                                                            </FormControl>
                                                            {fieldState.error && (
                                                                <p className="text-[10px] font-semibold text-destructive px-1">
                                                                    {translateError(fieldState.error.message)}
                                                                </p>
                                                            )}
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="satiety"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40">{t("satietyIndex")}</FormLabel>
                                                            <FormControl>
                                                                <Stepper
                                                                    value={field.value ?? 0}
                                                                    onChange={field.onChange}
                                                                    min={0}
                                                                    max={10}
                                                                    unit="/ 10"
                                                                />
                                                            </FormControl>
                                                            {fieldState.error && (
                                                                <p className="text-[10px] font-semibold text-destructive px-1">
                                                                    {translateError(fieldState.error.message)}
                                                                </p>
                                                            )}
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Categorization */}
                                        <div className="space-y-10">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <h3 className="font-semibold text-xs text-secondary dark:text-white">{t("categorization")}</h3>
                                                    <p className="text-[10px] text-muted-foreground/60">{t("categorizationDescription")}</p>
                                                </div>
                                                <div className="h-px flex-1 bg-border/60 ml-4" />
                                            </div>
                                            <div className="grid grid-cols-1 gap-10 pl-2">
                                                <FormField
                                                    control={form.control}
                                                    name="mealTypes"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem className="space-y-4">
                                                            <TagSelector
                                                                title={t("mealCategories")}
                                                                selectedTagIds={field.value || []}
                                                                onTagsChange={field.onChange}
                                                                table="meal_categories"
                                                            />
                                                            {fieldState.error && (
                                                                <p className="text-[10px] font-semibold text-destructive px-1">
                                                                    {translateError(fieldState.error.message)}
                                                                </p>
                                                            )}
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="restrictions"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem className="space-y-4">
                                                            <TagSelector
                                                                title={t("dietaryTags")}
                                                                selectedTagIds={field.value || []}
                                                                onTagsChange={field.onChange}
                                                                table="dietary_tags"
                                                            />
                                                            {fieldState.error && (
                                                                <p className="text-[10px] font-semibold text-destructive px-1">
                                                                    {translateError(fieldState.error.message)}
                                                                </p>
                                                            )}
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>


                                        {/* Preparation Mode */}
                                        <div className="pt-4 space-y-4">
                                            <PreparationSteps
                                                form={form}
                                                namePrefix="preparationMode"
                                                label={t("preparationMode")}
                                            />
                                            {form.formState.errors.preparationMode && (
                                                <p className="text-[10px] font-semibold text-destructive px-1">
                                                    {translateError((form.formState.errors.preparationMode as any).message)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Visibility */}
                                        <div className="space-y-10">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <h3 className="font-semibold text-xs text-secondary dark:text-white">{t("visibilityControl")}</h3>
                                                    <p className="text-[10px] text-muted-foreground/60">{t("visibilityControlDescription")}</p>
                                                </div>
                                                <div className="h-px flex-1 bg-border/60 ml-4" />
                                            </div>
                                            <div className="p-4 rounded-xl bg-muted/20 border border-border/60 group transition-all duration-300 hover:bg-muted/30">
                                                <FormField
                                                    control={form.control}
                                                    name="isPublic"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center justify-between space-y-0">
                                                            <div className="space-y-0.5">
                                                                <FormLabel className="text-xs font-semibold text-secondary dark:text-white">
                                                                    {field.value ? commonT("public") : commonT("private")}
                                                                </FormLabel>
                                                                <p className="text-[10px] text-muted-foreground/60">
                                                                    {t("visibilityDescription")}
                                                                </p>
                                                            </div>
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                    className="data-[state=checked]:bg-primary"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={cn(
                                    "transition-opacity duration-200",
                                    activeView === "variations" ? (isEditingOption ? "flex-1 min-h-0 h-full flex flex-col" : "block") : "hidden"
                                )}>
                                    <div className={cn("min-h-0", isEditingOption && "h-full flex flex-col")}>
                                        <MealOptionsList
                                            mealId={form.watch("id") || formId}
                                            options={form.watch("options") || []}
                                            onOptionsChange={(options) => form.setValue("options", options, { shouldDirty: true })}
                                            onEditingChange={setIsEditingOption}
                                        />
                                    </div>
                                </div>
                            </div>

                            {!isEditingOption && (
                                <SheetFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-2 bg-muted/5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors"
                                        onClick={() => onOpenChange(false)}
                                        disabled={isSubmitting}
                                    >
                                        {commonT("cancel")}
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : null}
                                        {commonT("save")}
                                    </Button>
                                </SheetFooter>
                            )}
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet >
    )
}
