"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
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
import { ImageUploader } from "@/components/shared/image-uploader"
import { Stepper } from "@/components/ui/stepper"

interface ProductDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product?: Product | null
}

export function ProductDrawer({ open, onOpenChange, product }: ProductDrawerProps) {
    const t = useTranslations("Products")
    const commonT = useTranslations("Common")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [formId] = React.useState(() => crypto.randomUUID())

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            id: formId,
            name: {},
            kcal: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            tagIds: [],
            brandIds: [],
            images: [],
            isPublic: true,
        },
    }) as any

    React.useEffect(() => {
        if (product) {
            form.reset({
                ...product,
                name: product.name || {}
            })
        } else {
            form.reset({
                id: crypto.randomUUID(), // Refresh ID for next new product
                name: {},
                kcal: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                tagIds: [],
                brandIds: [],
                images: [],
                isPublic: true,
            })
        }
    }, [product, form, open])

    const currentId = form.watch("id") || formId

    async function onSubmit(values: Product) {
        setIsSubmitting(true)
        try {
            const result = await upsertProduct(values)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(product ? "Product updated successfully" : "Product created successfully")
                onOpenChange(false)
            }
        } catch (error) {
            toast.error("Failed to save product")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl p-0 flex flex-col bg-background border-l border-border">
                {/* Minimalist Top Accent */}
                <div className="h-1 w-full bg-primary" />

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <SheetHeader className="px-8 py-8 space-y-2">
                        <SheetTitle className="text-2xl font-bold tracking-tight text-secondary dark:text-foreground">
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
                                    placeholder="e.g. Chicken Breast"
                                />

                                {/* Nutritional Values */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-xs text-secondary dark:text-white whitespace-nowrap">{t("mediaGallery")}</h3>
                                        <div className="h-px flex-1 bg-border/60 ml-2" />
                                    </div>
                                    <ImageUploader
                                        folder={`products/${currentId}`}
                                        value={form.watch("images") || []}
                                        onChange={(images) => form.setValue("images", images, { shouldDirty: true })}
                                    />
                                </div>

                                {/* Nutritional Values */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-xs text-secondary dark:text-white whitespace-nowrap">{t("nutritionalValues")} <span className="text-[10px] font-normal lowercase opacity-50 ml-1">({t("per100g")})</span></h3>
                                        <div className="h-px flex-1 bg-border/60 ml-2" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
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
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-xs text-secondary dark:text-white whitespace-nowrap">{t("organization")}</h3>
                                        <div className="h-px flex-1 bg-border/60 ml-2" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="space-y-4">
                                            <TagSelector
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



                                        <div className="p-4 rounded-lg bg-muted/20 border border-border group">
                                            <FormField
                                                control={form.control}
                                                name="isPublic"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-sm font-bold text-secondary dark:text-white">{t("globalVisibility")}</FormLabel>
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

                    <SheetFooter className="px-8 py-8 border-t flex flex-row items-center justify-end gap-3 bg-muted/5">
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
