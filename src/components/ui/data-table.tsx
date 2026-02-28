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
    ArrowUpDown
} from "lucide-react"
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
            className="-ml-4 h-8 text-xs font-bold uppercase tracking-wider text-muted-foreground/70 group/sort hover:bg-transparent"
        >
            {title}
            <div className="ml-2 w-4 flex items-center justify-center">
                {isSorted === "asc" ? (
                    <ArrowUp className="h-3.5 w-3.5 text-primary" />
                ) : isSorted === "desc" ? (
                    <ArrowDown className="h-3.5 w-3.5 text-primary" />
                ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover/sort:opacity-100 transition-opacity" />
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
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialPreferences?.columnVisibility || {})
    const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(initialPreferences?.columnSizing || {})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            columnSizing,
            rowSelection,
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

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm shadow-black/5 flex flex-col">
                <div className="w-full flex-1 overflow-auto">
                    <Table className="table-fixed">
                        <TableHeader className="bg-muted/30">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/50">
                                    {headerGroup.headers.map((header, index) => {
                                        const isLast = index === headerGroup.headers.length - 1
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    "h-11 text-xs font-bold uppercase tracking-wider text-muted-foreground/70 relative group/head",
                                                    header.index === 0 && "pl-6",
                                                    isLast && "pr-6"
                                                )}
                                                style={{
                                                    width: header.getSize()
                                                }}
                                            >
                                                <div className={cn("flex items-center gap-2", isLast && "justify-end")}>
                                                    <div className="flex-1">
                                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </div>

                                                    {isLast && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                                                                >
                                                                    <Settings2 className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-[200px]">
                                                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">Toggle Columns</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {table
                                                                    .getAllColumns()
                                                                    .filter((column) => column.getCanHide())
                                                                    .map((column) => {
                                                                        return (
                                                                            <DropdownMenuCheckboxItem
                                                                                key={column.id}
                                                                                className="capitalize text-xs font-medium"
                                                                                checked={column.getIsVisible()}
                                                                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                                            >
                                                                                {column.id.replace("_", " ")}
                                                                            </DropdownMenuCheckboxItem>
                                                                        )
                                                                    })}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>

                                                {header.column.getCanResize() && (
                                                    <div
                                                        onMouseDown={header.getResizeHandler()}
                                                        onTouchStart={header.getResizeHandler()}
                                                        className={cn(
                                                            "absolute right-0 top-0 h-full w-6 z-10 cursor-col-resize translate-x-1/2 hover:bg-primary/5 transition-all flex items-center justify-center group/resize",
                                                            header.column.getIsResizing() ? "opacity-100" : "opacity-0 group-hover/head:opacity-100"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "h-5 w-[2px] rounded-full transition-colors",
                                                            header.column.getIsResizing() ? "bg-primary scale-x-150" : "bg-muted-foreground/20 group-hover/resize:bg-muted-foreground/40"
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
                                            "hover:bg-muted/30 border-border/40 transition-colors",
                                            onRowClick && "cursor-pointer"
                                        )}
                                        onClick={() => onRowClick?.(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell, index) => {
                                            const isLast = index === row.getVisibleCells().length - 1
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        "py-3",
                                                        index === 0 ? "pl-6" : "pl-4",
                                                        isLast && "pr-6"
                                                    )}
                                                >
                                                    <div className={cn(isLast && "flex justify-end")}>
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
                <div className="border-t border-border/50 bg-muted/20 px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
                            {footerContent || `${table.getFilteredRowModel().rows.length} Total Items`}
                        </div>
                        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
                        <div className="hidden sm:flex items-center gap-3">
                            <Select
                                value={table.getState().pagination.pageSize.toString()}
                                onValueChange={(value) => table.setPageSize(Number(value))}
                            >
                                <SelectTrigger className="h-7 min-w-[70px] px-2 text-[10px] font-bold bg-transparent border-border/40 hover:bg-muted/50 transition-colors">
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
                            Page <span className="text-primary">{table.getState().pagination.pageIndex + 1}</span> of {table.getPageCount() || 1}
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                            <Button
                                variant="outline"
                                className="h-7 w-7 p-0 border-border/40 bg-transparent hover:bg-primary/5 hover:text-primary transition-all rounded-md disabled:opacity-30"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-7 w-7 p-0 border-border/40 bg-transparent hover:bg-primary/5 hover:text-primary transition-all rounded-md disabled:opacity-30"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
