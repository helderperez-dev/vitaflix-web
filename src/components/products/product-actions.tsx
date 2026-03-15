"use client"

import * as React from "react"
import { MoreHorizontal, Edit, Trash, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { deleteProduct } from "@/app/actions/products"
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
import { useTranslations } from "next-intl"

interface ProductActionsProps {
    product: Product
    onEdit: (product: Product) => void
}

export function ProductActions({ product, onEdit }: ProductActionsProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
    const commonT = useTranslations("Common")
    const t = useTranslations("Products")

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
        } catch (err) {
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
                        disabled={isDeleting}
                    >
                        <span className="sr-only">{commonT("actions")}</span>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
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
