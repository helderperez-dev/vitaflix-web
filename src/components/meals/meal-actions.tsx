"use client"

import * as React from "react"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteMeal } from "@/app/actions/meals"
import { type Meal } from "@/shared-schemas/meal"

interface MealActionsProps {
    meal: Meal
    onEdit: (meal: Meal) => void
}

export function MealActions({ meal, onEdit }: MealActionsProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this recipe?")) return
        if (!meal.id) return

        setIsDeleting(true)
        try {
            const result = await deleteMeal(meal.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Recipe deleted")
            }
        } catch (error) {
            toast.error("Failed to delete recipe")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(meal)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
