"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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

interface ProductDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product?: Product | null
}

export function ProductDrawer({ open, onOpenChange, product }: ProductDrawerProps) {
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
            slug: "",
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
                slug: "",
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
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-transparent">
                                {product ? "Management" : "Creation"}
                            </Badge>
                            {product && (
                                <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-mono border-border text-muted-foreground bg-muted/30">
                                    ID: {product.id?.split("-")[0]}
                                </Badge>
                            )}
                        </div>
                        <SheetTitle className="text-2xl font-bold tracking-tight text-secondary">
                            {product ? "Edit Product" : "New Product"}
                        </SheetTitle>
                        <SheetDescription className="text-sm">
                            {product
                                ? "Refine the nutritional details and multilingual names for this ingredient."
                                : "Easily add a new nutritional ingredient to the database."}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
                        <Form {...form}>
                            <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                                {/* Product Names */}
                                <TranslationFields
                                    form={form}
                                    namePrefix="name"
                                    label="Product Name"
                                    placeholder="e.g. Chicken Breast"
                                />

                                {/* Nutritional Values */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-secondary uppercase tracking-widest">Media Gallery</h3>
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
                                        <h3 className="font-bold text-sm text-secondary uppercase tracking-widest">Nutritional Values <span className="text-[10px] font-normal lowercase opacity-50 ml-1">(per 100g)</span></h3>
                                        <div className="h-px flex-1 bg-border/60 ml-2" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        <FormField
                                            control={form.control}
                                            name="kcal"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Energy</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input type="number" className="pr-16 font-semibold" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40">KCAL</span>
                                                        </div>
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
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protein</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input type="number" step="0.1" className="pr-12 font-semibold" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40">G</span>
                                                        </div>
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
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Carbs</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input type="number" step="0.1" className="pr-12 font-semibold" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40">G</span>
                                                        </div>
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
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fat</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input type="number" step="0.1" className="pr-12 font-semibold" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40">G</span>
                                                        </div>
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
                                        <h3 className="font-bold text-sm text-secondary uppercase tracking-widest">System Settings</h3>
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

                                        <FormField
                                            control={form.control}
                                            name="slug"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">External Key (Slug)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. chicken-breast" className="font-mono text-xs" {...field} value={field.value || ""} />
                                                    </FormControl>
                                                    <FormDescription className="text-[10px]">Unique identifier used for external integrations and referencing.</FormDescription>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="p-4 rounded-lg bg-muted/20 border border-border group">
                                            <FormField
                                                control={form.control}
                                                name="isPublic"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-sm font-bold text-secondary">Global Visibility</FormLabel>
                                                            <FormDescription className="text-[11px] leading-relaxed">
                                                                When active, this ingredient is visible to all users across the platform.
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
                            className="h-10 px-6 font-bold text-xs uppercase tracking-widest border-border hover:bg-muted/30 transition-colors"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="product-form"
                            className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-sm shadow-primary/10 transition-all active:scale-[0.98]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Save
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    )
}
