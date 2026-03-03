"use client"

import * as React from "react"
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteMeal, bulkUpdateMealStatus } from "@/app/actions/meals"
import { useTranslations } from "next-intl"
import { type Meal } from "@/shared-schemas/meal"

interface MealActionsProps {
    meal: Meal
    onEdit: (meal: Meal) => void
}

export function MealActions({ meal, onEdit }: MealActionsProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isUpdating, setIsUpdating] = React.useState(false)
    const commonT = useTranslations("Common")

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this meal?")) return
        if (!meal.id) return

        setIsDeleting(true)
        try {
            const result = await deleteMeal(meal.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Meal deleted")
            }
        } catch (error) {
            toast.error("Failed to delete meal")
        } finally {
            setIsDeleting(false)
        }
    }

    async function handleToggleVisibility() {
        if (!meal.id) return
        setIsUpdating(true)
        try {
            const newStatus = !meal.isPublic
            const result = await bulkUpdateMealStatus([meal.id], newStatus)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(newStatus ? "Meal is now public" : "Meal is now private")
            }
        } catch (error) {
            toast.error("Failed to update visibility")
        } finally {
            setIsUpdating(true)
            // Note: In a real app we might want to trigger a refresh or use optimistic updates
            // But since this is a server action with revalidatePath, the page should refresh.
            setIsUpdating(false)
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
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 p-1.5 rounded-2xl shadow-2xl border-sidebar-border/50 backdrop-blur-xl bg-background/90 animate-in fade-in-0 zoom-in-95"
            >
                <DropdownMenuItem
                    onClick={() => onEdit(meal)}
                    className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                >
                    <Edit className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleToggleVisibility}
                    disabled={isUpdating}
                    className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                >
                    {meal.isPublic ? (
                        <>
                            <EyeOff className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            Make Private
                        </>
                    ) : (
                        <>
                            <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            Make Public
                        </>
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                >
                    Delete Meal
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
