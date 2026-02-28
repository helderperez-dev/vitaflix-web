"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "next-intl"
import type { Product } from "@/shared-schemas/product"
import type { UserProfile } from "@/shared-schemas/user"
import { updateUserPreferences } from "@/app/actions/users"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { ProductDrawer } from "./product-drawer"
import { ProductActions } from "./product-actions"
import type { ColumnDef } from "@tanstack/react-table"

interface ProductTableWrapperProps {
    initialProducts: any[]
    userProfile?: any
}

export function ProductTableWrapper({ initialProducts, userProfile }: ProductTableWrapperProps) {
    const locale = useLocale()
    const [drawerOpen, setDrawerOpen] = React.useState(false)
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

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
            header: ({ column }) => <SortableHeader column={column} title="Name" />,
            cell: ({ row }) => {
                const product = row.original.mappedProduct
                const defaultImage = product.images?.find((img: any) => img.isDefault) || product.images?.[0]
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted border border-border/40 flex-shrink-0">
                            <img
                                src={defaultImage ? defaultImage.url : "/product_placeholder.png"}
                                alt="Product"
                                className="w-full h-full object-cover transition-all"
                            />
                        </div>
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
        <div className="space-y-6">
            <div className="flex flex-col gap-2 relative">
                <h1 className="text-3xl font-bold tracking-tight text-secondary">Products</h1>
                <p className="text-muted-foreground text-sm">
                    Manage nutritional ingredients and products available in the application.
                </p>
                <div className="absolute right-0 top-0">
                    <Button onClick={() => { setSelectedProduct(null); setDrawerOpen(true); }} className="bg-primary hover:bg-primary/90 text-white font-bold transition-all active:scale-95 shadow-sm shadow-primary/20 h-9 px-6 rounded-lg uppercase tracking-widest text-[10px]">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={data}
                initialPreferences={userProfile?.preferences?.productTable}
                onPreferencesChange={handlePreferencesChange}
                onRowClick={(row) => {
                    setSelectedProduct(row.mappedProduct)
                    setDrawerOpen(true)
                }}
                emptyStateText="No products found."
            />

            <ProductDrawer
                open={drawerOpen}
                onOpenChange={(open) => { setDrawerOpen(open); if (!open) setSelectedProduct(null); }}
                product={selectedProduct}
            />
        </div>
    )
}
