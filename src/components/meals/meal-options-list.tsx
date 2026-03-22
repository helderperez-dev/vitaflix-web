"use client"

import * as React from "react"
import { CheckCircle2, Soup, MoreHorizontal, Edit2, Trash2, Star, Image as ImageIcon, Plus, Copy } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MealOption } from "@/shared-schemas/meal"
import { MealOptionForm } from "./meal-option-form"
import { cn } from "@/lib/utils"
import { MediaDisplay } from "@/components/shared/media-display"
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

interface MealOptionsListProps {
    mealId: string
    options: MealOption[]
    preparationSteps?: string[]
    onOptionsChange: (options: MealOption[]) => void
    onPersistOptions: (options: MealOption[]) => Promise<boolean>
    onEditingChange?: (isEditing: boolean) => void
}

export function MealOptionsList({ mealId, options, preparationSteps = [], onOptionsChange, onPersistOptions, onEditingChange }: MealOptionsListProps) {
    const t = useTranslations("Meals")
    const commonT = useTranslations("Common")
    const [isEditing, setIsEditing] = React.useState(false)
    const [editingOption, setEditingOption] = React.useState<MealOption | undefined>()
    const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)
    const [isSavingOption, setIsSavingOption] = React.useState(false)

    const handleAddOption = () => {
        setEditingOption(undefined)
        setIsEditing(true)
        onEditingChange?.(true)
    }

    const handleEditOption = (option: MealOption) => {
        setEditingOption(option)
        setIsEditing(true)
        onEditingChange?.(true)
    }

    const handleSaveOption = async (data: MealOption, shouldCloseAfterSave: boolean) => {
        let savedOption = data
        let updatedOptions: MealOption[] = options

        if (editingOption) {
            savedOption = {
                ...data,
                id: data.id || editingOption.id,
            }
            updatedOptions = options.map(o => o.id === editingOption.id ? savedOption : o)
        } else {
            const newOption = {
                ...data,
                id: data.id || crypto.randomUUID(),
                isDefault: options.length === 0 || data.isDefault
            }
            savedOption = newOption

            // If new option is default, unset others
            let newOptions = [...options]
            if (newOption.isDefault) {
                newOptions = newOptions.map(o => ({ ...o, isDefault: false }))
            }

            updatedOptions = [...newOptions, newOption]
        }

        setIsSavingOption(true)
        let persisted = false
        try {
            persisted = await onPersistOptions(updatedOptions)
        } finally {
            setIsSavingOption(false)
        }

        if (!persisted) {
            return false
        }
        onOptionsChange(updatedOptions)

        if (shouldCloseAfterSave) {
            setIsEditing(false)
            onEditingChange?.(false)
            return true
        }

        setEditingOption(savedOption)
        setIsEditing(true)
        onEditingChange?.(true)
        return true
    }

    const handleDeleteOption = (id: string) => {
        onOptionsChange(options.filter(o => o.id !== id))
        setDeleteConfirmId(null)
        toast.success(commonT("deletedSuccessfully"))
    }

    const handleSetDefault = (id: string) => {
        onOptionsChange(options.map(o => ({
            ...o,
            isDefault: o.id === id
        })))
    }

    const handleDuplicateOption = (option: MealOption) => {
        const duplicatedOption = {
            ...option,
            id: crypto.randomUUID(),
            isDefault: false
        }
        onOptionsChange([...options, duplicatedOption])
        toast.success(commonT("createdSuccessfully"))
    }

    if (isEditing) {
        return (
            <div className="h-full">
                <MealOptionForm
                    initialData={editingOption}
                    mealId={mealId}
                    preparationSteps={preparationSteps}
                    isSaving={isSavingOption}
                    onSave={handleSaveOption}
                    onCancel={() => {
                        if (isSavingOption) return
                        setIsEditing(false)
                        onEditingChange?.(false)
                    }}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("mealVariations")}</h3>
                    <div className="h-px w-full bg-border/60" />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOption}
                    className="h-8 w-auto min-w-[80px] justify-center px-4 text-xs font-semibold border-border/50 bg-transparent text-muted-foreground hover:bg-muted/5 transition-all gap-2"
                >
                    <Plus className="h-3.5 w-3.5 opacity-50" />
                    {commonT("add")}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {options.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 gap-3 text-center transition-all hover:bg-muted/10">
                        <div className="h-12 w-12 rounded-lg bg-muted/30 flex items-center justify-center">
                            <Soup className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-secondary dark:text-foreground">{t("noOptionsYet")}</p>
                            <p className="text-[10px] text-muted-foreground/60 max-w-[200px] mx-auto text-center font-medium leading-relaxed">{t("addOptionDescription")}</p>
                        </div>
                    </div>
                ) : (
                    options.map((option, index) => (
                        <div
                            key={option.id}
                            className={cn(
                                "relative group overflow-hidden rounded-lg border transition-all duration-300",
                                option.isDefault
                                    ? "bg-slate-50/50 dark:bg-slate-900/50 border-primary/20"
                                    : "bg-white dark:bg-slate-900 border-border/40 hover:border-border/60"
                            )}
                        >
                            {/* Tap Area for Editing */}
                            <div
                                onClick={() => handleEditOption(option)}
                                className="p-5 pr-16 flex items-center gap-5 cursor-pointer active:scale-[0.99] transition-transform"
                            >
                                {/* Leading State Indicator */}
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className={cn(
                                            "h-10 w-10 rounded-lg flex items-center justify-center transition-all border",
                                            option.isDefault
                                                ? "bg-primary/5 text-primary border-primary/20"
                                                : "bg-muted/30 text-muted-foreground/30 border-transparent group-hover:bg-primary/5 group-hover:text-primary/40"
                                        )}
                                    >
                                        <CheckCircle2 className={cn("h-5 w-5", option.isDefault ? "animate-in zoom-in-50" : "opacity-30")} />
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-bold tracking-tight transition-colors",
                                        option.isDefault ? "text-primary/70" : "text-muted-foreground/30 group-hover:text-primary/40"
                                    )}>
                                        {option.isDefault ? t("default").toUpperCase() : `#${index + 1}`}
                                    </span>
                                </div>

                                {/* Content Grid */}
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {/* Kcal Section */}
                                    <div className="flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-semibold text-muted-foreground/40">{t("kcal")}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-semibold text-secondary dark:text-foreground leading-none">{option.kcal || 0}</span>
                                        </div>
                                    </div>

                                    {/* Macros Grid */}
                                    <div className="col-span-1 md:col-span-2 flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-[2px] bg-border/40 rounded-lg" />
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-3.5 h-3.5 rounded-sm bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground/70">P</span>
                                                    <span className="text-xs font-semibold text-secondary dark:text-foreground">{option.macros?.protein || 0}g</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-3.5 h-3.5 rounded-sm bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground/70">C</span>
                                                    <span className="text-xs font-semibold text-secondary dark:text-foreground">{option.macros?.carbs || 0}g</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-3.5 h-3.5 rounded-sm bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground/70">F</span>
                                                    <span className="text-xs font-semibold text-secondary dark:text-foreground">{option.macros?.fat || 0}g</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ingredient count & photo indicator */}
                                        <div className="hidden lg:flex flex-col justify-center gap-1.5">
                                            <div className="flex items-center gap-1.5 text-muted-foreground/40">
                                                <Soup className="h-3.5 w-3.5" />
                                                <span className="text-[10px] font-semibold">
                                                    {(option as any).ingredients?.length || 0} {t("ingredients")}
                                                </span>
                                            </div>
                                            <div className="h-8 w-8 rounded-lg overflow-hidden border border-border/40 transition-transform group-hover:scale-105 bg-white">
                                                {option.images && option.images.length > 0 ? (
                                                    <MediaDisplay
                                                        src={option.images[0].url}
                                                        alt="Option Thumbnail"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/35" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Menu - Absolutely positioned to prevent click bubbling */}
                            <div
                                className="absolute right-5 top-1/2 -translate-y-1/2 z-10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 bg-muted/20 hover:bg-muted/40 text-muted-foreground/60 hover:text-foreground transition-all active:scale-95"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56 p-1.5 rounded-lg shadow-2xl border-sidebar-border/50 backdrop-blur-xl bg-background/90 animate-in fade-in-0 zoom-in-95"
                                    >
                                        {!option.isDefault && (
                                            <>
                                                <DropdownMenuItem
                                                    onSelect={() => handleSetDefault(option.id!)}
                                                    className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                                                >
                                                    {t("setAsDefaultOption")}
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuItem
                                            onSelect={() => handleEditOption(option)}
                                            className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                                        >
                                            {commonT("edit")}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={() => handleDuplicateOption(option)}
                                            className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                                        >
                                            {commonT("duplicate")}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={() => setDeleteConfirmId(option.id!)}
                                            className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer text-destructive focus:text-destructive"
                                        >
                                            {commonT("delete")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{commonT("confirm")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {commonT("deleteConfirmationLabel")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{commonT("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => deleteConfirmId && handleDeleteOption(deleteConfirmId)}
                        >
                            {commonT("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
