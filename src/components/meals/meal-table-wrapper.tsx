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
    const t = useTranslations("Meals")
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
                    {row.original.name?.[locale] || row.original.name?.en || "Unnamed Meal"}
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
                            <Badge key={type} variant="secondary" className="px-2 py-0 h-5 text-[10px] font-semibold">
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
            <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                {/* Premium Background Accent */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[80px] pointer-events-none" />

                <div className="flex flex-col relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-full opacity-80" />
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white leading-none">
                            {t("title")}
                        </h2>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground/70 dark:text-white/40 mt-2.5 ml-4">
                        {t("description")}
                    </p>
                </div>

                <Button onClick={handleAdd} className="bg-primary hover:bg-primary/95 text-white font-semibold transition-all active:scale-95 shadow-sm h-10 px-6 rounded-xl text-xs flex items-center gap-2 group/add">
                    <div className="p-0.5 rounded-md bg-white/20 transition-transform group-hover/add:rotate-90">
                        <Plus className="h-3.5 w-3.5" />
                    </div>
                    {t("addMeal")}
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
