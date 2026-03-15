"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
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

interface MealActionsProps {
    meal: Meal
    onEdit: (meal: Meal) => void
}

export function MealActions({ meal, onEdit }: MealActionsProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isUpdating, setIsUpdating] = React.useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
    const commonT = useTranslations("Common")
    const t = useTranslations("Meals")

    async function handleDelete() {
        if (!meal.id) return

        setIsDeleting(true)
        try {
            const result = await deleteMeal(meal.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(t("mealDeleted"))
            }
        } catch (error) {
            toast.error(t("failedToDeleteMeal"))
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
                toast.success(newStatus ? t("mealNowPublic") : t("mealNowPrivate"))
            }
        } catch (error) {
            toast.error(t("failedToUpdateVisibility"))
        } finally {
            setIsUpdating(false)
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
                        <span className="sr-only">{t("openMenu")}</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-56 p-1.5 rounded-lg shadow-2xl border-sidebar-border/50 backdrop-blur-xl bg-background/90 animate-in fade-in-0 zoom-in-95"
                >
                    <DropdownMenuItem
                        onSelect={() => onEdit(meal)}
                        className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                    >
                        {commonT("editDetails")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={handleToggleVisibility}
                        disabled={isUpdating}
                        className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                    >
                        {meal.isPublic ? t("makePrivate") : t("makePublic")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => setShowDeleteConfirm(true)}
                        className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer text-destructive focus:text-destructive"
                    >
                        {t("deleteMeal")}
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
                            onClick={handleDelete}
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
