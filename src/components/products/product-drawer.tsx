"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale, useTranslations } from "next-intl"
import {
    Loader2
} from "lucide-react"
import { toast } from "sonner"

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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { productSchema, type Product } from "@/shared-schemas/product"
import { upsertProduct } from "@/app/actions/products"
import { TranslationFields } from "@/components/shared/translation-fields"
import { TagSelector } from "@/components/shared/tag-selector"
import { BrandSelector } from "@/components/shared/brand-selector"
import { GroupSelector } from "@/components/shared/group-selector"
import { DictionarySelector } from "@/components/shared/dictionary-selector"
import { ImageUploader } from "@/components/shared/image-uploader"
import { Stepper } from "@/components/ui/stepper"
import { getTags } from "@/app/actions/tags"
import type { Tag } from "@/shared-schemas/tag"

interface ProductDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product?: Product | null
}

export function ProductDrawer({ open, onOpenChange, product }: ProductDrawerProps) {
    const t = useTranslations("Products")
    const commonT = useTranslations("Common")
    const locale = useLocale()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [unitOptions, setUnitOptions] = React.useState<Tag[]>([])
    const [formId] = React.useState(() => crypto.randomUUID())

    const form = useForm<Product>({
        resolver: zodResolver(productSchema) as never,
        defaultValues: {
            id: formId,
            name: {},
            kcal: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            unitId: null,
            referenceAmount: 100,
            tagIds: [],
            brandIds: [],
            groupIds: [],
            countryIds: [],
            images: [],
            isPublic: true,
        },
    })

    React.useEffect(() => {
        if (product) {
            form.reset({
                ...product,
                name: product.name || {},
                referenceAmount: (product as Product & { reference_amount?: number }).referenceAmount ?? (product as Product & { reference_amount?: number }).reference_amount ?? 100
            })
        } else {
            form.reset({
                id: crypto.randomUUID(), // Refresh ID for next new product
                name: {},
                kcal: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                unitId: null,
                referenceAmount: 100,
                tagIds: [],
                brandIds: [],
                groupIds: [],
                countryIds: [],
                images: [],
                isPublic: true,
            })
        }
    }, [product, form, open])

    React.useEffect(() => {
        async function loadUnits() {
            const units = await getTags("measurement_units")
            setUnitOptions(units || [])
        }

        if (open) {
            loadUnits()
        }
    }, [open])

    React.useEffect(() => {
        if (!open || product || unitOptions.length === 0) return
        const currentUnitId = form.getValues("unitId")
        if (!currentUnitId) {
            form.setValue("unitId", unitOptions[0].id, { shouldDirty: true })
        }
    }, [open, product, unitOptions, form])

    const currentId = form.watch("id") || formId
    const selectedUnitId = form.watch("unitId")
    const referenceAmount = form.watch("referenceAmount") || 100
    const selectedUnit = unitOptions.find((unit) => unit.id === selectedUnitId)
    const unitSymbol = selectedUnit?.slug || selectedUnit?.name?.[locale] || selectedUnit?.name?.en || selectedUnit?.name?.["pt-br"] || selectedUnit?.name?.["pt-pt"] || "g"

    React.useEffect(() => {
        if (!open) return
        const unit = unitOptions.find((option) => option.id === selectedUnitId)
        const slug = (unit?.slug || "").toLowerCase()
        const currentReference = form.getValues("referenceAmount")
        if ((slug === "unit" || slug === "slice") && (!currentReference || currentReference === 100)) {
            form.setValue("referenceAmount", 1, { shouldDirty: true })
        }
        if ((slug === "g" || slug === "ml" || slug === "gram" || slug === "milliliter") && (!currentReference || currentReference === 1)) {
            form.setValue("referenceAmount", 100, { shouldDirty: true })
        }
    }, [open, selectedUnitId, unitOptions, form])

    async function onSubmit(values: Product) {
        setIsSubmitting(true)
        try {
            const result = await upsertProduct(values)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(product ? commonT("updatedSuccessfully") : commonT("createdSuccessfully"))
                onOpenChange(false)
            }
        } catch (error) {
            toast.error(commonT("errorSaving"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl p-0 flex flex-col bg-background border-l border-border">
                {/* High-End Ambient Glow */}
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-50 via-white to-white dark:from-white/[0.04] dark:via-transparent dark:to-transparent pointer-events-none -z-10" />

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
                    <SheetHeader className="px-8 py-8 space-y-2">
                        <SheetTitle className="text-2xl font-semibold tracking-tight text-secondary dark:text-foreground">
                            {product ? t("editProduct") : t("newProduct")}
                        </SheetTitle>
                        <SheetDescription className="text-sm">
                            {t("description")}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
                        <Form {...form}>
                            <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                                {/* Product Names */}
                                <TranslationFields
                                    form={form}
                                    namePrefix="name"
                                    label={t("table.name")}
                                    placeholder={t("namePlaceholder")}
                                    aiContext={t("description")}
                                    aiRuntimeContext={{
                                        domain: "products",
                                        entityType: "ingredient",
                                        fieldType: "text",
                                    }}
                                />

                                {/* Media Gallery */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 flex-1">
                                            <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("mediaGallery")}</h3>
                                            <div className="h-px w-full bg-border/60" />
                                        </div>
                                    </div>
                                    <ImageUploader
                                        folder={`products/${currentId}`}
                                        value={form.watch("images") || []}
                                        onChange={(images) => form.setValue("images", images, { shouldDirty: true })}
                                        enableAI
                                        aiEntityName={form.watch(`name.${locale}`) || Object.values(form.watch("name") || {}).find(value => typeof value === "string" && value.trim().length > 0) as string || "product"}
                                        aiContext={t("mediaGallery")}
                                        aiRuntimeContext={{
                                            domain: "products",
                                            entityType: "ingredient",
                                            fieldType: "image",
                                            extra: `Reference amount ${referenceAmount}${unitSymbol}. Focus on the ingredient itself, not a plated meal.`,
                                        }}
                                    />
                                </div>

                                {/* Nutritional Values */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 flex-1">
                                            <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">
                                                {t("nutritionalValues")} <span className="text-[10px] font-normal lowercase opacity-50 ml-1">{`(per ${referenceAmount}${unitSymbol})`}</span>
                                            </h3>
                                            <div className="h-px w-full bg-border/60" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        <FormField
                                            control={form.control}
                                            name="referenceAmount"
                                            render={({ field }) => (
                                                <FormItem className="col-span-full">
                                                    <FormLabel className="text-xs font-semibold text-muted-foreground/70">{t("nutritionReference")}</FormLabel>
                                                    <FormControl>
                                                        <Stepper
                                                            value={field.value ?? 100}
                                                            onChange={field.onChange}
                                                            step={1}
                                                            unit={unitSymbol}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="kcal"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold text-muted-foreground/70">{t("energy")}</FormLabel>
                                                    <FormControl>
                                                        <Stepper
                                                            value={field.value ?? 0}
                                                            onChange={field.onChange}
                                                            unit="KCAL"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="protein"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold text-muted-foreground/70">{t("protein")}</FormLabel>
                                                    <FormControl>
                                                        <Stepper
                                                            value={field.value ?? 0}
                                                            onChange={field.onChange}
                                                            step={0.1}
                                                            unit="G"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="carbs"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold text-muted-foreground/70">{t("carbs")}</FormLabel>
                                                    <FormControl>
                                                        <Stepper
                                                            value={field.value ?? 0}
                                                            onChange={field.onChange}
                                                            step={0.1}
                                                            unit="G"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="fat"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold text-muted-foreground/70">{t("fat")}</FormLabel>
                                                    <FormControl>
                                                        <Stepper
                                                            value={field.value ?? 0}
                                                            onChange={field.onChange}
                                                            step={0.1}
                                                            unit="G"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* System Settings */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 flex-1">
                                            <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("organization")}</h3>
                                            <div className="h-px w-full bg-border/60" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="space-y-4">
                                            <TagSelector
                                                title={t("tags")}
                                                selectedTagIds={form.watch("tagIds") || []}
                                                onTagsChange={(tagIds) => form.setValue("tagIds", tagIds, { shouldDirty: true })}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <BrandSelector
                                                selectedBrandIds={form.watch("brandIds") || []}
                                                onBrandsChange={(brandIds) => form.setValue("brandIds", brandIds, { shouldDirty: true })}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <GroupSelector
                                                selectedGroupIds={form.watch("groupIds") || []}
                                                onGroupsChange={(groupIds) => form.setValue("groupIds", groupIds, { shouldDirty: true })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <TagSelector
                                                title={t("countries")}
                                                selectedTagIds={form.watch("countryIds") || []}
                                                onTagsChange={(countryIds) => form.setValue("countryIds", countryIds, { shouldDirty: true })}
                                                table="countries"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <DictionarySelector
                                                table="measurement_units"
                                                label={t("unitLabel")}
                                                placeholder={t("selectUnit")}
                                                value={form.watch("unitId") || ""}
                                                onChange={(unitId) => form.setValue("unitId", unitId, { shouldDirty: true })}
                                                returnIdOnly
                                            />
                                        </div>



                                        <div className="p-4 rounded-lg bg-muted/20 border border-border group">
                                            <FormField
                                                control={form.control}
                                                name="isPublic"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-sm font-semibold text-secondary dark:text-white">{t("globalVisibility")}</FormLabel>
                                                            <FormDescription className="text-[11px] leading-relaxed">
                                                                {t("visibilityDesc")}
                                                            </FormDescription>
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
                            </form>
                        </Form>
                    </div>

                    <SheetFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-2 bg-muted/5">
                        <Button
                            variant="outline"
                            className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            {commonT("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            form="product-form"
                            className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {commonT("save")}
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    )
}
