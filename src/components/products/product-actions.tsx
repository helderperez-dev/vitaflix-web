"use client"

import * as React from "react"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { deleteProduct, upsertProduct } from "@/app/actions/products"
import type { Product } from "@/shared-schemas/product"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useLocale, useTranslations } from "next-intl"
import { generateImageWithAI } from "@/app/actions/ai"
import { createClient } from "@/lib/supabase/client"

interface ProductActionsProps {
    product: Product
    onEdit: (product: Product) => void
}

export function ProductActions({ product, onEdit }: ProductActionsProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
    const locale = useLocale()
    const commonT = useTranslations("Common")
    const t = useTranslations("Products")
    const aiT = useTranslations("AIActions")
    const supabase = createClient()

    const resolveProductName = React.useMemo(() => {
        const translated = product.name?.[locale]
        if (translated?.trim()) return translated.trim()
        const fallback = Object.values(product.name || {}).find((value) => typeof value === "string" && value.trim().length > 0)
        return typeof fallback === "string" ? fallback.trim() : "ingredient"
    }, [locale, product.name])

    async function uploadDataUrl(dataUrl: string) {
        if (!dataUrl.startsWith("data:")) {
            throw new Error("Invalid AI image payload")
        }
        if (!product.id) {
            throw new Error("Product id is required")
        }
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const extension = blob.type.includes("png") ? "png" : "jpg"
        const filePath = `products/${product.id}/${crypto.randomUUID()}.${extension}`
        const { error } = await supabase.storage.from("vitaflix").upload(filePath, blob, {
            contentType: blob.type || "image/png",
            upsert: false,
        })
        if (error) {
            throw new Error(error.message)
        }
        const { data } = supabase.storage.from("vitaflix").getPublicUrl(filePath)
        return data.publicUrl
    }

    async function onGenerateMainImage() {
        if (!product.id) return
        setIsGenerating(true)
        try {
            const generation = await generateImageWithAI({
                entityName: resolveProductName,
                context: t("mediaGallery"),
                runtimeContext: {
                    domain: "products",
                    entityType: "ingredient",
                    fieldType: "image",
                },
            })
            if (generation.error || !generation.imageDataUrl) {
                toast.error(generation.error || aiT("genericError"))
                return
            }
            const publicUrl = await uploadDataUrl(generation.imageDataUrl)
            const images = [{ url: publicUrl, isDefault: true }, ...(product.images || []).map(image => ({ ...image, isDefault: false }))]
            const saveResult = await upsertProduct({
                ...product,
                images,
            })
            if (saveResult?.error) {
                toast.error(saveResult.error)
                return
            }
            toast.success(aiT("imageGenerated"))
        } catch (error) {
            toast.error(error instanceof Error ? error.message : aiT("genericError"))
        } finally {
            setIsGenerating(false)
        }
    }

    async function onDelete() {
        if (!product.id) return

        setIsDeleting(true)
        try {
            const result = await deleteProduct(product.id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(commonT("deletedSuccessfully"))
            }
        } catch {
            toast.error(t("failedToDeleteProducts"))
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-9 w-9 p-0 rounded-lg hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
                        disabled={isDeleting || isGenerating}
                    >
                        <span className="sr-only">{commonT("actions")}</span>
                        {isDeleting || isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-56 p-1.5 rounded-lg shadow-2xl border-sidebar-border/50 backdrop-blur-xl bg-background/90 animate-in fade-in-0 zoom-in-95"
                >
                    <DropdownMenuItem
                        onSelect={() => onEdit(product)}
                        className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                    >
                        {commonT("editDetails")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={onGenerateMainImage}
                        className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                        disabled={isGenerating}
                    >
                        {aiT("generateImage")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => setShowDeleteConfirm(true)}
                        className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer text-destructive focus:text-destructive"
                    >
                        {commonT("delete")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="rounded-lg border-sidebar-border/50 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{commonT("confirm")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {commonT("deleteConfirmationLabel")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="font-semibold text-xs h-9">
                            {commonT("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDelete}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-6"
                        >
                            {commonT("confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
