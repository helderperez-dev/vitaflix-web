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

interface ProductActionsProps {
    product: Product
    onEdit: (product: Product) => void
}

export function ProductActions({ product, onEdit }: ProductActionsProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    async function onDelete() {
        if (!product.id) return
        if (!confirm("Are you sure you want to delete this product?")) return

        setIsDeleting(true)
        try {
            const result = await deleteProduct(product.id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Product deleted")
            }
        } catch (err) {
            toast.error("Failed to delete product")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-9 w-9 p-0 rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
                    disabled={isDeleting}
                >
                    <span className="sr-only">Open menu</span>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 p-1.5 rounded-2xl shadow-2xl border-sidebar-border/50 backdrop-blur-xl bg-background/90 animate-in fade-in-0 zoom-in-95"
            >
                <DropdownMenuItem
                    onClick={() => onEdit(product)}
                    className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                >
                    Product Details
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onDelete}
                    className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                >
                    Delete Product
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
