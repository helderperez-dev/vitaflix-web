"use client"

import * as React from "react"
import { Trash2, Plus, Loader2, Maximize2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocale, useTranslations } from "next-intl"
import type { Product } from "@/shared-schemas/product"
import { updateUserPreferences } from "@/app/actions/users"
import { bulkUpdateProductStatus, bulkDeleteProducts } from "@/app/actions/products"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { useQueryState } from "nuqs"
import { ProductDrawer } from "./product-drawer"
import { ProductActions } from "./product-actions"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { ImageGalleryModal } from "@/components/shared/image-gallery-modal"
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
import { cn } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { MediaDisplay } from "@/components/shared/media-display"

interface ProductTableWrapperProps {
    initialProducts: ProductTableData[]
    userProfile?: {
        id?: string
        preferences?: Record<string, unknown>
    } | null
}

type LocalizedText = Record<string, string>

type ProductTableData = {
    id: string
    name?: LocalizedText
    kcal: number
    protein?: number | null
    carbs?: number | null
    fat?: number | null
    unit_id?: string | null
    reference_amount?: number | null
    images?: { url: string; isDefault?: boolean }[]
    is_public?: boolean | null
    measurement_unit?: { slug?: string | null; name?: LocalizedText } | null
    product_tags?: { tag_id: string; tags?: { name?: LocalizedText } | { name?: LocalizedText }[] }[]
    product_brands?: { brand_id: string; brands?: { name?: LocalizedText; logo_url?: string } | { name?: LocalizedText; logo_url?: string }[] }[]
    product_group_links?: { group_id: string }[]
    product_countries?: { country_id: string; countries?: { name?: LocalizedText } | { name?: LocalizedText }[] }[]
}

type ProductTableRow = ProductTableData & {
    mappedProduct: Product
    nameLocale: string
}

type SelectableRow = {
    id: string
    is_public?: boolean | number | null
}

