
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Tag as TagIcon,
    Utensils,
    Leaf,
    Boxes,
    Target,
    ShieldCheck,
    CalendarRange,
    Plus,
    Search,
    ChevronRight,
    Trash2,
    ArrowLeft,
    BrainCircuit,
    Store,
    MoreHorizontal,
    Loader2,
    Ruler,
    Globe
} from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Tag, type TagTable } from "@/shared-schemas/tag"
import { getTags, deleteTag, deleteTags } from "@/app/actions/tags"
import { TagDrawer } from "@/components/shared/tag-drawer"
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
import { DayConfigManager } from "@/components/plans/day-config-manager"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"

const DICTIONARIES: { id: TagTable | 'plans_logic'; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
    // Product & Classification
    { id: 'brands', label: 'Brands', description: 'Manufacturer and label identities.', icon: Store },
    { id: 'dietary_tags', label: 'Dietary tags', description: 'Health requirements and filters.', icon: Leaf },
    { id: 'product_groups', label: 'Groups', description: 'Sales and inventory groupings.', icon: Boxes },
    { id: 'measurement_units', label: 'Units', description: 'Measurement base units for products.', icon: Ruler },
    { id: 'countries', label: 'Countries', description: 'Market availability by country.', icon: Globe },
    { id: 'tags', label: 'Tags', description: 'Global markers for entity classification.', icon: TagIcon },

    // Meals & Plans
    { id: 'plans_logic', label: 'Meal slots', description: 'Architecture of automated plan flows.', icon: BrainCircuit },
    { id: 'meal_categories', label: 'Meal types', description: 'Breakfast, lunch and dinner variations.', icon: Utensils },
    { id: 'meal_plan_sizes', label: 'Service cycles', description: 'Plan frequencies and meal counts.', icon: CalendarRange },

    // Users & Access
    { id: 'user_roles', label: 'Access roles', description: 'Permission levels and system personas.', icon: ShieldCheck },
    { id: 'wellness_objectives', label: 'Goals', description: 'User-specific health and wellness targets.', icon: Target },
]

