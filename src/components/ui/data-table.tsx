"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    ColumnSizingState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Settings2,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Trash2,
    X,
    Search,
    ListFilter,
    Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

// --- Global Types ---

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    /** Unique key for saving preferences (e.g., 'productTable') */
    preferenceKey?: string
    /** Initial preferences from user profile */
    initialPreferences?: {
        columnVisibility?: VisibilityState
        columnSizing?: ColumnSizingState
    }
    /** Callback for when preferences change */
    onPreferencesChange?: (prefs: {
        columnVisibility: VisibilityState
        columnSizing: ColumnSizingState
    }) => void
    /** Optional: Text for the empty state */
    emptyStateText?: string
    /** Optional: Footer left side content (e.g.,"Total Items") */
    footerContent?: React.ReactNode
    /** Optional: Callback for row click */
    onRowClick?: (row: TData) => void
    /** Optional: Enable row selection checkboxes */
    enableRowSelection?: boolean
    /** Optional: Callback when selection changes */
    onSelectedRowsChange?: (rows: TData[]) => void
    /** Optional: Custom actions to show when rows are selected */
    selectionActions?: (selectedRows: TData[], clearSelection: () => void) => React.ReactNode
    /** Optional: Global filter string for the table */
    globalFilter?: string
    /** Optional: Callback when global filter changes */
    onGlobalFilterChange?: (value: string) => void
    /** Optional: Show a loading spinner overlay */
    isLoading?: boolean
    className?: string
}

// --- Global Sortable Header Component ---

interface SortableHeaderProps {
    column: any
    title: string
}

export function SortableHeader({ column, title }: SortableHeaderProps) {
    const isSorted = column.getIsSorted()
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="flex items-center gap-1.5 h-8 text-xs font-semibold text-muted-foreground group/sort hover:bg-transparent px-0 transition-colors"
        >
            <span className="truncate">{title}</span>
            <div className={cn(
                "flex items-center justify-center transition-opacity",
                isSorted ? "opacity-100" : "opacity-0 group-sort:opacity-100"
            )}>
                {isSorted === "asc" ? (
                    <ArrowUp className="h-3 w-3 text-primary" />
                ) : isSorted === "desc" ? (
                    <ArrowDown className="h-3 w-3 text-primary" />
                ) : (
                    <ArrowUpDown className="h-3 w-3 group-hover/sort:text-primary transition-colors" />
                )}
            </div>
        </Button>
    )
}

// --- Main Generic DataTable Component ---

