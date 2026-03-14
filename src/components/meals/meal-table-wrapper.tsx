"use client"

import * as React from "react"
import { Trash2, Clock, Maximize2, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Meal } from "@/shared-schemas/meal"
import { MealDrawer } from "./meal-drawer"
import { MealActions } from "./meal-actions"
import { useLocale, useTranslations } from "next-intl"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { useQueryState } from "nuqs"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { ImageGalleryModal } from "@/components/shared/image-gallery-modal"
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
import { Switch } from "@/components/ui/switch"
import { updateUserPreferences } from "@/app/actions/users"
import { bulkDeleteMeals, bulkUpdateMealStatus } from "@/app/actions/meals"
import { getTags } from "@/app/actions/tags"
import { type Tag } from "@/shared-schemas/tag"
import { cn } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"

interface MealTableWrapperProps {
    initialMeals: MealTableData[]
    userProfile?: {
        id?: string
        preferences?: Record<string, unknown>
    } | null
}

type MealTableData = {
    id: string
    name?: Record<string, string>
    meal_types?: string[]
    cook_time?: number | null
    preparation_mode?: Record<string, string>[]
    satiety?: number | null
    restrictions?: string[]
    country_ids?: string[]
    publish_on?: string | null
    images?: { url?: string; isDefault?: boolean }[]
    is_public?: boolean | null
    meal_options?: { id: string }[]
}

type MealTableRow = MealTableData & {
    mappedMeal: Meal
    nameLocale: string
    image: string | null
}

type SelectableMealRow = {
    id: string
    is_public?: boolean | number | null
}