function BulkStatusActions({ selectedRows, clearSelection }: { selectedRows: SelectableRow[], clearSelection: () => void }) {
    const commonT = useTranslations("Common")
    const productsT = useTranslations("Products")
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
        const result = await bulkUpdateProductStatus(ids, targetPublic)

        if (result.success) {
            toast.success(commonT("updatedSuccessfully"))
            clearSelection()
            setIsDirty(false)
        } else {
            toast.error(result.error || productsT("failedToUpdateProducts"))
        }
        setIsLoading(false)
    }

    return (
        <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center space-x-2">
                <Switch
                    id="bulk-public"
                    checked={targetPublic}
                    onCheckedChange={(val) => {
                        setTargetPublic(val)
                        setIsDirty(true)
                    }}
                />
                <Label htmlFor="bulk-public" className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                    {productsT("publicStatus")}
                </Label>
            </div>

            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                    >
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 text-[10px] font-bold rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all border-dashed"
                            onClick={handleApply}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                            {productsT("updateItems", { count: selectedRows.length })}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function ProductTableWrapper({ initialProducts, userProfile }: ProductTableWrapperProps) {
    const locale = useLocale()
    const t = useTranslations("Products")
    const commonT = useTranslations("Common")
    const [drawerOpen, setDrawerOpen] = React.useState(false)
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
    const [rowsToDelete, setRowsToDelete] = React.useState<SelectableRow[]>([])
    const [clearSelectionRef, setClearSelectionRef] = React.useState<{ fn: () => void } | null>(null)
    const [searchQuery, setSearchQuery] = useQueryState("search", { defaultValue: "" })
    const [idParam, setIdParam] = useQueryState("id")
    const [galleryImages, setGalleryImages] = React.useState<{ url: string; isDefault?: boolean }[] | null>(null)
    const [isGalleryOpen, setIsGalleryOpen] = React.useState(false)

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
                tagIds: p.product_tags?.map((pt) => pt.tag_id) || [],
                brandIds: p.product_brands?.map((pb) => pb.brand_id) || [],
                groupIds: p.product_group_links?.map((pg) => pg.group_id) || [],
                countryIds: p.product_countries?.map((pc) => pc.country_id) || [],
                unitId: p.unit_id || null,
                referenceAmount: p.reference_amount || 100,
                images: p.images || [],
                isPublic: p.is_public,
            } as Product,
            nameLocale: p.name?.[locale] || p.name?.en || "",
        }))
    }, [initialProducts, locale])

    const columns = React.useMemo<ColumnDef<ProductTableRow>[]>(() => [
        {
            accessorKey: "nameLocale",
            header: ({ column }) => <SortableHeader column={column} title={t("table.name")} />,
            cell: ({ row }) => {
                const product = row.original.mappedProduct
                const defaultImage = product.images?.find((img) => img.isDefault) || product.images?.[0]
                const hasImage = Boolean(defaultImage?.url)
                return (
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation()
                                if (hasImage) {
                                    setGalleryImages(product.images || [])
                                    setIsGalleryOpen(true)
                                }
                            }}
                            className={cn(
                                "h-10 w-10 rounded-md overflow-hidden border border-border/40 flex-shrink-0 relative group",
                                hasImage ? "bg-white cursor-pointer" : "bg-white cursor-default"
                            )}
                        >
                            {hasImage ? (
                                <>
                                    <MediaDisplay
                                        src={defaultImage!.url}
                                        alt="Product"
                                        className="transition-all group-hover:brightness-50"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Maximize2 className="h-4 w-4 text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground/35" />
                                </div>
                            )}
                        </motion.div>
                        <div className="font-medium truncate">{row.getValue("nameLocale")}</div>
                    </div>
                )
            },
            size: 260,
            enableHiding: false,
        },
        {
            id: "brand",
            header: ({ column }) => <SortableHeader column={column} title={t("brand")} />,
            sortingFn: (rowA, rowB) => {
                const getBrandName = (pb: NonNullable<ProductTableData["product_brands"]>[number] | undefined) => {
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
                        {brands.map((pb) => {
                            const brandData = Array.isArray(pb.brands) ? pb.brands[0] : pb.brands;
                            if (!brandData) return null;
                            return (
                                <div key={pb.brand_id} className="flex items-center gap-1.5">
                                    {brandData.logo_url && (
                                        <div className="h-6 w-6 rounded-md overflow-hidden bg-white border border-border/40 flex-shrink-0">
                                            <img src={brandData.logo_url} alt="brand" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                    <span className="text-xs font-semibold text-muted-foreground">{brandData.name?.[locale] || brandData.name?.en}</span>
                                </div>
                            );
                        })}
                        {brands.length === 0 && (
                            <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                    </div>
                )
            },
            size: 150,
        },
        {
            id: "unit",
            header: ({ column }) => <SortableHeader column={column} title={t("unit")} />,
            accessorFn: (row) => row.measurement_unit?.slug || row.measurement_unit?.name?.[locale] || row.measurement_unit?.name?.en || "",
            cell: ({ row }) => {
                const unit = row.original.measurement_unit
                const unitLabel = unit?.slug || unit?.name?.[locale] || unit?.name?.en
                return unitLabel ? (
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-semibold uppercase">
                        {unitLabel}
                    </Badge>
                ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                )
            },
            size: 90,
        },
        {
            accessorKey: "kcal",
            header: ({ column }) => <SortableHeader column={column} title={t("table.kcal")} />,
            cell: ({ row }) => <div>{row.getValue("kcal")} kcal</div>,
            size: 100,
        },
        {
            accessorKey: "protein",
            header: ({ column }) => <SortableHeader column={column} title={t("table.p")} />,
            cell: ({ row }) => <div>{row.getValue("protein")}g</div>,
            size: 80
        },
        {
            accessorKey: "carbs",
            header: ({ column }) => <SortableHeader column={column} title={t("table.c")} />,
            cell: ({ row }) => <div>{row.getValue("carbs")}g</div>,
            size: 80
        },
        {
            accessorKey: "fat",
            header: ({ column }) => <SortableHeader column={column} title={t("table.f")} />,
            cell: ({ row }) => <div>{row.getValue("fat")}g</div>,
            size: 80
        },
        {
            id: "countries",
            header: ({ column }) => <SortableHeader column={column} title={t("countries")} />,
            accessorFn: (row) => row.product_countries?.length || 0,
            cell: ({ row }) => {
                const countryLinks = row.original.product_countries || []
                if (countryLinks.length === 0) {
                    return <span className="text-xs font-medium text-muted-foreground/70">{t("global")}</span>
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {countryLinks.map((link) => {
                            const countryData = Array.isArray(link.countries) ? link.countries[0] : link.countries
                            const label = countryData?.name?.[locale] || countryData?.name?.en
                            if (!label) return null
                            return (
                                <Badge key={link.country_id} variant="secondary" className="text-[10px] h-5 px-1.5 font-semibold">
                                    {label}
                                </Badge>
                            )
                        })}
                    </div>
                )
            },
            size: 180,
        },
        {
            id: "tags",
            header: ({ column }) => <SortableHeader column={column} title={t("tags")} />,
            sortingFn: (rowA, rowB) => {
                const numA = rowA.original.product_tags?.length || 0;
                const numB = rowB.original.product_tags?.length || 0;
                return numA - numB;
            },
            cell: ({ row }) => {
                const tags = row.original.product_tags || []
                return (
                    <div className="flex flex-wrap gap-1">
                        {tags.map((pt) => {
                            const tagData = Array.isArray(pt.tags) ? pt.tags[0] : pt.tags;
                            if (!tagData) return null;
                            return (
                                <Badge key={pt.tag_id} variant="secondary" className="text-[10px] h-5 px-1.5 font-semibold">
                                    {tagData.name?.[locale] || tagData.name?.en}
                                </Badge>
                            );
                        })}
                        {tags.length === 0 && (
                            <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                    </div>
                )
            },
            size: 150,
        },
        {
            accessorKey: "is_public",
            header: ({ column }) => <SortableHeader column={column} title={t("table.status")} />,
            cell: ({ row }) => (
                <Badge variant={row.getValue("is_public") ? "default" : "outline"} className="capitalize">
                    {row.getValue("is_public") ? commonT("public") : commonT("private")}
                </Badge>
            ),
            size: 100,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <ProductActions
                        product={row.original.mappedProduct}
                        onEdit={() => {
                            setSelectedProduct(row.original.mappedProduct)
                            setDrawerOpen(true)
                        }}
                    />
                </div>
            ),
            size: 50,
            enableResizing: false,
            enableHiding: false,
        },
    ], [commonT, locale, t])

    const handlePreferencesChange = React.useCallback((newPrefs: Record<string, unknown>) => {
        if (!userProfile?.id) return
        const fullPrefs = {
            ...userProfile.preferences,
            productTable: newPrefs
        }
        updateUserPreferences(userProfile.id, fullPrefs)
    }, [userProfile?.id, userProfile?.preferences])

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

                <Button onClick={() => { setSelectedProduct(null); setDrawerOpen(true); }} className="bg-primary hover:bg-primary/95 text-white font-semibold transition-all active:scale-95 shadow-sm shadow-primary/5 h-10 px-6 text-xs flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t("addProduct")}
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={data}
                globalFilter={searchQuery}
                onGlobalFilterChange={setSearchQuery}
                className="flex-1"
                enableRowSelection={true}
                initialPreferences={(userProfile?.preferences as { productTable?: { columnVisibility?: Record<string, boolean>; columnSizing?: Record<string, number> } } | undefined)?.productTable}
                onPreferencesChange={handlePreferencesChange}
                onRowClick={(row) => {
                    setSelectedProduct(row.mappedProduct)
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
                            {commonT("delete")} ({selectedRows.length})
                        </Button>
                    </div>
                )}
                emptyStateText={t("noProducts")}
            />

            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent className="rounded-lg border-sidebar-border/50 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteProductsTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteProductsDescription", { count: rowsToDelete.length })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="font-semibold text-xs h-9">
                            {commonT("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                try {
                                    const ids = rowsToDelete.map(r => r.id)
                                    const result = await bulkDeleteProducts(ids)

                                    if (result.success) {
                                        toast.success(commonT("deletedSuccessfully"))
                                        clearSelectionRef?.fn()
                                    } else {
                                        toast.error(result.error || t("failedToDeleteProducts"))
                                    }
                                } finally {
                                    setDeleteModalOpen(false)
                                }
                            }}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-6"
                        >
                            {t("confirmDeletion")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ProductDrawer
                open={drawerOpen}
                onOpenChange={(open) => {
                    setDrawerOpen(open);
                    if (!open) {
                        setSelectedProduct(null);
                        setIdParam(null);
                    }
                }}
                product={selectedProduct}
            />

            <ImageGalleryModal
                open={isGalleryOpen}
                onOpenChange={setIsGalleryOpen}
                images={galleryImages || []}
            />
        </div>
    )
}
