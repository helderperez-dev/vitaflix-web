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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

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
    /** Optional: Footer left side content (e.g., "Total Items") */
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
            className="flex items-center gap-1.5 h-8 text-[11px] font-bold uppercase tracking-wide text-muted-foreground group/sort hover:bg-transparent px-0 transition-colors"
        >
            <span className="truncate">{title}</span>
            <div className={cn(
                "flex items-center justify-center transition-opacity",
                isSorted ? "opacity-100" : "opacity-0 group-hover/sort:opacity-100"
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
    emptyStateText = "No results found.",
    footerContent,
    onRowClick,
    enableRowSelection = false,
    onSelectedRowsChange,
    selectionActions,
    globalFilter,
    onGlobalFilterChange,
    className,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialPreferences?.columnVisibility || {})
    const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(initialPreferences?.columnSizing || {})
    const [rowSelection, setRowSelection] = React.useState({})
    const [localGlobalFilter, setLocalGlobalFilter] = React.useState(globalFilter || "")

    // Sync global filter from props
    React.useEffect(() => {
        if (globalFilter !== undefined) {
            setLocalGlobalFilter(globalFilter)
        }
    }, [globalFilter])

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
                    aria-label="Select all"
                    className="translate-y-[1px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[1px]"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
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
                .join(" ")

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

    // Emit selection changes
    React.useEffect(() => {
        if (onSelectedRowsChange) {
            onSelectedRowsChange(selectedRowsData)
        }
    }, [selectedRowsData, onSelectedRowsChange])

    return (
        <div className={cn("flex flex-col min-h-0", className)}>
            <div className="bg-card overflow-hidden flex flex-col flex-1">
                <div className="w-full flex-1 overflow-x-hidden overflow-y-auto relative custom-scrollbar">
                    <Table className="w-full border-separate border-spacing-0">
                        <TableHeader className="sticky top-0 z-20 transition-colors">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                    {headerGroup.headers.map((header, index) => {
                                        const isFirst = index === 0
                                        const isLast = index === headerGroup.headers.length - 1

                                        let responsiveClass = ""
                                        if (!isFirst && !isLast) {
                                            // More forgiving hiding logic:
                                            // Col 1 & 2 are almost always visible (sm+)
                                            // Col 3 visible on md+
                                            // Col 4 visible on lg+
                                            // The rest on xl+
                                            if (index === 1 || index === 2) responsiveClass = "hidden sm:table-cell"
                                            else if (index === 3) responsiveClass = "hidden md:table-cell"
                                            else if (index === 4) responsiveClass = "hidden lg:table-cell"
                                            else responsiveClass = "hidden xl:table-cell"
                                        }

                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    "h-10 text-[11px] font-bold uppercase tracking-wide text-muted-foreground transition-all border-b border-border/40 relative group/head bg-muted/40 dark:bg-white/5",
                                                    !isLast && "border-r border-border/40",
                                                    responsiveClass,
                                                    isFirst && "pl-8 sticky left-0 z-30",
                                                    isLast && "pr-8 sticky right-0 z-30"
                                                )}
                                                style={{ width: header.getSize() }}
                                            >
                                                <div className={cn("flex items-center gap-2", isLast && "justify-end")}>
                                                    <div className="flex-1 min-w-0">
                                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </div>

                                                    {isLast && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground/40 hover:text-primary transition-colors" // Removed -mr-2
                                                                >
                                                                    <Settings2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-2xl border-sidebar-border/50 p-1.5 animate-in slide-in-from-top-1">
                                                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70 px-2 py-1.5">Display Columns</DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="bg-border/30" />
                                                                <div className="max-h-[300px] overflow-auto py-1">
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
                                                                                {column.id.replace("_", " ")}
                                                                            </DropdownMenuCheckboxItem>
                                                                        ))}
                                                                </div>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
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
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className={cn(
                                            "border-b border-border/20 transition-colors group/row",
                                            onRowClick && "cursor-pointer"
                                        )}
                                        onClick={() => onRowClick?.(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell, index) => {
                                            const isFirst = index === 0
                                            const isLast = index === row.getVisibleCells().length - 1

                                            let responsiveClass = ""
                                            if (!isFirst && !isLast) {
                                                if (index === 1 || index === 2) responsiveClass = "hidden sm:table-cell"
                                                else if (index === 3) responsiveClass = "hidden md:table-cell"
                                                else if (index === 4) responsiveClass = "hidden lg:table-cell"
                                                else responsiveClass = "hidden xl:table-cell"
                                            }

                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        "py-4 border-b border-border/20 bg-card group-hover/row:bg-muted/30 transition-all",
                                                        row.getIsSelected() && "bg-primary/5 group-hover/row:bg-primary/[0.08]",
                                                        responsiveClass,
                                                        isFirst && "pl-8 sticky left-0 z-10",
                                                        isLast && "pr-8 sticky right-0 z-10"
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
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground italic truncate">
                                        {emptyStateText}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Integrated Pagination Footer */}
                <div className="border-t border-border/50 bg-muted/20 px-8 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
                            {footerContent || (
                                <>
                                    {table.getFilteredRowModel().rows.length} {table.getFilteredRowModel().rows.length === 1 ? "Item" : "Items"}
                                </>
                            )}
                        </div>
                        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
                        <div className="hidden sm:flex items-center gap-3">
                            <Select
                                value={table.getState().pagination.pageSize.toString()}
                                onValueChange={(value) => table.setPageSize(Number(value))}
                            >
                                <SelectTrigger className="h-7 min-w-[70px] px-2 text-[10px] font-bold bg-transparent border-border/40 hover:bg-muted/50 shadow-none transition-colors">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top" className="min-w-[65px]">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem
                                            key={pageSize}
                                            value={pageSize.toString()}
                                            className="text-[10px] font-bold"
                                        >
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap min-w-[80px] text-right">
                            {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
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
                        className="fixed bottom-10 left-1/2 z-50 flex items-center gap-6 px-6 py-3 bg-white/90 dark:bg-slate-900/95 text-foreground dark:text-white rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-white/10 backdrop-blur-xl min-w-[400px]"
                    >
                        <div className="flex items-center gap-3 border-r border-slate-200 dark:border-white/10 pr-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => table.resetRowSelection()}
                                className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold tracking-tight">
                                    {Object.keys(rowSelection).length} {Object.keys(rowSelection).length === 1 ? 'item' : 'items'} selected
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground dark:text-white/40 font-bold">Bulk Actions</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                            {selectionActions ? (
                                selectionActions(selectedRowsData, () => table.resetRowSelection())
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="h-9 px-4 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground dark:text-white/80 dark:hover:text-white transition-all"
                                        onClick={() => console.log("Exporting:", selectedRowsData)}
                                    >
                                        Export Data
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="h-9 px-4 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground dark:text-white/80 dark:hover:text-white transition-all ml-auto"
                                        onClick={() => console.log("Deleting:", selectedRowsData)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Forever
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