function BulkStatusActions({ selectedRows, clearSelection }: { selectedRows: SelectableMealRow[], clearSelection: () => void }) {
    const commonT = useTranslations("Common")
    // Determine the consensus status
    const allPublic = selectedRows.every(r => r.is_public === true || r.is_public === 1)

    const [targetPublic, setTargetPublic] = React.useState(allPublic)
    const [isDirty, setIsDirty] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    // Reset when selection changes
    React.useEffect(() => {
        setTargetPublic(allPublic)
        setIsDirty(false)
    }, [allPublic, selectedRows])

    const handleApply = async () => {
        setIsLoading(true)
        const ids = selectedRows.map(r => r.id)
        const result = await bulkUpdateMealStatus(ids, targetPublic)

        if (result.success) {
            toast.success(`Successfully updated ${ids.length} meals`)
            clearSelection()
            setIsDirty(false)
        } else {
            toast.error(result.error || "Failed to update meals")
        }
        setIsLoading(false)
    }

    return (
        <div className="flex items-center ml-auto">
            <div className={cn(
                "flex items-center gap-0 bg-slate-100/50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 transition-all overflow-hidden",
                isDirty && "border-primary/30 ring-1 ring-primary/10"
            )}>
                <div className="flex items-center gap-3 px-3 py-1.5 border-r border-slate-200 dark:border-white/10">
                    <span className={cn(
                        "text-[10px] font-semibold tracking-wide transition-colors w-14 text-center select-none",
                        targetPublic ? "text-primary" : "text-muted-foreground"
                    )}>
                        {targetPublic ? commonT("public") : commonT("private")}
                    </span>
                    <Switch
                        checked={targetPublic}
                        onCheckedChange={(val) => {
                            setTargetPublic(val)
                            setIsDirty(val !== allPublic)
                        }}
                        disabled={isLoading}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>

                <AnimatePresence mode="popLayout" initial={false}>
                    {isDirty && (
                        <motion.button
                            key="apply-btn"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "auto", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            onClick={handleApply}
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold h-9 px-4 text-xs flex items-center justify-center whitespace-nowrap active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                "Apply Changes"
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export function MealTableWrapper({ initialMeals, userProfile }: MealTableWrapperProps) {
    const [mounted, setMounted] = React.useState(false)
    const locale = useLocale()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const t = useTranslations("Meals")
    const commonT = useTranslations("Common")
    const [drawerOpen, setDrawerOpen] = React.useState(false)
    const [selectedMeal, setSelectedMeal] = React.useState<Meal | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
    const [rowsToDelete, setRowsToDelete] = React.useState<SelectableMealRow[]>([])
    const [clearSelectionRef, setClearSelectionRef] = React.useState<{ fn: () => void } | null>(null)
    const [searchQuery, setSearchQuery] = useQueryState("search", { defaultValue: "" })
    const [idParam, setIdParam] = useQueryState("id")
    const [allTags, setAllTags] = React.useState<Tag[]>([])
    const [galleryImages, setGalleryImages] = React.useState<{ url: string; isDefault?: boolean }[] | null>(null)
    const [isGalleryOpen, setIsGalleryOpen] = React.useState(false)

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
                cookTime: Number(m.cook_time || 0),
                preparationMode: m.preparation_mode || [],
                satiety: Number(m.satiety || 0),
                restrictions: m.restrictions || [],
                countryIds: m.country_ids || [],
                publishOn: m.publish_on,
                images: m.images || [],
                isPublic: m.is_public || false,
                options: [], // Options are fetched on demand in the drawer
            } as Meal,
            nameLocale: m.name?.[locale] || m.name?.en || "Unnamed Meal",
            image: m.images?.find((img) => img.isDefault)?.url || m.images?.[0]?.url || null,
        }))
    }, [initialMeals, locale])


    const columns = React.useMemo<ColumnDef<MealTableRow>[]>(() => [
        {
            accessorKey: "nameLocale",
            header: ({ column }) => <SortableHeader column={column} title={t("table.name")} />,
            cell: ({ row }) => {
                const meal = row.original.mappedMeal
                const defaultImage = meal.images?.find((img) => img.isDefault) || meal.images?.[0]
                const name = row.getValue("nameLocale") as string

                return (
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation()
                                if (meal.images && meal.images.length > 0) {
                                    setGalleryImages(meal.images)
                                    setIsGalleryOpen(true)
                                }
                            }}
                            className="h-10 w-10 rounded-md overflow-hidden bg-muted border border-border/40 flex-shrink-0 relative group cursor-pointer"
                        >
                            <MediaDisplay
                                src={defaultImage ? defaultImage.url : "/product_placeholder.png"}
                                alt={name}
                                className="transition-all group-hover:brightness-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="h-4 w-4 text-white" />
                            </div>
                        </motion.div>
                        <div className="font-semibold text-sm truncate">{name}</div>
                    </div>
                )
            },
            size: 260,
            enableHiding: false,
        },
        {
            id: "cookTime",
            accessorFn: (row) => row.mappedMeal.cookTime,
            header: ({ column }) => <SortableHeader column={column} title={t("table.cookTime")} />,
            cell: ({ row }) => {
                const cookTime = row.original.mappedMeal.cookTime || 0;
                return (
                    <Badge variant="outline" className="font-mono text-[11px] h-6 px-2 bg-slate-50/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-muted-foreground flex items-center gap-1.5 w-fit">
                        <Clock className="h-3 w-3" />
                        {cookTime} min
                    </Badge>
                )
            },
            size: 100,
        },
        {
            id: "variations",
            accessorFn: (row) => row.meal_options?.length || 0,
            header: ({ column }) => <SortableHeader column={column} title={t("mealVariations")} />,
            cell: ({ row }) => {
                const count = row.original.meal_options?.length || 0;
                return (
                    <Badge variant="secondary" className="font-mono text-[10px] h-5 px-2 bg-primary/10 text-primary border-none rounded-md">
                        {count} {count === 1 ? "Option" : "Options"}
                    </Badge>
                )
            },
            size: 100,
        },
        {
            id: "mealTypes",
            accessorFn: (row) => row.mappedMeal.mealTypes,
            header: ({ column }) => <SortableHeader column={column} title={t("table.categories")} />,
            cell: ({ row }) => {
                const ids = row.original.mappedMeal.mealTypes || []
                return (
                    <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                        {ids.map((id: string) => {
                            const tag = allTags.find(t => t.id === id)
                            if (!tag) return null
                            return (
                                <Badge key={id} variant="secondary" className="px-2 py-0 h-5 text-[10px] font-semibold bg-slate-800 text-white dark:bg-white/10 dark:text-white border-none rounded-lg">
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
            id: "restrictions",
            accessorFn: (row) => row.mappedMeal.restrictions,
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
            id: "satiety",
            accessorFn: (row) => row.mappedMeal.satiety,
            header: ({ column }) => <SortableHeader column={column} title={t("table.satiety")} />,
            cell: ({ row }) => {
                const satiety = row.original.mappedMeal.satiety || 0
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-16 bg-slate-100 dark:bg-white/5 rounded-lg overflow-hidden shrink-0 border border-slate-200/50 dark:border-white/5">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${satiety * 10}%` }}
                            />
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground dark:text-white/60">{satiety}/10</span>
                    </div>
                )
            },
            size: 120,
        },
        {
            accessorKey: "is_public",
            header: ({ column }) => <SortableHeader column={column} title={t("table.status")} />,
            cell: ({ row }) => {
                const isPublic = row.original.mappedMeal.isPublic
                return (
                    <Badge variant={isPublic ? "secondary" : "outline"} className={cn(
                        "capitalize text-[10px] h-5 px-2 border-none",
                        isPublic ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400"
                    )}>
                        {isPublic ? commonT("public") : commonT("private")}
                    </Badge>
                )
            },
            size: 100,
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

    const handlePreferencesChange = React.useCallback((newPrefs: Record<string, unknown>) => {
        if (!userProfile?.id) return
        const fullPrefs = {
            ...userProfile.preferences,
            mealTable: newPrefs
        }
        updateUserPreferences(userProfile.id, fullPrefs)
    }, [userProfile?.id, userProfile?.preferences])

    if (!mounted) return null

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                {/* Premium Background Accent */}
                <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-white dark:from-white/[0.03] dark:to-transparent pointer-events-none" />


                <div className="flex flex-col relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-lg opacity-80" />
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
                    className="bg-primary hover:bg-primary/95 text-white font-semibold transition-all active:scale-95 shadow-sm h-10 px-6 text-xs flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
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
                initialPreferences={(userProfile?.preferences as { mealTable?: { columnVisibility?: Record<string, boolean>; columnSizing?: Record<string, number> } } | undefined)?.mealTable}
                onPreferencesChange={handlePreferencesChange}
                onRowClick={(row) => {
                    setSelectedMeal(row.mappedMeal)
                    setDrawerOpen(true)
                }}
                selectionActions={(selectedRows, clearSelection) => (
                    <div className="flex items-center gap-6 w-full">
                        <BulkStatusActions
                            selectedRows={selectedRows}
                            clearSelection={clearSelection}
                        />

                        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 shrink-0" />

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
                <AlertDialogContent className="rounded-lg border-sidebar-border/50 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {rowsToDelete.length} {rowsToDelete.length === 1 ? 'meal' : 'meals'}.
                            This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="font-semibold text-xs h-9">
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
                            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-6"
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

            <ImageGalleryModal
                open={isGalleryOpen}
                onOpenChange={setIsGalleryOpen}
                images={galleryImages || []}
            />
        </div>
    )
}
