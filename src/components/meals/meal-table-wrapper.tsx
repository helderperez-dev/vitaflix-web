"use client"

import * as React from "react"
import { Plus, Trash2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Meal } from "@/shared-schemas/meal"
import { MealDrawer } from "./meal-drawer"
import { MealActions } from "./meal-actions"
import { useLocale, useTranslations } from "next-intl"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { useQueryState } from "nuqs"
import { toast } from "sonner"
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
import { updateUserPreferences } from "@/app/actions/users"
import { bulkDeleteMeals } from "@/app/actions/meals"
import { getTags } from "@/app/actions/tags"
import { type Tag } from "@/shared-schemas/tag"
import type { ColumnDef } from "@tanstack/react-table"

interface MealTableWrapperProps {
    initialMeals: any[]
    userProfile?: any
}

export function MealTableWrapper({ initialMeals, userProfile }: MealTableWrapperProps) {
    const locale = useLocale()
    const t = useTranslations("Meals")
    const commonT = useTranslations("Common")
    const [drawerOpen, setDrawerOpen] = React.useState(false)
    const [selectedMeal, setSelectedMeal] = React.useState<Meal | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
    const [rowsToDelete, setRowsToDelete] = React.useState<any[]>([])
    const [clearSelectionRef, setClearSelectionRef] = React.useState<{ fn: () => void } | null>(null)
    const [searchQuery, setSearchQuery] = useQueryState("search", { defaultValue: "" })
    const [idParam, setIdParam] = useQueryState("id")
    const [allTags, setAllTags] = React.useState<Tag[]>([])

    React.useEffect(() => {
        const fetchTags = async () => {
            const categories = await getTags('meal_categories')
            const dietary = await getTags('dietary_tags')
            setAllTags([...(categories || []), ...(dietary || [])])
        }
        fetchTags()
    }, [])

    const data = React.useMemo(() => {
        return initialMeals.map(m => ({
            ...m,
            mappedMeal: {
                id: m.id,
                name: m.name,
                mealTypes: m.meal_types || [],
                cookTime: m.cook_time || 0,
                preparationMode: m.preparation_mode,
                satiety: m.satiety || 0,
                restrictions: m.restrictions || [],
                publishOn: m.publish_on,
            } as Meal,
            nameLocale: m.name?.[locale] || m.name?.en || "Unnamed Meal",
        }))
    }, [initialMeals, locale])


    const columns = React.useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: "nameLocale",
            header: ({ column }) => <SortableHeader column={column} title={t("table.name")} />,
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                        <span className="text-primary text-sm font-bold uppercase">
                            {(row.getValue("nameLocale") as string).slice(0, 2)}
                        </span>
                    </div>
                    <div className="font-semibold text-sm truncate">{row.getValue("nameLocale")}</div>
                </div>
            ),
            size: 260,
            enableHiding: false,
        },
        {
            accessorKey: "cookTime",
            header: ({ column }) => <SortableHeader column={column} title={t("table.cookTime")} />,
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono text-[11px] h-6 px-2 bg-slate-50/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-muted-foreground flex items-center gap-1.5 w-fit">
                    <Clock className="h-3 w-3" />
                    {row.getValue("cookTime")} min
                </Badge>
            ),
            size: 100,
        },
        {
            accessorKey: "mealTypes",
            header: ({ column }) => <SortableHeader column={column} title={t("table.categories")} />,
            cell: ({ row }) => {
                const ids = row.original.mappedMeal.mealTypes || []
                return (
                    <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                        {ids.map((id: string) => {
                            const tag = allTags.find(t => t.id === id)
                            if (!tag) return null
                            return (
                                <Badge key={id} variant="secondary" className="px-2 py-0 h-5 text-[10px] font-bold bg-slate-800 text-white dark:bg-white/10 dark:text-white border-none rounded-full">
                                    {tag.name?.[locale] || tag.name?.en}
                                </Badge>
                            )
                        })}
                        {ids.length === 0 && <span className="text-xs text-muted-foreground/40 italic">None</span>}
                    </div>
                )
            },
            size: 150,
        },
        {
            accessorKey: "restrictions",
            header: ({ column }) => <SortableHeader column={column} title={t("table.dietaryTags")} />,
            cell: ({ row }) => {
                const ids = row.original.mappedMeal.restrictions || []
                return (
                    <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                        {ids.map((id: string) => {
                            const tag = allTags.find(t => t.id === id)
                            if (!tag) return null
                            return (
                                <Badge key={id} variant="secondary" className="px-1.5 h-5 text-[10px] font-semibold bg-primary/10 text-primary border-none rounded-md">
                                    {tag.name?.[locale] || tag.name?.en}
                                </Badge>
                            )
                        })}
                        {ids.length === 0 && <span className="text-xs text-muted-foreground/40 italic">None</span>}
                    </div>
                )
            },
            size: 150,
        },
        {
            accessorKey: "satiety",
            header: ({ column }) => <SortableHeader column={column} title={t("table.satiety")} />,
            cell: ({ row }) => {
                const satiety = row.getValue("satiety") as number
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-16 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shrink-0 border border-slate-200/50 dark:border-white/5">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${(satiety || 0) * 10}%` }}
                            />
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground dark:text-white/60">{satiety}/10</span>
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
                        meal={row.original.mappedMeal}
                        onEdit={() => {
                            setSelectedMeal(row.original.mappedMeal)
                            setDrawerOpen(true)
                        }}
                    />
                </div>
            ),
            size: 50,
            enableResizing: false,
            enableHiding: false,
        },
    ], [locale, t, allTags])

    const handlePreferencesChange = React.useCallback((newPrefs: any) => {
        if (!userProfile?.id) return
        const fullPrefs = {
            ...userProfile.preferences,
            mealTable: newPrefs
        }
        updateUserPreferences(userProfile.id, fullPrefs)
    }, [userProfile?.id, userProfile?.preferences])

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

                <Button
                    onClick={() => { setSelectedMeal(null); setDrawerOpen(true); }}
                    className="bg-primary hover:bg-primary/95 text-white font-semibold transition-all active:scale-95 shadow-sm h-10 px-6 rounded-xl text-xs flex items-center gap-2 group/add"
                >
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
                enableRowSelection={true}
                initialPreferences={userProfile?.preferences?.mealTable}
                onPreferencesChange={handlePreferencesChange}
                onRowClick={(row) => {
                    setSelectedMeal(row.mappedMeal)
                    setDrawerOpen(true)
                }}
                selectionActions={(selectedRows, clearSelection) => (
                    <div className="flex items-center gap-6 w-full">
                        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 shrink-0 ml-auto" />

                        <Button
                            variant="ghost"
                            className="h-9 px-4 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground dark:text-white/80 hover:text-foreground dark:hover:text-white transition-all shrink-0"
                            onClick={() => {
                                setRowsToDelete(selectedRows)
                                setClearSelectionRef({ fn: clearSelection })
                                setDeleteModalOpen(true)
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete ({selectedRows.length})
                        </Button>
                    </div>
                )}
                emptyStateText={t("noMeals")}
            />

            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent className="rounded-2xl border-sidebar-border/50 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {rowsToDelete.length} {rowsToDelete.length === 1 ? 'meal' : 'meals'}.
                            This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl font-semibold text-xs h-9">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                try {
                                    const ids = rowsToDelete.map(r => r.id)
                                    const result = await bulkDeleteMeals(ids)

                                    if (result.success) {
                                        toast.success(`Deleted ${ids.length} meals`)
                                        clearSelectionRef?.fn()
                                    } else {
                                        toast.error(result.error || "Failed to delete meals")
                                    }
                                } finally {
                                    setDeleteModalOpen(false)
                                }
                            }}
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-xs h-9 px-6"
                        >
                            Confirm Deletion
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <MealDrawer
                open={drawerOpen}
                onOpenChange={(val) => {
                    setDrawerOpen(val)
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
