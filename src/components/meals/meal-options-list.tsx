"use client"

import * as React from"react"
import { Plus, CheckCircle2, Scale, Soup, MoreHorizontal, Edit2, Trash2, Star, Image as ImageIcon } from"lucide-react"
import { useTranslations } from"next-intl"

import { Button } from"@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu"
import { MealOption } from"@/shared-schemas/meal"
import { MealOptionForm } from"./meal-option-form"
import { cn } from"@/lib/utils"

interface MealOptionsListProps {
    mealId: string
    options: MealOption[]
    onOptionsChange: (options: MealOption[]) => void
    onEditingChange?: (isEditing: boolean) => void
}

export function MealOptionsList({ mealId, options, onOptionsChange, onEditingChange }: MealOptionsListProps) {
    const t = useTranslations("Meals")
    const commonT = useTranslations("Common")
    const [isEditing, setIsEditing] = React.useState(false)
    const [editingOption, setEditingOption] = React.useState<MealOption | undefined>()

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

    const handleSaveOption = (data: MealOption) => {
        if (editingOption) {
            onOptionsChange(options.map(o => o.id === editingOption.id ? data : o))
        } else {
            const newOption = {
                ...data,
                id: data.id || crypto.randomUUID(),
                isDefault: options.length === 0 || data.isDefault
            }

            // If new option is default, unset others
            let newOptions = [...options]
            if (newOption.isDefault) {
                newOptions = newOptions.map(o => ({ ...o, isDefault: false }))
            }

            onOptionsChange([...newOptions, newOption])
        }
        setIsEditing(false)
        onEditingChange?.(false)
    }

    const handleDeleteOption = (id: string) => {
        onOptionsChange(options.filter(o => o.id !== id))
    }

    const handleSetDefault = (id: string) => {
        onOptionsChange(options.map(o => ({
            ...o,
            isDefault: o.id === id
        })))
    }

    if (isEditing) {
        return (
            <div className="h-full">
                <MealOptionForm
                    initialData={editingOption}
                    mealId={mealId}
                    onSave={handleSaveOption}
                    onCancel={() => {
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
                    <div className="h-px w-full bg-border/60"/>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOption}
                    className="h-8 w-auto min-w-[140px] justify-start px-4 text-xs font-semibold border-primary/20 bg-transparent text-primary hover:bg-primary/5 gap-2 rounded-xl transition-all"
                >
                    <Plus className="h-3 w-3"/>
                    <span>{t("addOption")}</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {options.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 gap-3 text-center transition-all hover:bg-muted/10">
                        <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center">
                            <Soup className="h-6 w-6 text-muted-foreground/30"/>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-secondary dark:text-foreground">{t("noOptionsYet")}</p>
                            <p className="text-[10px] text-muted-foreground/60 max-w-[200px] font-medium leading-relaxed">{t("addOptionDescription") ||"Start by adding your first meal variation with custom ingredients."}</p>
                        </div>
                    </div>
                ) : (
                    options.map((option, index) => (
                        <div
                            key={option.id}
                            className={cn(
                              "relative group overflow-hidden rounded-2xl border transition-all duration-300",
                                option.isDefault
                                    ?"bg-primary/[0.03] border-primary/20 shadow-sm shadow-primary/5"
                                    :"bg-white dark:bg-slate-900 border-border/40 hover:border-primary/30 hover:shadow-md hover:shadow-black/5"
                            )}
                        >
                            <div className="p-5 flex items-center gap-5">
                                {/* Leading State Indicator */}
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className={cn(
                                          "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                                            option.isDefault
                                                ?"bg-primary text-white shadow-lg shadow-primary/20"
                                                :"bg-muted/30 text-muted-foreground/40 group-hover:bg-primary/10 group-hover:text-primary/60"
                                        )}
                                    >
                                        <CheckCircle2 className={cn("h-5 w-5", option.isDefault ?"animate-in zoom-in-50":"opacity-40")} />
                                    </div>
                                    <span className={cn(
                                      "text-[9px] font-semibold   transition-colors",
                                        option.isDefault ?"text-primary":"text-muted-foreground/30 group-hover:text-primary/40"
                                    )}>
                                        {option.isDefault ? t("default") : `#${index + 1}`}
                                    </span>
                                </div>

                                {/* Content Grid */}
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {/* Kcal Section */}
                                    <div className="flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1 rounded-md bg-orange-500/10 text-orange-500">
                                                <Scale className="h-3 w-3"/>
                                            </div>
                                            <span className="text-[10px] font-semibold text-muted-foreground/40">{t("kcal")}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-semibold text-secondary dark:text-foreground leading-none">{option.kcal || 0}</span>
                                        </div>
                                    </div>

                                    {/* Macros Grid */}
                                    <div className="col-span-1 md:col-span-2 flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-[2px] bg-border/40 rounded-full"/>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-3.5 h-3.5 rounded-sm bg-blue-500/20 flex items-center justify-center text-[8px] font-semibold text-blue-600">P</span>
                                                    <span className="text-xs font-semibold text-secondary dark:text-foreground">{option.macros?.protein || 0}g</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500/20 flex items-center justify-center text-[8px] font-semibold text-emerald-600">C</span>
                                                    <span className="text-xs font-semibold text-secondary dark:text-foreground">{option.macros?.carbs || 0}g</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-3.5 h-3.5 rounded-sm bg-rose-500/20 flex items-center justify-center text-[8px] font-semibold text-rose-600">F</span>
                                                    <span className="text-xs font-semibold text-secondary dark:text-foreground">{option.macros?.fat || 0}g</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ingredient count & photo indicator */}
                                        <div className="hidden lg:flex flex-col justify-center gap-1.5">
                                            <div className="flex items-center gap-1.5 text-muted-foreground/40">
                                                <Soup className="h-3.5 w-3.5"/>
                                                <span className="text-[10px] font-semibold">
                                                    {(option as any).ingredients?.length || 0} {t("ingredients") ||"Items"}
                                                </span>
                                            </div>
                                            {option.images && option.images.length > 0 && (
                                                <div className="flex items-center gap-1.5 text-primary/60">
                                                    <ImageIcon className="h-3.5 w-3.5"/>
                                                    <span className="text-[10px] font-semibold">{t("photoAttached")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3-dot Actions Menu */}
                                    <div className="flex items-center justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl bg-muted/20 hover:bg-muted/40 text-muted-foreground/60 hover:text-foreground transition-all active:scale-95"
                                                >
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"className="w-48 p-1.5 rounded-xl border-border/40 shadow-xl">
                                                {!option.isDefault && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => handleSetDefault(option.id!)}
                                                            className="rounded-lg text-xs font-semibold   py-2"
                                                        >
                                                            <Star className="h-4 w-4 mr-2.5 text-yellow-500/60"/>
                                                            {t("setAsDefaultOption")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="my-1.5 opacity-50"/>
                                                    </>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => handleEditOption(option)}
                                                    className="rounded-lg text-xs font-semibold   py-2"
                                                >
                                                    <Edit2 className="h-4 w-4 mr-2.5 text-primary/60"/>
                                                    {commonT("edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-1.5 opacity-50"/>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() => handleDeleteOption(option.id!)}
                                                    className="rounded-lg text-xs font-semibold   py-2"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2.5"/>
                                                    {commonT("delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>

                            {/* Accent line for hovering */}
                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300"/>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

