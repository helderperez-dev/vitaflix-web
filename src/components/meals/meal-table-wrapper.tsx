"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Meal } from "@/shared-schemas/meal"
import { MealDrawer } from "./meal-drawer"
import { MealActions } from "./meal-actions"
import { useLocale, useTranslations } from "next-intl"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { useQueryState } from "nuqs"
import type { ColumnDef } from "@tanstack/react-table"

interface MealTableWrapperProps {
    initialMeals: any[]
}

export function MealTableWrapper({ initialMeals }: MealTableWrapperProps) {
    const locale = useLocale()
    const t = useTranslations("Recipes")
    const commonT = useTranslations("Common")
    const [open, setOpen] = React.useState(false)
    const [selectedMeal, setSelectedMeal] = React.useState<Meal | null>(null)
    const [searchQuery, setSearchQuery] = useQueryState("search", { defaultValue: "" })
    const [idParam, setIdParam] = useQueryState("id")

    const data = React.useMemo<Meal[]>(() => {
        return initialMeals.map(m => ({
            id: m.id,
            name: m.name,
            mealTypes: m.meal_types || [],
            cookTime: m.cook_time || 0,
            preparationMode: m.preparation_mode,
            satiety: m.satiety || 0,
            restrictions: m.restrictions || [],
            publishOn: m.publish_on,
        }))
    }, [initialMeals])


    const columns = React.useMemo<ColumnDef<Meal>[]>(() => [
        {
            accessorKey: "name",
            header: ({ column }) => <SortableHeader column={column} title={t("table.name")} />,
            cell: ({ row }) => (
                <span className="font-medium text-foreground text-sm">
                    {row.original.name?.[locale] || row.original.name?.en || "Unnamed Recipe"}
                </span>
            ),
            size: 300,
        },
        {
            accessorKey: "cookTime",
            header: ({ column }) => <SortableHeader column={column} title={t("table.cookTime")} />,
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono text-[10px]">
                    {row.getValue("cookTime")} min
                </Badge>
            ),
            size: 100,
        },
        {
            accessorKey: "mealTypes",
            header: ({ column }) => <SortableHeader column={column} title={t("table.categories")} />,
            cell: ({ row }) => {
                const types = row.original.mealTypes || []
                return (
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {types.map((type) => (
                            <Badge key={type} variant="secondary" className="px-2 py-0 h-5 text-[10px] uppercase font-bold">
                                {type}
                            </Badge>
                        ))}
                    </div>
                )
            },
            size: 200,
        },
        {
            accessorKey: "satiety",
            header: ({ column }) => <SortableHeader column={column} title={t("table.satiety")} />,
            cell: ({ row }) => {
                const satiety = row.getValue("satiety") as number
                return (
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${(satiety || 0) * 10}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-bold">{satiety}/10</span>
                    </div>
                )
            },
            size: 120,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()} className="flex justify-end pr-2">
                    <MealActions
                        meal={row.original}
                        onEdit={(meal) => {
                            setSelectedMeal(meal)
                            setOpen(true)
                        }}
                    />
                </div>
            ),
            size: 50,
        },
    ], [locale])

    function handleAdd() {
        setSelectedMeal(null)
        setOpen(true)
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0 px-8 py-5 border-b border-border/40 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/5 dark:from-primary/20 dark:via-primary/10 dark:to-secondary/20">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold tracking-tight text-secondary dark:text-white dark:drop-shadow-sm leading-none">{t("title")}</h2>
                    <p className="text-xs text-muted-foreground dark:text-white/60 mt-1.5">{t("description")}</p>
                </div>
                <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white font-bold transition-all active:scale-95 shadow-sm shadow-primary/20 h-8 px-4 rounded-md uppercase tracking-widest text-[10px]">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    {t("addRecipe")}
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={data}
                globalFilter={searchQuery}
                onGlobalFilterChange={setSearchQuery}
                className="flex-1"
                onRowClick={(row) => {
                    setSelectedMeal(row)
                    setOpen(true)
                }}
            />

            <MealDrawer
                open={open}
                onOpenChange={(val) => {
                    setOpen(val)
                    if (!val) {
                        setSelectedMeal(null)
                        setIdParam(null)
                    }
                }}
                meal={selectedMeal}
            />
        </div>
    )
}
