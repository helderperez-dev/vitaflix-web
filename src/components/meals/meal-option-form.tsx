"use client"

import * as React from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations, useLocale } from "next-intl"
import { Trash2, Soup, Info, Image as ImageIcon, Save, X, Loader2 } from "lucide-react"
import { mealOptionSchema, type MealOption } from "@/shared-schemas/meal"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Stepper } from "@/components/ui/stepper"
import { TranslationFields } from "@/components/shared/translation-fields"
import { ImageUploader } from "@/components/shared/image-uploader"
import { ProductSelector } from "@/components/shared/product-selector"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { MediaDisplay } from "@/components/shared/media-display"

interface MealOptionFormProps {
    initialData?: Partial<MealOption>
    mealId: string
    onSave: (data: MealOption) => void
    onCancel: () => void
}

export function MealOptionForm({
    initialData,
    mealId,
    onSave,
    onCancel
}: MealOptionFormProps) {
    const t = useTranslations("Meals")
    const commonT = useTranslations("Common")
    const productsT = useTranslations("Products")

    const translateError = (message?: string) => {
        if (!message) return null
        const [ns, key] = message.includes(".") ? message.split(".") : [null, message]

        if (ns === "Common") return commonT(key as any)
        if (ns === "Meals") return t(key as any)
        if (ns === "Products") return productsT(key as any)

        return message
    }

    const form = useForm<MealOption>({
        resolver: zodResolver(mealOptionSchema) as any,
        defaultValues: initialData || {
            associatedMealId: mealId,
            ingredients: [],
            kcal: 0,
            isDefault: false,
            images: [],
            macros: {
                protein: 0,
                carbs: 0,
                fat: 0
            }
        },
    })

    const { fields: ingredients, append: appendIngredient, remove: removeIngredient } = useFieldArray({
        control: form.control,
        name: "ingredients"
    })

    // Local state for product names/images to resolve IDs
    const [productMap, setProductMap] = React.useState<Record<string, { name: any; image?: any; kcal: number; protein: number; carbs: number; fat: number }>>({})
    const [isLoadingProducts, setIsLoadingProducts] = React.useState(false)

    const fetchProductDetails = React.useCallback(async (ids: string[]) => {
        const uniqueIds = Array.from(new Set(ids)).filter(id => {
            const p = productMap[id]
            return !p || p.kcal === undefined
        })
        setIsLoadingProducts(true)
        try {
            const { getProductsByIds } = await import("@/app/actions/products")
            const products = await getProductsByIds(uniqueIds)

            const newMap: any = { ...productMap }
            products.forEach(p => {
                newMap[p.id] = {
                    name: p.name,
                    image: (p.images && p.images.length > 0) ? p.images[0] : undefined,
                    kcal: p.kcal || 0,
                    protein: p.protein || 0,
                    carbs: p.carbs || 0,
                    fat: p.fat || 0
                }
            })
            setProductMap(newMap)
        } finally {
            setIsLoadingProducts(false)
        }
    }, [productMap])

    // Fetch initial product details
    React.useEffect(() => {
        const ids = (initialData?.ingredients || []).flatMap(ing => [
            ing.productId,
            ...(ing.substitutions || []).map(s => s.productId)
        ])
        if (ids.length > 0) fetchProductDetails(ids)
    }, [])

    // Sync overall meal totals based on ingredients
    const watchedIngredients = useWatch({
        control: form.control,
        name: "ingredients"
    }) || []

    React.useEffect(() => {
        let totalKcal = 0
        let totalP = 0
        let totalC = 0
        let totalF = 0

        watchedIngredients.forEach((ing) => {
            const product = productMap[ing.productId]
            if (product) {
                const qty = Number(ing.quantity) || 0
                totalKcal += (Number(product.kcal) || 0) * qty / 100
                totalP += (Number(product.protein) || 0) * qty / 100
                totalC += (Number(product.carbs) || 0) * qty / 100
                totalF += (Number(product.fat) || 0) * qty / 100
            }
        })

        form.setValue("kcal", Math.round(totalKcal))
        form.setValue("macros.protein", Number(totalP.toFixed(1)))
        form.setValue("macros.carbs", Number(totalC.toFixed(1)))
        form.setValue("macros.fat", Number(totalF.toFixed(1)))
    }, [watchedIngredients, productMap, form])

    const handleSubmit = (values: MealOption) => {
        onSave(values)
    }

    const locale = useLocale()

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-50 via-white to-white dark:from-white/[0.04] dark:via-transparent dark:to-transparent pointer-events-none -z-10" />

            {/* Header */}
            <div className="px-8 py-6 space-y-3 relative z-10">
                <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-secondary dark:text-foreground">
                        {initialData?.id ? t("editMealOption") : t("addMealOption")}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                        {initialData?.id ? t("syncingMetrics") : t("creatingNewVariation")}
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-8 py-4 custom-scrollbar relative z-10">
                <Form {...form}>
                    <div className="space-y-14 pb-12">
                        {/* Ingredients Section */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 flex-1">
                                    <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("ingredientsAndSubstitutions")}</h3>
                                    <div className="h-px w-full bg-border/60" />
                                </div>
                                <ProductSelector
                                    onSelect={(product) => {
                                        appendIngredient({
                                            productId: product.id,
                                            quantity: 100,
                                            unit: "g",
                                            substitutions: []
                                        })
                                        // Cache product name
                                        setProductMap(prev => ({
                                            ...prev,
                                            [product.id]: {
                                                name: product.name,
                                                image: product.images?.[0],
                                                kcal: product.kcal || 0,
                                                protein: product.protein || 0,
                                                carbs: product.carbs || 0,
                                                fat: product.fat || 0
                                            }
                                        }))
                                    }}
                                    placeholder={commonT("add")}
                                    className="h-8 w-auto min-w-[80px] justify-center px-4 text-xs font-semibold border-border/50 bg-transparent text-muted-foreground hover:bg-muted/5 rounded-lg transition-all"
                                />
                            </div>

                            <div className="space-y-4">
                                {isLoadingProducts ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-lg border border-border/20">
                                        <Loader2 className="h-6 w-6 text-primary animate-spin mb-4" />
                                        <p className="text-[10px] font-semibold text-muted-foreground/40">{commonT("loading")}</p>
                                    </div>
                                ) : (
                                    <>
                                        {ingredients.length === 0 && (
                                            <div className="text-center py-10 bg-muted/20 rounded-lg border-2 border-dashed border-border/40 transition-colors hover:bg-muted/30">
                                                <p className="text-xs font-semibold text-muted-foreground/50">{t("noIngredientsYet")}</p>
                                            </div>
                                        )}
                                        {ingredients.map((field, index) => (
                                            <IngredientItem
                                                key={field.id}
                                                index={index}
                                                form={form}
                                                productMap={productMap}
                                                onRemove={() => removeIngredient(index)}
                                                onProductCached={(p) => setProductMap(prev => ({
                                                    ...prev,
                                                    [p.id]: {
                                                        name: p.name,
                                                        image: p.images?.[0],
                                                        kcal: p.kcal || 0,
                                                        protein: p.protein || 0,
                                                        carbs: p.carbs || 0,
                                                        fat: p.fat || 0
                                                    }
                                                }))}
                                            />
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 flex-1">
                                    <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("nutritionalInfo")}</h3>
                                    <div className="h-px w-full bg-border/60" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 bg-muted/5 p-8 rounded-lg border border-border/40">
                                <FormField
                                    control={form.control}
                                    name="kcal"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="col-span-full">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FormLabel className="text-[10px] font-semibold text-muted-foreground/40">{t("totalKcal")}</FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="flex h-10 w-full items-center rounded-lg border border-border/40 bg-muted/20 px-3 transition-all">
                                                    <span className="text-sm font-bold text-foreground">{field.value ?? 0}</span>
                                                    <div className="flex-1" />
                                                    <span className="text-[9px] font-semibold text-muted-foreground/30 capitalize tracking-wider">KCAL</span>
                                                </div>
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
                                    name="macros.protein"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40   block mb-2">{t("protein")}</FormLabel>
                                            <FormControl>
                                                <div className="flex h-10 w-full items-center rounded-lg border border-border/40 bg-muted/20 px-3 transition-all">
                                                    <span className="text-sm font-bold text-foreground">{field.value ?? 0}</span>
                                                    <div className="flex-1" />
                                                    <span className="text-[9px] font-semibold text-muted-foreground/30 capitalize tracking-wider">G</span>
                                                </div>
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
                                    name="macros.carbs"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40   block mb-2">{t("carbs")}</FormLabel>
                                            <FormControl>
                                                <div className="flex h-10 w-full items-center rounded-lg border border-border/40 bg-muted/20 px-3 transition-all">
                                                    <span className="text-sm font-bold text-foreground">{field.value ?? 0}</span>
                                                    <div className="flex-1" />
                                                    <span className="text-[9px] font-semibold text-muted-foreground/30 capitalize tracking-wider">G</span>
                                                </div>
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
                                    name="macros.fat"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40   block mb-1">{t("fat")}</FormLabel>
                                            <FormControl>
                                                <div className="flex h-10 w-full items-center rounded-lg border border-border/40 bg-muted/20 px-3 transition-all">
                                                    <span className="text-sm font-bold text-foreground">{field.value ?? 0}</span>
                                                    <div className="flex-1" />
                                                    <span className="text-[9px] font-semibold text-muted-foreground/30 capitalize tracking-wider">G</span>
                                                </div>
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

                        {/* Images Section */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 flex-1">
                                    <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("optionImages")}</h3>
                                    <div className="h-px w-full bg-border/60" />
                                </div>
                            </div>
                            <ImageUploader
                                folder={`meal-options/${initialData?.id || 'new'}`}
                                value={form.watch("images") || []}
                                onChange={(imgs) => form.setValue("images", imgs)}
                            />
                        </div>

                        {/* Substitution Notes */}
                        <div className="space-y-8">
                            <TranslationFields
                                form={form}
                                namePrefix="substitutionNotes"
                                label={t("substitutionNotes")}
                                placeholder={t("substitutionNotesPlaceholder")}
                            />
                        </div>

                        <div className="pt-4">
                            <FormField
                                control={form.control}
                                name="isDefault"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-lg border border-border/40 p-6 bg-slate-50/30 dark:bg-slate-900/10 shadow-sm shadow-black/5 group transition-colors hover:bg-slate-50/50">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm font-semibold text-secondary dark:text-foreground cursor-pointer">
                                                {t("setAsDefaultOption")}
                                            </FormLabel>
                                            <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium">
                                                {t("setAsDefaultOptionDescription")}
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </Form>
            </div>

            <div className="px-6 py-4 border-t flex flex-row items-center justify-end gap-2 bg-muted/5">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors"
                >
                    {commonT("cancel")}
                </Button>
                <Button
                    type="button"
                    onClick={form.handleSubmit(handleSubmit)}
                    className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                >
                    {commonT("save")}
                </Button>
            </div>
        </div>
    )
}

function IngredientItem({ index, form, productMap, onRemove, onProductCached }: {
    index: number;
    form: any;
    productMap: any;
    onRemove: () => void;
    onProductCached: (p: any) => void;
}) {
    const t = useTranslations("Meals")
    const commonT = useTranslations("Common")

    const { fields: substitutions, append: appendSub, remove: removeSub } = useFieldArray({
        control: form.control,
        name: `ingredients.${index}.substitutions`
    })

    const productId = form.watch(`ingredients.${index}.productId`)
    const product = productMap[productId]
    const locale = useLocale()
    const productName = product?.name?.[locale] || product?.name?.en || product?.name?.["pt-br"] || product?.name?.["pt-pt"] || t("unnamedProduct")

    const mainQuantity = Number(form.watch(`ingredients.${index}.quantity`)) || 0

    // Auto-calculate substitution quantities to match main ingredient kcal
    const watchedSubstitutions = form.watch(`ingredients.${index}.substitutions`) || []
    React.useEffect(() => {
        if (!product || product.kcal === undefined) return;

        const targetKcal = (Number(product.kcal) * mainQuantity) / 100;

        watchedSubstitutions.forEach((sub: any, subIndex: number) => {
            const subProduct = productMap[sub.productId];
            if (subProduct && subProduct.kcal && subProduct.kcal > 0) {
                const calculatedQty = Math.round((targetKcal * 100) / Number(subProduct.kcal));
                // Only update if significantly different to avoid feedback loops or minor decimals
                if (Math.abs(calculatedQty - (Number(sub.quantity) || 0)) > 0.5) {
                    form.setValue(`ingredients.${index}.substitutions.${subIndex}.quantity`, calculatedQty);
                }
            }
        });
    }, [mainQuantity, productId, watchedSubstitutions.length, productMap]);

    return (
        <div className="group border border-border/40 rounded-lg overflow-hidden bg-background divide-y divide-border/40">
            {/* Header / Primary Ingredient */}
            <div className="flex items-center gap-4 p-4 bg-muted/5">
                <div className="h-12 w-12 rounded-lg bg-muted border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                    {product?.image?.url ? (
                        <MediaDisplay src={product.image.url} alt={productName} />
                    ) : (
                        <div className="h-full w-full bg-muted/20 flex items-center justify-center">
                            <span className="text-[10px] font-semibold text-muted-foreground/20 italic">PHOTO</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-semibold text-muted-foreground/50 transition-colors group-hover:text-muted-foreground/70">{t("ingredients")}</span>
                    <h4 className="font-semibold text-xs text-secondary truncate">{productName}</h4>
                </div>

                <div className="w-44 shrink-0">
                    <Stepper
                        className="h-8"
                        value={form.watch(`ingredients.${index}.quantity`)}
                        onChange={(v) => form.setValue(`ingredients.${index}.quantity`, v)}
                        unit={form.watch(`ingredients.${index}.unit`)}
                    />
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={onRemove}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Portional Nutritional Values */}
            {product && (
                <div className="px-4 py-2 bg-primary/5 flex items-center gap-6 border-b border-border/20">
                    <div className="flex items-center gap-1.5 font-semibold text-[10px] text-primary/80">
                        <span>{Math.round(((Number(product.kcal) || 0) * (Number(form.watch(`ingredients.${index}.quantity`)) || 0)) / 100)} kcal</span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-medium text-muted-foreground/60">
                        <div className="flex items-center gap-1">
                            <span className="opacity-50">Prot:</span>
                            <span className="text-secondary dark:text-foreground/80">{(((Number(product.protein) || 0) * (Number(form.watch(`ingredients.${index}.quantity`)) || 0)) / 100).toFixed(1)}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="opacity-50">Carb:</span>
                            <span className="text-secondary dark:text-foreground/80">{(((Number(product.carbs) || 0) * (Number(form.watch(`ingredients.${index}.quantity`)) || 0)) / 100).toFixed(1)}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="opacity-50">Fat:</span>
                            <span className="text-secondary dark:text-foreground/80">{(((Number(product.fat) || 0) * (Number(form.watch(`ingredients.${index}.quantity`)) || 0)) / 100).toFixed(1)}g</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Substitutions Section */}
            <div className="p-4 bg-muted/2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-muted-foreground/50 transition-colors group-hover:text-muted-foreground/70">{t("substitutions")}</span>
                    </div>
                    <ProductSelector
                        multiSelect
                        onMultiSelect={(products) => {
                            products.forEach(p => {
                                appendSub({
                                    productId: p.id,
                                    quantity: 0, // Will be auto-calculated by the useEffect
                                    unit: form.getValues(`ingredients.${index}.unit`)
                                })
                                onProductCached(p)
                            })
                        }}
                        onSelect={() => { }} // Not used in multiSelect mode
                        placeholder={commonT("add")}
                        className="h-8 w-auto min-w-[80px] justify-center px-4 text-xs font-semibold border-border/50 bg-transparent text-muted-foreground hover:bg-muted/5 rounded-lg transition-all"
                    />
                </div>

                {substitutions.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground/40 italic px-1">{t("noSubstitutionsDefined") || "No substitutes defined"}</p>
                ) : (
                    <div className="grid gap-2">
                        {substitutions.map((sub: any, subIndex: number) => {
                            const subProduct = productMap[sub.productId]
                            const subName = subProduct?.name?.[locale] || subProduct?.name?.en || subProduct?.name?.["pt-br"] || subProduct?.name?.["pt-pt"] || t("unnamedProduct")
                            const subQuantity = form.watch(`ingredients.${index}.substitutions.${subIndex}.quantity`)

                            return (
                                <div key={sub.id} className="flex flex-col rounded-lg bg-muted/10 border border-border/20 transition-colors overflow-hidden">
                                    <div className="flex items-center gap-3 p-2">
                                        <div className="h-8 w-8 rounded-md bg-muted border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                                            {subProduct?.image?.url ? (
                                                <MediaDisplay src={subProduct.image.url} alt={subName} />
                                            ) : (
                                                <div className="text-[8px] font-semibold text-muted-foreground/40">S</div>
                                            )}
                                        </div>
                                        <span className="flex-1 text-[11px] font-medium text-secondary truncate">
                                            {subName}
                                        </span>
                                        <div className="w-40 shrink-0 flex items-center justify-end pr-4">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                                <span className="text-[11px] font-bold text-primary">{subQuantity}</span>
                                                <span className="text-[9px] font-semibold text-primary/40">g</span>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground/30 hover:text-destructive transition-colors"
                                            onClick={() => removeSub(subIndex)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                    {subProduct && (
                                        <div className="px-3 py-1 bg-muted/20 border-t border-border/10 flex items-center gap-4">
                                            <span className="text-[9px] font-bold text-muted-foreground/60">{Math.round(((Number(subProduct.kcal) || 0) * (Number(subQuantity) || 0)) / 100)} kcal</span>
                                            <div className="flex items-center gap-3 text-[9px] text-muted-foreground/40 font-medium">
                                                <span>P: {(((Number(subProduct.protein) || 0) * (Number(subQuantity) || 0)) / 100).toFixed(1)}g</span>
                                                <span>C: {(((Number(subProduct.carbs) || 0) * (Number(subQuantity) || 0)) / 100).toFixed(1)}g</span>
                                                <span>F: {(((Number(subProduct.fat) || 0) * (Number(subQuantity) || 0)) / 100).toFixed(1)}g</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
