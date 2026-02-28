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
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
                    <span className="sr-only">Open menu</span>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(product)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Product
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
