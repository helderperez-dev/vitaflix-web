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
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
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
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2, Check, ArrowUp, ArrowDown } from "lucide-react"
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
import { cn } from "@/lib/utils"

import { ProductDrawer } from "./product-drawer"
import { ProductActions } from "./product-actions"
import { useLocale } from "next-intl"
import type { Product } from "@/shared-schemas/product"
import type { UserProfile } from "@/shared-schemas/user"
import { updateUserPreferences } from "@/app/actions/users"

interface SortableHeaderProps {
    column: any
    title: string
}

function SortableHeader({ column, title }: SortableHeaderProps) {
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

interface ProductTableWrapperProps {
    initialProducts: any[]
    userProfile?: any
}

export function ProductTableWrapper({ initialProducts, userProfile }: ProductTableWrapperProps) {
    const locale = useLocale()
    const [drawerOpen, setDrawerOpen] = React.useState(false)
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    // Initialize state from user preferences
    const initialVisibility = userProfile?.preferences?.productTable?.columnVisibility || {}
    const initialSizing = userProfile?.preferences?.productTable?.columnSizing || {}

    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialVisibility)
    const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(initialSizing)
    const [rowSelection, setRowSelection] = React.useState({})

    // Save preferences to DB when they change
    const isFirstRender = React.useRef(true)
    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        if (!userProfile?.id) return

        const timer = setTimeout(() => {
            const newPrefs = {
                ...userProfile.preferences,
                productTable: {
                    columnVisibility,
                    columnSizing,
                }
            }
            updateUserPreferences(userProfile.id, newPrefs)
        }, 1000)

        return () => clearTimeout(timer)
    }, [columnVisibility, columnSizing, userProfile])

    // Map initial data to our Product type structure
    const data = React.useMemo(() => {
        return initialProducts.map((p) => ({
            ...p,
            mappedProduct: {
                id: p.id,
                name: p.name,
                kcal: p.kcal,
                protein: p.protein,
                carbs: p.carbs,
                fat: p.fat,
                slug: p.slug,
                tagIds: p.product_tags?.map((pt: any) => pt.tag_id) || [],
                brandIds: p.product_brands?.map((pb: any) => pb.brand_id) || [],
                images: p.images || [],
                isPublic: p.is_public,
            } as Product,
            nameEn: p.name?.en || "",
            nameLocale: p.name?.[locale] || p.name?.en || "",
        }))
    }, [initialProducts, locale])

    const columns = React.useMemo<ColumnDef<any>[]>(() => [
        {
            id: "image",
            header: "",
            cell: ({ row }) => {
                const product = row.original.mappedProduct
                const defaultImage = product.images?.find((img: any) => img.isDefault) || product.images?.[0]
                return (
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted border">
                        <img
                            src={defaultImage ? defaultImage.url : "/product_placeholder.png"}
                            alt="Product"
                            className="w-full h-full object-cover transition-all"
                        />
                    </div>
                )
            },
            size: 60,
            enableResizing: false,
        },
        {
            accessorKey: "nameLocale",
            header: ({ column }) => <SortableHeader column={column} title="Name" />,
            cell: ({ row }) => <div className="font-medium">{row.getValue("nameLocale")}</div>,
            size: 200,
        },
        {
            id: "brand",
            header: ({ column }) => <SortableHeader column={column} title="Brand" />,
            sortingFn: (rowA, rowB, columnId) => {
                const getBrandName = (pb: any) => {
                    const brandData = Array.isArray(pb?.brands) ? pb.brands[0] : pb?.brands;
                    return (brandData?.name?.[locale] || brandData?.name?.en || "").toLowerCase();
                }
                const bA = rowA.original.product_brands?.[0];
                const bB = rowB.original.product_brands?.[0];
                return getBrandName(bA).localeCompare(getBrandName(bB));
            },
            cell: ({ row }) => {
                const brands = row.original.product_brands || []
                return (
                    <div className="flex flex-col gap-1">
                        {brands.map((pb: any) => {
                            const brandData = Array.isArray(pb.brands) ? pb.brands[0] : pb.brands;
                            if (!brandData) return null;
                            return (
                                <div key={pb.brand_id} className="flex items-center gap-1.5">
                                    {brandData.logo_url && (
                                        <div className="h-6 w-6 rounded-md overflow-hidden bg-muted border border-border/40 flex-shrink-0">
                                            <img src={brandData.logo_url} alt="brand" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                    <span className="text-xs font-bold text-muted-foreground uppercase">{brandData.name?.[locale] || brandData.name?.en}</span>
                                </div>
                            );
                        })}
                        {brands.length === 0 && (
                            <span className="text-[10px] text-muted-foreground italic uppercase">No Brand</span>
                        )}
                    </div>
                )
            },
            size: 150,
        },
        {
            accessorKey: "kcal",
            header: ({ column }) => <SortableHeader column={column} title="Kcal" />,
            cell: ({ row }) => <div>{row.getValue("kcal")} kcal</div>,
            size: 100,
        },
        {
            accessorKey: "protein",
            header: ({ column }) => <SortableHeader column={column} title="Protein" />,
            cell: ({ row }) => <div>{row.getValue("protein")}g</div>,
            size: 80
        },
        {
            accessorKey: "carbs",
            header: ({ column }) => <SortableHeader column={column} title="Carbs" />,
            cell: ({ row }) => <div>{row.getValue("carbs")}g</div>,
            size: 80
        },
        {
            accessorKey: "fat",
            header: ({ column }) => <SortableHeader column={column} title="Fat" />,
            cell: ({ row }) => <div>{row.getValue("fat")}g</div>,
            size: 80
        },
        {
            id: "tags",
            header: ({ column }) => <SortableHeader column={column} title="Tags" />,
            sortingFn: (rowA, rowB) => {
                const numA = rowA.original.product_tags?.length || 0;
                const numB = rowB.original.product_tags?.length || 0;
                return numA - numB;
            },
            cell: ({ row }) => {
                const tags = row.original.product_tags || []
                return (
                    <div className="flex flex-wrap gap-1">
                        {tags.map((pt: any) => {
                            const tagData = Array.isArray(pt.tags) ? pt.tags[0] : pt.tags;
                            if (!tagData) return null;
                            return (
                                <Badge key={pt.tag_id} variant="secondary" className="text-[10px] uppercase h-5 px-1.5 font-bold tracking-wider">
                                    {tagData.name?.[locale] || tagData.name?.en}
                                </Badge>
                            );
                        })}
                        {tags.length === 0 && (
                            <span className="text-[10px] text-muted-foreground italic uppercase">None</span>
                        )}
                    </div>
                )
            },
            size: 150,
        },
        {
            accessorKey: "is_public",
            header: ({ column }) => <SortableHeader column={column} title="Status" />,
            cell: ({ row }) => (
                <Badge variant={row.getValue("is_public") ? "default" : "outline"} className="capitalize">
                    {row.getValue("is_public") ? "Public" : "Private"}
                </Badge>
            ),
            size: 100,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <ProductActions
                    product={row.original.mappedProduct}
                    onEdit={() => {
                        setSelectedProduct(row.original.mappedProduct)
                        setDrawerOpen(true)
                    }}
                />
            ),
            size: 50,
            enableResizing: false,
        },
    ], [locale])

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 relative">
                <h1 className="text-3xl font-bold tracking-tight text-secondary">Products</h1>
                <p className="text-muted-foreground text-sm">
                    Manage nutritional ingredients and products available in the application.
                </p>
                <div className="absolute right-0 top-0 flex gap-2">
                    {/* Column Visibility Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-9 px-3 border-border/60 hover:bg-muted/40 text-muted-foreground">
                                <Settings2 className="h-4 w-4 mr-2" />
                                Columns
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
                                            {column.id === "nameLocale" ? "Name" : column.id.replace("_", " ")}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button onClick={() => { setSelectedProduct(null); setDrawerOpen(true); }} className="bg-primary hover:bg-primary/90 text-white font-bold transition-all active:scale-95 shadow-sm shadow-primary/20 h-9 px-6 rounded-lg uppercase tracking-widest text-[10px]">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm shadow-black/5">
                <div className="w-full">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/50">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                "h-11 text-xs font-bold uppercase tracking-wider text-muted-foreground/70 relative group/head",
                                                header.id === "nameLocale" && "pl-0"
                                            )}
                                            style={{
                                                width: header.column.getIsResizing() ? header.getSize() : (header.column.columnDef.size || 'auto')
                                            }}
                                        >
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}

                                            {header.column.getCanResize() && (
                                                <div
                                                    onMouseDown={header.getResizeHandler()}
                                                    onTouchStart={header.getResizeHandler()}
                                                    className={cn(
                                                        "absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-primary/5 transition-all flex items-center justify-center",
                                                        header.column.getIsResizing() ? "opacity-100" : "opacity-0 group-hover/head:opacity-100"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "h-5 w-[2px] rounded-full transition-colors",
                                                        header.column.getIsResizing() ? "bg-primary scale-x-150" : "bg-muted-foreground/20"
                                                    )} />
                                                </div>
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="hover:bg-muted/30 border-border/40 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className={cn("py-3", cell.column.id === "nameLocale" && "pl-0")}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground italic truncate">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    {table.getFilteredRowModel().rows.length} Total Ingredients
                </div>
                <div className="flex items-center gap-6 lg:gap-8">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Rows per page</p>
                        <Select
                            value={table.getState().pagination.pageSize.toString()}
                            onValueChange={(value) => table.setPageSize(Number(value))}
                        >
                            <SelectTrigger className="h-8 w-16 text-[10px] font-bold">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
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
                    <div className="flex w-[100px] items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 text-center whitespace-nowrap">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex border-border/60 hover:bg-muted/40" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><span className="sr-only">Go to first page</span><ChevronsLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0 border-border/60 hover:bg-muted/40" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><span className="sr-only">Go to previous page</span><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0 border-border/60 hover:bg-muted/40" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><span className="sr-only">Go to next page</span><ChevronRight className="h-4 w-4" /></Button>
                        <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex border-border/60 hover:bg-muted/40" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><span className="sr-only">Go to last page</span><ChevronsRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>

            <ProductDrawer open={drawerOpen} onOpenChange={(open) => { setDrawerOpen(open); if (!open) setSelectedProduct(null); }} product={selectedProduct} />
        </div>
    )
}
