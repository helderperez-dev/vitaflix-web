"use client"

import * as React from "react"
import { Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocale, useTranslations } from "next-intl"
import type { Product } from "@/shared-schemas/product"
import type { UserProfile } from "@/shared-schemas/user"
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
import { Loader2, Maximize2 } from "lucide-react"
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
    initialProducts: any[]
    userProfile?: any
}

function BulkStatusActions({ selectedRows, clearSelection }: { selectedRows: any[], clearSelection: () => void }) {
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
        const result = await bulkUpdateProductStatus(ids, targetPublic)

        if (result.success) {
            toast.success(`Successfully updated ${ids.length} items`)
            clearSelection()
            setIsDirty(false)
        } else {
            toast.error(result.error || "Failed to update items")
        }
        setIsLoading(false)
    }

    return (
        <div className="flex items-center ml-auto">
            <div className={cn(
                "flex items-center gap-0 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-all overflow-hidden",
                isDirty && "border-primary/30 ring-1 ring-primary/10"
            )}>
                <div className="flex items-center gap-3 px-3 py-1.5 border-r border-slate-200 dark:border-white/10">
                    <span className={cn(
                        "text-[10px] font-semibold tracking-wide transition-colors w-14 text-center select-none",
                        targetPublic ? "text-primary" : "text-muted-foreground"
                    )}>
                        {targetPublic ? "Public" : "Private"}
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

export function ProductTableWrapper({ initialProducts, userProfile }: ProductTableWrapperProps) {
    const locale = useLocale()
    const t = useTranslations("Products")
    const commonT = useTranslations("Common")
    const [drawerOpen, setDrawerOpen] = React.useState(false)
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
    const [rowsToDelete, setRowsToDelete] = React.useState<any[]>([])
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
                tagIds: p.product_tags?.map((pt: any) => pt.tag_id) || [],
                brandIds: p.product_brands?.map((pb: any) => pb.brand_id) || [],
                images: p.images || [],
                isPublic: p.is_public,
            } as Product,
            nameLocale: p.name?.[locale] || p.name?.en || "",
        }))
    }, [initialProducts, locale])


    const columns = React.useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: "nameLocale",
            header: ({ column }) => <SortableHeader column={column} title={t("table.name")} />,
            cell: ({ row }) => {
                const product = row.original.mappedProduct
                const defaultImage = product.images?.find((img: any) => img.isDefault) || product.images?.[0]
                return (
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation()
                                setGalleryImages(product.images || [])
                                setIsGalleryOpen(true)
                            }}
                            className="h-10 w-10 rounded-md overflow-hidden bg-muted border border-border/40 flex-shrink-0 relative group cursor-pointer"
                        >
                            <MediaDisplay
                                src={defaultImage ? defaultImage.url : "/product_placeholder.png"}
                                alt="Product"
                                className="transition-all group-hover:brightness-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="h-4 w-4 text-white" />
                            </div>
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
            header: ({ column }) => <SortableHeader column={column} title="Brand" />,
            sortingFn: (rowA, rowB) => {
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
                                    <span className="text-xs font-semibold text-muted-foreground">{brandData.name?.[locale] || brandData.name?.en}</span>
                                </div>
                            );
                        })}
                        {brands.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">No Brand</span>
                        )}
                    </div>
                )
            },
            size: 150,
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
                                <Badge key={pt.tag_id} variant="secondary" className="text-[10px] h-5 px-1.5 font-semibold">
                                    {tagData.name?.[locale] || tagData.name?.en}
                                </Badge>
                            );
                        })}
                        {tags.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">None</span>
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
                    {row.getValue("is_public") ? "Public" : "Private"}
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
    ], [locale])

    const handlePreferencesChange = React.useCallback((newPrefs: any) => {
        if (!userProfile?.id) return
        const fullPrefs = {
            ...userProfile.preferences,
            productTable: newPrefs
        }
        updateUserPreferences(userProfile.id, fullPrefs)
    }, [userProfile.id, userProfile.preferences])

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                {/* Premium Background Accent */}
                <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-white pointer-events-none" />


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
                    onClick={() => { setSelectedProduct(null); setDrawerOpen(true); }}
                    className="bg-primary hover:bg-primary/95 text-white font-semibold transition-all active:scale-95 shadow-sm h-10 px-6 rounded-xl text-xs flex items-center gap-2"
                >
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
                initialPreferences={userProfile?.preferences?.productTable}
                onPreferencesChange={handlePreferencesChange}
                onRowClick={(row) => {
                    setSelectedProduct(row.mappedProduct)
                    setDrawerOpen(true)
                }}
                onSelectedRowsChange={(rows) => {
                    // console.log("Selected rows:", rows)
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
                emptyStateText={t("noProducts")}
            />

            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent className="rounded-2xl border-sidebar-border/50 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {rowsToDelete.length} {rowsToDelete.length === 1 ? 'product' : 'products'}.
                            This action cannot be undone and will remove all associated nutritional data.
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
                                    const result = await bulkDeleteProducts(ids)

                                    if (result.success) {
                                        toast.success(`Deleted ${ids.length} products`)
                                        clearSelectionRef?.fn()
                                    } else {
                                        toast.error(result.error || "Failed to delete products")
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