export function DictionaryManager() {
    const locale = useLocale()
    const commonT = useTranslations("Common")
    const [selectedDict, setSelectedDict] = useState<TagTable | 'plans_logic' | null>(null)
    const [items, setItems] = useState<Tag[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [globalFilter, setGlobalFilter] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<Tag | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemsToDelete, setItemsToDelete] = useState<Tag[]>([])
    const [isDeleting, setIsDeleting] = useState(false)
    const [tableKey, setTableKey] = useState(0)
    const clearSelectionFn = React.useRef<(() => void) | null>(null)

    const currentDict = DICTIONARIES.find(d => d.id === selectedDict)

    useEffect(() => {
        if (selectedDict && selectedDict !== 'plans_logic') {
            loadItems()
        }
    }, [selectedDict])

    async function loadItems() {
        if (!selectedDict || selectedDict === 'plans_logic') return
        setIsLoading(true)
        try {
            const data = await getTags(selectedDict as TagTable)
            setItems(data)
        } catch (error) {
            console.error("Failed to load dictionary items", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete(item: Tag) {
        setItemsToDelete([item])
        setDeleteDialogOpen(true)
    }

    function handleBulkDelete(selectedItems: Tag[], clearSelection: () => void) {
        setItemsToDelete(selectedItems)
        clearSelectionFn.current = clearSelection
        setDeleteDialogOpen(true)
    }

    async function confirmDelete() {
        if (!selectedDict || selectedDict === 'plans_logic' || itemsToDelete.length === 0) return

        setIsDeleting(true)
        try {
            let result;
            if (itemsToDelete.length === 1) {
                result = await deleteTag(itemsToDelete[0].id!, selectedDict as TagTable)
            } else {
                result = await deleteTags(itemsToDelete.map(i => i.id!), selectedDict as TagTable)
            }

            if (result.success) {
                toast.success(itemsToDelete.length === 1 ? "Entry deleted successfully" : `${itemsToDelete.length} entries deleted successfully`)
                setDeleteDialogOpen(false)
                setItemsToDelete([])
                if (clearSelectionFn.current) clearSelectionFn.current()
                clearSelectionFn.current = null
                setTableKey(prev => prev + 1)
                loadItems()
            } else {
                toast.error(result.error || "Failed to delete entry")
            }
        } catch (error) {
            toast.error("An error occurred while deleting")
        } finally {
            setIsDeleting(false)
        }
    }

    function handleEdit(item: Tag) {
        setSelectedItem(item)
        setIsModalOpen(true)
    }

    function handleAddNew() {
        setSelectedItem(null)
        setIsModalOpen(true)
    }

    const columns = useMemo<ColumnDef<Tag>[]>(() => {
        const baseColumns: ColumnDef<Tag>[] = []

        baseColumns.push(
            {
                id: "displayName",
                header: ({ column }) => <SortableHeader column={column} title="Name" />,
                cell: ({ row }) => {
                    const localizedName = row.original.name as Record<string, string> | undefined
                    const name = localizedName?.[locale] || localizedName?.en || Object.values(row.original.name || {})[0] || "Untitled"

                    if (selectedDict === 'brands') {
                        return (
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-md overflow-hidden bg-muted border border-border/40 flex-shrink-0 flex items-center justify-center">
                                    {row.original.logo_url ? (
                                        <img src={row.original.logo_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Store className="size-4 text-muted-foreground/30" />
                                    )}
                                </div>
                                <span className="font-bold text-foreground/80 tracking-tight">
                                    {name}
                                </span>
                            </div>
                        )
                    }

                    return (
                        <span className="font-bold text-foreground/80 tracking-tight">
                            {name}
                        </span>
                    )
                },
                accessorFn: (row) => {
                    const localizedName = row.name as Record<string, string> | undefined
                    return localizedName?.[locale] || localizedName?.en || Object.values(row.name || {})[0] || ""
                },
            },
            {
                id: "languages",
                header: "Languages",
                cell: ({ row }) => {
                    const names = row.original.name as Record<string, string>
                    const langs = Object.keys(names || {}).filter(k => names[k])
                    return (
                        <div className="flex gap-1.5">
                            {langs.map(lang => (
                                <Badge key={lang} variant="outline" className="px-2 py-0 h-5 border-border/40 text-[9px] font-black capitalize text-muted-foreground/40 bg-zinc-50 dark:bg-white/5">
                                    {lang}
                                </Badge>
                            ))}
                        </div>
                    )
                }
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }) => (
                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32 rounded-lg">
                                <DropdownMenuItem
                                    onClick={() => handleEdit(row.original)}
                                    className="text-xs font-semibold py-2.5"
                                >
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDelete(row.original)}
                                    className="text-xs font-semibold py-2.5 text-destructive focus:text-destructive"
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
                size: 80,
            }
        )

        return baseColumns
    }, [locale, selectedDict])

    return (
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden bg-white dark:bg-background">
            <AnimatePresence mode="wait">
                {selectedDict === 'plans_logic' ? (
                    <motion.div
                        key="logic"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex-1 flex flex-col min-h-0"
                    >
                        <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                            {/* Premium Background Accent */}
                            <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-white dark:from-white/[0.03] dark:to-transparent pointer-events-none" />

                            <div className="flex flex-col relative z-10 w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-primary rounded-full opacity-80" />
                                    <h2 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white leading-none">
                                        Plan logic hub
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2 mt-2.5 ml-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-5 -ml-1 rounded-lg text-muted-foreground/30 hover:text-primary transition-all group"
                                        onClick={() => setSelectedDict(null)}
                                    >
                                        <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                                    </Button>
                                    <p className="text-[11px] font-medium text-muted-foreground/70 dark:text-white/40">
                                        Architectural meal slot flows
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/20 dark:bg-transparent custom-scrollbar">
                            <DayConfigManager />
                        </div>
                    </motion.div>
                ) : !selectedDict ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex-1 flex flex-col min-h-0"
                    >
                        <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                            {/* Premium Background Accent */}
                            <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-white dark:from-white/[0.03] dark:to-transparent pointer-events-none" />

                            <div className="flex flex-col relative z-10 w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-primary rounded-full opacity-80" />
                                    <h2 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white leading-none">
                                        Dictionaries
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2 mt-2.5 ml-0">
                                    <Link href="/settings">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-5 -ml-1 rounded-lg text-muted-foreground/30 hover:text-primary transition-all group"
                                        >
                                            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                                        </Button>
                                    </Link>
                                    <p className="text-[11px] font-medium text-muted-foreground/70 dark:text-white/40 max-w-2xl leading-relaxed">
                                        Manage systemic master data, architectural flows and labels.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-slate-50/20 dark:bg-transparent custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-10 w-full">
                                {DICTIONARIES.map((dict) => {
                                    const Icon = dict.icon
                                    return (
                                        <Card
                                            key={dict.id}
                                            className="group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors duration-300 border-border/40 bg-card/60 overflow-hidden relative rounded-lg shadow-none"
                                            onClick={() => setSelectedDict(dict.id)}
                                        >
                                            <CardHeader className="p-8">
                                                <div className="p-3.5 w-fit rounded-lg bg-white dark:bg-white/5 transition-all duration-300 border border-border/40 group-hover:border-primary/30 mb-6">
                                                    <Icon className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <CardTitle className="text-lg font-bold text-foreground/80 tracking-tight mb-2">{dict.label}</CardTitle>
                                                <CardDescription className="text-[12px] font-medium text-muted-foreground/50 leading-relaxed line-clamp-2">
                                                    {dict.description}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="management"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex-1 flex flex-col min-h-0 w-full"
                    >
                        {/* High-Fidelity Standardized Header */}
                        <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                            {/* Premium Background Accent */}
                            <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-white dark:from-white/[0.03] dark:to-transparent pointer-events-none" />

                            <div className="flex flex-col relative z-10 w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-primary rounded-full opacity-80" />
                                    <h2 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white leading-none">
                                        {currentDict?.label}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2 mt-2.5 ml-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-5 -ml-1 rounded-lg text-muted-foreground/30 hover:text-primary transition-all group"
                                        onClick={() => setSelectedDict(null)}
                                    >
                                        <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                                    </Button>
                                    <p className="text-[11px] font-medium text-muted-foreground/70 dark:text-white/40">
                                        {currentDict?.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 relative z-10">
                                <Button
                                    onClick={handleAddNew}
                                    className="bg-primary hover:bg-primary/95 text-white font-semibold transition-all active:scale-95 shadow-sm h-10 px-6 rounded-lg text-xs flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    New entry
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden relative flex flex-col bg-white dark:bg-background">
                            <DataTable
                                key={`${selectedDict}-${tableKey}`}
                                columns={columns}
                                data={items}
                                globalFilter={globalFilter}
                                onGlobalFilterChange={setGlobalFilter}
                                emptyStateText="No systemic records found in this dictionary."
                                onRowClick={handleEdit}
                                className="flex-1"
                                enableRowSelection={true}
                                isLoading={isLoading}
                                selectionActions={(selectedRows, clearSelection) => (
                                    <div className="flex items-center gap-2 w-full">
                                        <Button
                                            variant="ghost"
                                            className="h-9 px-4 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground dark:text-white/80 dark:hover:text-white transition-all"
                                            onClick={() => console.log("Exporting:", selectedRows)}
                                        >
                                            Export Data
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="h-9 px-4 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5 text-destructive hover:text-destructive dark:text-red-400 dark:hover:text-red-300 transition-all ml-auto"
                                            onClick={() => handleBulkDelete(selectedRows, clearSelection)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Forever
                                        </Button>
                                    </div>
                                )}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
                            onClick={async (e) => {
                                e.preventDefault();
                                await confirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-6"
                        >
                            {isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>{commonT("loading")}</span>
                                </div>
                            ) : (
                                commonT("confirm")
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {selectedDict && selectedDict !== 'plans_logic' && (
                <TagDrawer
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    table={selectedDict as TagTable}
                    tag={selectedItem}
                    onSuccess={loadItems}
                />
            )}
        </div>
    )
}
