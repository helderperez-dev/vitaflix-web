"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TranslationFields } from "./translation-fields"
import { brandSchema, type Brand } from "@/shared-schemas/brand"
import { upsertBrand, deleteBrand } from "@/app/actions/brands"
import { ImageUploader } from "./image-uploader"

interface BrandModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    brand?: Brand | null
    onSuccess?: () => void
}

export function BrandModal({ open, onOpenChange, brand, onSuccess }: BrandModalProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)

    // Generate stable ID for new brands so images can be uploaded into a specific folder
    const [formId] = React.useState(() => crypto.randomUUID())

    const form = useForm<Brand>({
        resolver: zodResolver(brandSchema),
        defaultValues: {
            id: formId,
            name: {},
            logoUrl: null
        },
    })

    React.useEffect(() => {
        if (brand) {
            form.reset({
                ...brand,
                name: brand.name || {},
            })
        } else {
            form.reset({
                id: crypto.randomUUID(), // Reset with new ID when opened fresh
                name: {},
                logoUrl: null
            })
        }
    }, [brand, form, open])

    async function onSubmit(values: Brand) {
        setIsSubmitting(true)
        try {
            const result = await upsertBrand(values)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(brand ? "Brand updated successfully" : "Brand created successfully")
                onSuccess?.()
                onOpenChange(false)
            }
        } catch (error) {
            toast.error("Failed to save brand")
        } finally {
            setIsSubmitting(false)
        }
    }

    async function onDelete() {
        if (!brand?.id) return
        if (!confirm("Are you sure you want to delete this brand? This will remove its logo and untie it from all products.")) return

        setIsDeleting(true)
        try {
            const result = await deleteBrand(brand.id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Brand deleted successfully")
                onSuccess?.()
                onOpenChange(false)
            }
        } catch (error) {
            toast.error("Failed to delete brand")
        } finally {
            setIsDeleting(false)
        }
    }

    const currentLogoUrl = form.watch('logoUrl')
    const currentId = form.watch('id') || formId

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md p-0 overflow-hidden bg-background border-border"
                onInteractOutside={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                {/* Visual Accent */}
                <div className="h-1 w-full bg-primary" />

                <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto">
                    <DialogHeader className=" space-y-2">
                        <DialogTitle className="text-xl font-bold tracking-tight text-secondary">
                            {brand ? "Edit Brand" : "New Brand"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            {brand
                                ? "Update the name and logo for this brand."
                                : "Create a new brand to associate with multiple products."}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form id="brand-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <TranslationFields
                                form={form}
                                namePrefix="name"
                                label="Brand Name"
                                placeholder="e.g. Vitaflix"
                            />

                            <ImageUploader
                                folder={`brands/${currentId}`}
                                maxImages={1}
                                value={currentLogoUrl ? [{ url: currentLogoUrl, isDefault: true }] : []}
                                onChange={(imgs) => form.setValue('logoUrl', imgs[0]?.url || null)}
                            />
                        </form>
                    </Form>
                </div>

                <DialogFooter className="px-8 py-6 bg-muted/5 border-t flex flex-row items-center justify-between gap-3">
                    <div className="flex-1">
                        {brand && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                disabled={isSubmitting || isDeleting}
                                className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-colors gap-2"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="h-9 px-6 font-bold text-[10px] uppercase tracking-widest border-border hover:bg-muted/10 transition-colors"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting || isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="brand-form"
                            className="h-9 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase tracking-widest shadow-sm shadow-primary/10 transition-all active:scale-[0.98]"
                            disabled={isSubmitting || isDeleting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Save
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