export function DataTable<TData, TValue>({
    columns,
    data,
    preferenceKey,
    initialPreferences,
    onPreferencesChange,
    emptyStateText,
    footerContent,
    onRowClick,
    enableRowSelection = false,
    onSelectedRowsChange,
    selectionActions,
    globalFilter,
    onGlobalFilterChange,
    isLoading = false,
    className,
}: DataTableProps<TData, TValue>) {
    const t = useTranslations("Common")
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialPreferences?.columnVisibility || {})
    const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(initialPreferences?.columnSizing || {})
    const [rowSelection, setRowSelection] = React.useState({})
    const [localGlobalFilter, setLocalGlobalFilter] = React.useState(globalFilter || "")
    const tableContainerRef = React.useRef<HTMLDivElement>(null)
    const [tableContainerWidth, setTableContainerWidth] = React.useState(0)

    // Sync global filter from props
    React.useEffect(() => {
        if (globalFilter !== undefined) {
            setLocalGlobalFilter(globalFilter)
        }
    }, [globalFilter])

    React.useEffect(() => {
        const element = tableContainerRef.current
        if (!element) return

        const updateWidth = () => {
            setTableContainerWidth(element.clientWidth)
        }

        updateWidth()

        const observer = new ResizeObserver(() => {
            updateWidth()
        })

        observer.observe(element)

        return () => observer.disconnect()
    }, [])

    const allColumns = React.useMemo(() => {
        if (!enableRowSelection) return columns

        const selectionColumn: ColumnDef<TData, TValue> = {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label={t("selectAll")}
                    className="translate-y-[1px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={t("selectRow")}
                    className="translate-y-[1px]"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 60,
        }

        return [selectionColumn, ...columns]
    }, [columns, enableRowSelection])

    const table = useReactTable({
        data,
        columns: allColumns,
        columnResizeMode: "onChange",
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onColumnSizingChange: setColumnSizing,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: (updater) => {
            const nextFilter = typeof updater === "function" ? updater(localGlobalFilter) : updater;
            setLocalGlobalFilter(nextFilter as string)
            onGlobalFilterChange?.(nextFilter as string)
        },
        globalFilterFn: (row, columnId, filterValue) => {
            const value = filterValue.toLowerCase().trim()
            if (!value) return true

            // Split search terms by space and filter out empty strings
            const terms = value.split(/\s+/).filter(Boolean)
            if (terms.length === 0) return true

            // Get all searchable content from the row
            // We focus on visible columns that have data
            const rowValue = row.getAllCells()
                .map(cell => {
                    const val = cell.getValue()
                    if (typeof val === 'string' || typeof val === 'number') return String(val).toLowerCase()
                    // Handle complex objects if they have a 'name' or 'label'
                    if (val && typeof val === 'object') {
                        // Check common locale structures like { en: '...', pt: '...' }
                        return JSON.stringify(val).toLowerCase()
                    }
                    return ""
                })
                .join("")

            // AND logic: all terms must match
            return terms.every((term: string) => rowValue.includes(term))
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            columnSizing,
            rowSelection,
            globalFilter: localGlobalFilter,
        },
        initialState: {
            pagination: { pageSize: 10 },
        },
    })

    // Persist preferences logic
    const isFirstRender = React.useRef(true)
    const lastSavedPrefs = React.useRef(JSON.stringify({ columnVisibility, columnSizing }))

    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const currentPrefsStr = JSON.stringify({ columnVisibility, columnSizing })
        if (currentPrefsStr === lastSavedPrefs.current) return

        const timer = setTimeout(() => {
            onPreferencesChange?.({ columnVisibility, columnSizing })
            lastSavedPrefs.current = currentPrefsStr
        }, 1000)

        return () => clearTimeout(timer)
    }, [columnVisibility, columnSizing, onPreferencesChange])

    const selectedRowsData = React.useMemo(() => {
        return table.getFilteredSelectedRowModel().rows.map(row => row.original)
    }, [rowSelection, table])

    const getResponsiveVisibilityClass = React.useCallback((index: number, totalColumns: number) => {
        const isFirst = index === 0
        const isLast = index === totalColumns - 1
        const isPenultimate = index === totalColumns - 2

        if (isFirst || isPenultimate || isLast || tableContainerWidth <= 0) {
            return ""
        }

        const hideableMiddleColumns = Math.max(totalColumns - 3, 0)
        if (hideableMiddleColumns === 0) {
            return ""
        }

        const reservedWidth = 440
        const minMiddleColumnWidth = 130
        const availableMiddleWidth = Math.max(tableContainerWidth - reservedWidth, 0)
        const maxVisibleMiddleColumns = Math.floor(availableMiddleWidth / minMiddleColumnWidth)
        const visibleMiddleColumns = Math.max(0, Math.min(hideableMiddleColumns, maxVisibleMiddleColumns))
        const middlePosition = index

        return middlePosition > visibleMiddleColumns ? "hidden" : ""
    }, [tableContainerWidth])

    // Emit selection changes
    React.useEffect(() => {
        if (onSelectedRowsChange) {
            onSelectedRowsChange(selectedRowsData)
        }
    }, [selectedRowsData, onSelectedRowsChange])

    return (
        <div className={cn("flex flex-col min-h-0", className)}>
            <div className="bg-card overflow-hidden flex flex-col flex-1">
                <div ref={tableContainerRef} className="w-full flex-1 overflow-x-hidden overflow-y-auto relative custom-scrollbar">
                    <Table className="w-full border-separate border-spacing-0">
                        <TableHeader className="sticky top-0 z-30 transition-colors bg-white dark:bg-background">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                    {headerGroup.headers.map((header, index) => {
                                        const isFirst = index === 0
                                        const isLast = index === headerGroup.headers.length - 1

                                        const responsiveClass = getResponsiveVisibilityClass(index, headerGroup.headers.length)

                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    "sticky top-0 z-30 h-10 text-xs font-semibold text-muted-foreground transition-all border-b border-border/40 relative group/head bg-white dark:bg-background whitespace-nowrap",
                                                    !isFirst && !isLast && "px-4",
                                                    responsiveClass,
                                                    !isLast && "border-r border-border/40",
                                                    isFirst && "pl-8 pr-6 sticky left-0 z-40 bg-white dark:bg-background",
                                                    isLast && "px-4 pr-8 sticky right-0 z-40 bg-white dark:bg-background border-l border-border/40"
                                                )}
                                                style={{ width: header.getSize() }}
                                            >
                                                <div className={cn("flex items-center gap-2", isLast && "justify-end")}>
                                                    <div className="flex-1 min-w-0">
                                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </div>

                                                    {isLast && (
                                                        <div className="flex items-center justify-end gap-1">
                                                            {onGlobalFilterChange !== undefined && (
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className={cn("h-7 w-7 transition-colors", localGlobalFilter ? "text-primary bg-primary/5" : "text-muted-foreground/40 hover:text-primary")}
                                                                        >
                                                                            <ListFilter className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent align="end" className="w-[300px] rounded-lg shadow-2xl border-sidebar-border/50 p-0 animate-in slide-in-from-top-1 overflow-hidden">
                                                                        <div className="p-3 border-b border-border/40 bg-slate-50/30 dark:bg-white/5">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <span className="text-[11px] font-semibold text-foreground/70 capitalize tracking-wider">{t("searchAndFilter")}</span>
                                                                                {localGlobalFilter && (
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        className="h-5 px-2 text-[10px] text-muted-foreground hover:text-foreground shadow-none"
                                                                                        onClick={() => { setLocalGlobalFilter(""); onGlobalFilterChange?.(""); }}
                                                                                    >
                                                                                        {t("clearAll")}
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                            <div className="relative flex items-center">
                                                                                <Search className="absolute left-3 size-4 text-muted-foreground/50" />
                                                                                <Input
                                                                                    placeholder={t("typeKeywordsToFilter")}
                                                                                    value={localGlobalFilter}
                                                                                    onChange={(e) => {
                                                                                        setLocalGlobalFilter(e.target.value);
                                                                                        onGlobalFilterChange?.(e.target.value);
                                                                                    }}
                                                                                    className="h-10 pl-9 w-full text-xs font-medium rounded-lg border-border/40 bg-white dark:bg-background focus-visible:ring-primary/20 transition-all shadow-none"
                                                                                    autoFocus
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="p-3 bg-white dark:bg-background">
                                                                            <span className="text-[10px] font-semibold text-muted-foreground/50 capitalize tracking-wider mb-2 block">
                                                                                {localGlobalFilter.trim().split(/\s+/).filter(Boolean).length > 0 ? t("activeFilterTags") : t("filterTags")}
                                                                            </span>
                                                                            {localGlobalFilter.trim().split(/\s+/).filter(Boolean).length > 0 ? (
                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                    {localGlobalFilter.trim().split(/\s+/).filter(Boolean).map((term, idx) => (
                                                                                        <Badge
                                                                                            key={idx}
                                                                                            variant="secondary"
                                                                                            className="text-[10px] h-6 px-2 font-semibold flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 transition-colors"
                                                                                        >
                                                                                            {term}
                                                                                            <span
                                                                                                className="cursor-pointer ml-0.5 opacity-70 hover:opacity-100 flex items-center justify-center p-0.5 rounded-lg hover:bg-primary/20 transition-colors"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    const terms = localGlobalFilter.trim().split(/\s+/).filter(Boolean);
                                                                                                    const newTerms = terms.filter((_, i) => i !== idx);
                                                                                                    const newFilter = newTerms.join(' ');
                                                                                                    setLocalGlobalFilter(newFilter);
                                                                                                    onGlobalFilterChange?.(newFilter);
                                                                                                }}
                                                                                            >
                                                                                                <X className="h-3 w-3" />
                                                                                            </span>
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-[11px] font-medium text-muted-foreground/60 text-center py-2 h-6 flex items-center justify-center">
                                                                                    {t("typeAboveToCreateFilterTags")}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            )}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-muted-foreground/40 hover:text-primary transition-colors"
                                                                    >
                                                                        <Settings2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-[200px] rounded-lg shadow-2xl border-sidebar-border/50 p-1.5 animate-in slide-in-from-top-1">
                                                                    <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground/70 px-2 py-1.5">{t("displayColumns")}</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator className="bg-border/30" />
                                                                    <div className="max-h-[300px] overflow-auto py-1 custom-scrollbar">
                                                                        {table
                                                                            .getAllColumns()
                                                                            .filter((column) => column.getCanHide())
                                                                            .map((column) => (
                                                                                <DropdownMenuCheckboxItem
                                                                                    key={column.id}
                                                                                    className="capitalize text-[11px] font-medium rounded-lg cursor-pointer mx-1 mb-1 focus:bg-primary/5 focus:text-primary"
                                                                                    checked={column.getIsVisible()}
                                                                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                                                >
                                                                                    {column.id.replace("_", "")}
                                                                                </DropdownMenuCheckboxItem>
                                                                            ))}
                                                                    </div>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Resizer */}
                                                {header.column.getCanResize() && (
                                                    <div
                                                        onMouseDown={header.getResizeHandler()}
                                                        onTouchStart={header.getResizeHandler()}
                                                        className={cn(
                                                            "absolute right-[-2px] top-0 h-full w-[4px] cursor-col-resize select-none touch-none z-40 group/resizer transition-opacity",
                                                            header.column.getIsResizing() ? "opacity-100" : "opacity-0 hover:opacity-100"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-[1.5px] h-full mx-auto transition-colors",
                                                            header.column.getIsResizing() ? "bg-primary" : "bg-primary/60"
                                                        )} />
                                                    </div>
                                                )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row, rowIndex) => (
                                    <TableRow
                                        key={row.id}
                                        className={cn(
                                            "border-b border-border/20 transition-colors group/row",
                                            onRowClick && "cursor-pointer",
                                            rowIndex % 2 === 0 ? "bg-white dark:bg-background" : "bg-slate-50/40 dark:bg-white/5"
                                        )}
                                        onClick={() => onRowClick?.(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell, index) => {
                                            const isFirst = index === 0
                                            const isLast = index === row.getVisibleCells().length - 1

                                            const responsiveClass = getResponsiveVisibilityClass(index, row.getVisibleCells().length)

                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        "h-14 py-4 transition-all border-b border-border/40 text-[13px] text-foreground/70 relative group transition-colors",
                                                        !isFirst && !isLast && "px-4",
                                                        rowIndex % 2 === 0 ? "bg-white dark:bg-background" : "bg-slate-50/40 dark:bg-white/5",
                                                        row.getIsSelected() && "!bg-primary/5 group-hover/row:!bg-primary/[0.08]",
                                                        responsiveClass,
                                                        (isFirst || isLast) && "z-10 sticky",
                                                        isFirst && "pl-8 pr-6 left-0",
                                                        isLast && "px-4 pr-8 right-0",
                                                    )}
                                                >
                                                    <div className={cn("truncate", isLast && "flex justify-end")}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </div>
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={allColumns.length} className="h-24 text-center text-muted-foreground truncate">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span className="text-xs font-medium text-muted-foreground/60">{t("loading")}</span>
                                            </div>
                                        ) : (
                                            (emptyStateText || t("noResults"))
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Integrated Pagination Footer */}
                <div className="border-t border-border/50 bg-muted/20 px-8 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="text-xs font-semibold text-muted-foreground/40 whitespace-nowrap">
                            {footerContent || (
                                <>
                                    {table.getFilteredRowModel().rows.length} {table.getFilteredRowModel().rows.length === 1 ? t("item") : t("items")}
                                </>
                            )}
                        </div>
                        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
                        <div className="hidden sm:flex items-center gap-3">
                            <Select
                                value={table.getState().pagination.pageSize.toString()}
                                onValueChange={(value) => table.setPageSize(Number(value))}
                            >
                                <SelectTrigger className="h-8 min-w-[70px] px-2 text-[11px] font-semibold bg-transparent border-border/40 hover:bg-muted/50 shadow-none transition-colors rounded-lg">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top" className="min-w-[75px] rounded-lg">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem
                                            key={pageSize}
                                            value={pageSize.toString()}
                                            className="text-[11px] font-semibold rounded-lg"
                                        >
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-xs font-semibold text-muted-foreground/40 whitespace-nowrap min-w-[80px] text-right">
                            {table.getState().pagination.pageIndex + 1} {t("of")} {table.getPageCount() || 1}
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                            <Button
                                variant="outline"
                                className="h-7 w-7 p-0 border-border/40 bg-transparent hover:bg-primary/5 hover:text-primary transition-all rounded-md disabled:opacity-30 shadow-none"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-7 w-7 p-0 border-border/40 bg-transparent hover:bg-primary/5 hover:text-primary transition-all rounded-md disabled:opacity-30 shadow-none"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Selection Bar */}
            <AnimatePresence>
                {Object.keys(rowSelection).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className="fixed bottom-10 left-1/2 z-50 flex items-center gap-6 px-6 py-3 bg-white/95 dark:bg-slate-900/95 text-foreground dark:text-white rounded-lg shadow-none border border-border/40 backdrop-blur-xl min-w-[400px]"
                    >
                        <div className="flex items-center gap-3 border-r border-slate-200 dark:border-white/10 pr-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => table.resetRowSelection()}
                                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold tracking-tight">
                                    {Object.keys(rowSelection).length} {Object.keys(rowSelection).length === 1 ? t("item") : t("items")} {t("selected")}
                                </span>
                                <span className="text-[11px] text-muted-foreground dark:text-white/40 font-semibold">{t("bulkActions")}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                            {selectionActions ? (
                                selectionActions(selectedRowsData, () => table.resetRowSelection())
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="h-9 px-4 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground dark:text-white/80 dark:hover:text-white transition-all"
                                        onClick={() => console.log("Exporting:", selectedRowsData)}
                                    >
                                        {t("exportData")}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="h-9 px-4 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground dark:text-white/80 dark:hover:text-white transition-all ml-auto"
                                        onClick={() => console.log("Deleting:", selectedRowsData)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t("deleteForever")}
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
