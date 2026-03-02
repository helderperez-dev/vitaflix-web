"use client"

import * as React from"react"
import { useForm, useFieldArray } from"react-hook-form"
import { zodResolver } from"@hookform/resolvers/zod"
import { useTranslations, useLocale } from"next-intl"
import { Trash2, Scale, Soup, Info, Image as ImageIcon, ChevronLeft, Save, X, Loader2 } from"lucide-react"
import { mealOptionSchema, type MealOption } from"@/shared-schemas/meal"
import { Button } from"@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from"@/components/ui/form"
import { Stepper } from"@/components/ui/stepper"
import { TranslationFields } from"@/components/shared/translation-fields"
import { ImageUploader } from"@/components/shared/image-uploader"
import { ProductSelector } from"@/components/shared/product-selector"
import { Separator } from"@/components/ui/separator"
import { Checkbox } from"@/components/ui/checkbox"
import { cn } from"@/lib/utils"

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
        name:"ingredients"
    })

    // Local state for product names/images to resolve IDs
    const [productMap, setProductMap] = React.useState<Record<string, { name: any; image?: string }>>({})
    const [isLoadingProducts, setIsLoadingProducts] = React.useState(false)

    const fetchProductDetails = React.useCallback(async (ids: string[]) => {
        const uniqueIds = Array.from(new Set(ids)).filter(id => !productMap[id])
        setIsLoadingProducts(true)
        try {
            const { getProductsByIds } = await import("@/app/actions/products")
            const products = await getProductsByIds(uniqueIds)

            const newMap: any = { ...productMap }
            products.forEach(p => {
                newMap[p.id] = {
                    name: p.name,
                    image: (p.images && p.images.length > 0) ? p.images[0] : undefined
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

    const handleSubmit = (values: MealOption) => {
        onSave(values)
    }

    const locale = useLocale()

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 bg-background">
            {/* Minimalist Header */}
            <div className="px-8 py-8 border-b bg-muted/5 space-y-5">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="h-8 -ml-3 text-muted-foreground/60 hover:text-foreground gap-2 transition-colors rounded-lg group px-3"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"/>
                    <span className="text-[10px] font-semibold">{t("backToVariations")}</span>
                </Button>

                <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-secondary dark:text-foreground">
                        {initialData?.id ? t("editMealOption") : t("addMealOption")}
                    </h3>
                    <p className="text-[10px] text-muted-foreground/60   font-semibold">
                        {initialData?.id ? t("syncingMetrics") : t("creatingNewVariation")}
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-8 py-10 custom-scrollbar">
                <Form {...form}>
                    <div className="space-y-10 pb-10">
                        {/* Ingredients Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-xs   text-secondary dark:text-foreground">{t("ingredientsAndSubstitutions")}</h3>
                                </div>
                                <ProductSelector
                                    onSelect={(product) => {
                                        appendIngredient({
                                            productId: product.id,
                                            quantity: 100,
                                            unit:"g",
                                            substitutions: []
                                        })
                                        // Cache product name
                                        setProductMap(prev => ({
                                            ...prev,
                                            [product.id]: {
                                                name: product.name,
                                                image: product.images?.[0]
                                            }
                                        }))
                                    }}
                                    placeholder={t("addIngredient")}
                                    className="h-8 w-auto min-w-[140px] justify-start px-4 text-xs font-semibold border-border/50 bg-transparent text-muted-foreground hover:bg-muted/5 gap-2 rounded-xl transition-all"
                                />
                            </div>

                            <div className="space-y-4">
                                {isLoadingProducts ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-2xl border border-border/20">
                                        <Loader2 className="h-6 w-6 text-primary animate-spin mb-4"/>
                                        <p className="text-[10px] font-semibold text-muted-foreground/40">{commonT("loading")}</p>
                                    </div>
                                ) : (
                                    <>
                                        {ingredients.length === 0 && (
                                            <div className="text-center py-10 bg-muted/20 rounded-2xl border-2 border-dashed border-border/40 transition-colors hover:bg-muted/30">
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
                                                onProductCached={(p) => setProductMap(prev => ({ ...prev, [p.id]: { name: p.name, image: p.images?.[0] } }))}
                                            />
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="pt-4 border-t border-border/40">
                                <TranslationFields
                                    form={form}
                                    namePrefix="substitutionNotes"
                                    label={t("substitutionNotes")}
                                    placeholder={t("substitutionNotesPlaceholder")}
                                />
                            </div>
                        </div>

                        <Separator className="bg-border/40"/>

                        {/* Nutrition Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-xs   text-secondary dark:text-foreground">{t("nutritionalInfo")}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/5 p-6 rounded-xl border border-border/40">
                                <FormField
                                    control={form.control}
                                    name="kcal"
                                    render={({ field }) => (
                                        <FormItem className="col-span-full">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Scale className="h-3 w-3 text-orange-500/60"/>
                                                <FormLabel className="text-[10px] font-semibold text-muted-foreground/40">{t("totalKcal")}</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Stepper
                                                    className="h-10"
                                                    value={field.value ?? 0}
                                                    onChange={field.onChange}
                                                    unit="KCAL"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]"/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="macros.protein"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40   block mb-2">{t("protein")}</FormLabel>
                                            <FormControl>
                                                <Stepper
                                                    className="h-10"
                                                    value={field.value ?? 0}
                                                    onChange={field.onChange}
                                                    unit="G"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]"/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="macros.carbs"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40   block mb-2">{t("carbs")}</FormLabel>
                                            <FormControl>
                                                <Stepper
                                                    className="h-10"
                                                    value={field.value ?? 0}
                                                    onChange={field.onChange}
                                                    unit="G"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]"/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="macros.fat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40   block mb-1">{t("fat")}</FormLabel>
                                            <FormControl>
                                                <Stepper
                                                    className="h-10"
                                                    value={field.value ?? 0}
                                                    onChange={field.onChange}
                                                    unit="G"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]"/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-xs   text-secondary dark:text-foreground">{t("optionImages")}</h3>
                            </div>
                            <ImageUploader
                                folder={`meal-options/${initialData?.id || 'new'}`}
                                value={form.watch("images") || []}
                                onChange={(imgs) => form.setValue("images", imgs)}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl border border-border/40 p-5 bg-primary/5 shadow-sm shadow-primary/5">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="h-5 w-5 rounded-md"
                                        />
                                    </FormControl>
                                    <div className="space-y-0.5 leading-none">
                                        <FormLabel className="text-xs font-semibold text-secondary dark:text-foreground cursor-pointer">
                                            {t("setAsDefaultOption")}
                                        </FormLabel>
                                        <p className="text-[10px] text-muted-foreground/60  tracking-tight font-medium">
                                            {t("setAsDefaultOptionDescription")}
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            </div>

            <div className="shrink-0 px-8 py-8 border-t flex flex-row items-center justify-end gap-3 bg-muted/5 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
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
                    className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98] gap-2"
                >
                    <Save className="h-4 w-4"/>
                    {t("saveOption")}
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

    const { fields: substitutions, append: appendSub, remove: removeSub } = useFieldArray({
        control: form.control,
        name: `ingredients.${index}.substitutions`
    })

    const productId = form.watch(`ingredients.${index}.productId`)
    const product = productMap[productId]
    const locale = useLocale()
    const productName = product?.name?.[locale] || product?.name?.en || product?.name?.["pt-br"] || product?.name?.["pt-pt"] || t("unnamedProduct")

    return (
        <div className="group border border-border/40 rounded-xl overflow-hidden bg-background divide-y divide-border/40">
            {/* Header / Primary Ingredient */}
            <div className="flex items-center gap-4 p-4 bg-muted/5">
                <div className="h-12 w-12 rounded-lg bg-muted border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                    {product?.image?.url ? (
                        <img src={product.image.url} alt={productName} className="h-full w-full object-cover"/>
                    ) : (
                        <div className="h-full w-full bg-muted/20 flex items-center justify-center">
                            <span className="text-[10px] font-semibold text-muted-foreground/20 italic">PHOTO</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-semibold text-muted-foreground/50  transition-colors group-hover:text-primary/60">{t("ingredients")}</span>
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
                    <Trash2 className="w-4 h-4"/>
                </Button>
            </div>

            {/* Substitutions Section */}
            <div className="p-4 bg-muted/2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-muted-foreground/50  transition-colors group-hover:text-primary/60">{t("substitutions")}</span>
                    </div>
                    <ProductSelector
                        onSelect={(p) => {
                            appendSub({
                                productId: p.id,
                                quantity: form.getValues(`ingredients.${index}.quantity`),
                                unit: form.getValues(`ingredients.${index}.unit`)
                            })
                            onProductCached(p)
                        }}
                        placeholder={t("addSubstitution")}
                        className="h-8 w-auto min-w-[140px] justify-start px-4 text-xs font-semibold border-border/50 bg-transparent text-muted-foreground hover:bg-muted/5 gap-2 rounded-xl transition-all"
                    />
                </div>

                {substitutions.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground/40 italic px-1">{t("noSubstitutionsDefined") ||"No substitutes defined"}</p>
                ) : (
                    <div className="grid gap-2">
                        {substitutions.map((sub: any, subIndex: number) => {
                            const subProduct = productMap[sub.productId]
                            const subName = subProduct?.name?.[locale] || subProduct?.name?.en || subProduct?.name?.["pt-br"] || subProduct?.name?.["pt-pt"] || t("unnamedProduct")

                            return (
                                <div key={sub.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10 border border-border/20 transition-colors hover:border-primary/20">
                                    <div className="h-8 w-8 rounded-md bg-muted border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                                        {subProduct?.image?.url ? (
                                            <img src={subProduct.image.url} alt={subName} className="h-full w-full object-cover"/>
                                        ) : (
                                            <div className="text-[8px] font-semibold text-muted-foreground/40">S</div>
                                        )}
                                    </div>
                                    <span className="flex-1 text-[11px] font-medium text-secondary truncate">
                                        {subName}
                                    </span>
                                    <div className="w-40 shrink-0">
                                        <Stepper
                                            className="h-7 text-[10px] bg-background"
                                            value={form.watch(`ingredients.${index}.substitutions.${subIndex}.quantity`)}
                                            onChange={(v) => form.setValue(`ingredients.${index}.substitutions.${subIndex}.quantity`, v)}
                                            unit={form.watch(`ingredients.${index}.substitutions.${subIndex}.unit`)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground/30 hover:text-destructive transition-colors"
                                        onClick={() => removeSub(subIndex)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5"/>
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
