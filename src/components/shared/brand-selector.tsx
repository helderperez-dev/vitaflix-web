"use client"

import * as React from"react"
import { Plus, Settings2, X, Loader2 } from"lucide-react"
import { Checkbox } from"@/components/ui/checkbox"
import { cn } from"@/lib/utils"
import { Button } from"@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from"@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from"@/components/ui/popover"
import { Badge } from"@/components/ui/badge"
import { getBrands } from"@/app/actions/brands"
import { type Brand } from"@/shared-schemas/brand"
import { BrandModal } from"@/components/shared/brand-modal"
import { useLocale } from"next-intl"

interface BrandSelectorProps {
    selectedBrandIds: string[]
    onBrandsChange: (brandIds: string[]) => void
}

export function BrandSelector({ selectedBrandIds, onBrandsChange }: BrandSelectorProps) {
    const locale = useLocale()
    const [open, setOpen] = React.useState(false)
    const [brands, setBrands] = React.useState<Brand[]>([])
    const [loading, setLoading] = React.useState(true)
    const [brandModalOpen, setBrandModalOpen] = React.useState(false)
    const [editingBrand, setEditingBrand] = React.useState<Brand | null>(null)

    const fetchBrands = React.useCallback(async () => {
        const data = await getBrands()
        setBrands(data || [])
        setLoading(false)
    }, [])

    React.useEffect(() => {
        fetchBrands()
    }, [fetchBrands])

    const selectedBrands = brands.filter((brand) => selectedBrandIds.includes(brand.id!))

    const toggleBrand = (brandId: string) => {
        if (selectedBrandIds.includes(brandId)) {
            onBrandsChange(selectedBrandIds.filter((id) => id !== brandId))
        } else {
            onBrandsChange([...selectedBrandIds, brandId])
        }
    }

    const removeBrand = (brandId: string) => {
        onBrandsChange(selectedBrandIds.filter((id) => id !== brandId))
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin"/>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">Associated Brands</h3>
                    <div className="h-px w-full bg-border/60"/>
                </div>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="h-8 w-auto min-w-[140px] justify-start px-4 text-xs font-semibold border-border/50 bg-transparent text-muted-foreground hover:bg-muted/5 gap-2 rounded-xl transition-all"
                        >
                            <Plus className="h-3 w-3"/>
                            Select Brands
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0 shadow-2xl border-border/40 rounded-2xl backdrop-blur-xl bg-background/90"align="end">
                        <Command className="bg-transparent border-none">
                            <CommandInput placeholder="Search brands..."className="h-10 text-xs"/>
                            <CommandList
                                className="max-h-[200px] overflow-y-auto custom-scrollbar"
                                onWheel={(e) => e.stopPropagation()}
                                onTouchMove={(e) => e.stopPropagation()}
                            >
                                <CommandEmpty className="py-6 text-xs text-muted-foreground/40 text-center">
                                    No brands found.
                                </CommandEmpty>
                                <CommandGroup heading="Available Brands"className="text-[11px] font-semibold text-muted-foreground/40 px-2 py-4">
                                    {brands.map((brand) => (
                                        <CommandItem
                                            key={brand.id}
                                            onSelect={() => toggleBrand(brand.id!)}
                                            className="text-xs py-2.5 px-3 flex items-center justify-between group cursor-pointer rounded-lg hover:bg-primary/5 mb-1 last:mb-0 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedBrandIds.includes(brand.id!)}
                                                    className="pointer-events-none translate-y-[1px]"
                                                />
                                                {brand.logoUrl && (
                                                    <div className="h-6 w-6 rounded-md overflow-hidden bg-muted border border-border/40 flex-shrink-0">
                                                        <img src={brand.logoUrl} alt=""className="h-full w-full object-cover"/>
                                                    </div>
                                                )}
                                                <span className="font-medium text-secondary dark:text-foreground/90">
                                                    {brand.name?.[locale] || brand.name?.en}
                                                </span>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all hover:bg-muted/50 rounded-full"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingBrand(brand)
                                                    setBrandModalOpen(true)
                                                }}
                                            >
                                                <Settings2 className="h-3.5 w-3.5 text-muted-foreground/50"/>
                                            </Button>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                            <CommandSeparator className="bg-border/40"/>
                            <div className="p-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setEditingBrand(null)
                                        setBrandModalOpen(true)
                                        setOpen(false)
                                    }}
                                    className="w-full justify-start text-xs py-2.5 px-3 text-primary font-semibold flex items-center gap-2 rounded-lg hover:bg-primary/5 transition-colors h-auto"
                                >
                                    <Plus className="h-4 w-4"/>
                                    Create New Brand
                                </Button>
                            </div>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex flex-wrap gap-2">
                {selectedBrands.length === 0 ? (
                    <div className="w-full py-8 border-2 border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center bg-muted/5 group hover:border-primary/20 transition-all duration-500">
                        <p className="text-xs font-semibold text-muted-foreground/30">No brands selected</p>
                    </div>
                ) : (
                    selectedBrands.map((brand) => (
                        <Badge
                            key={brand.id}
                            variant="secondary"
                            className="h-8 px-4 flex items-center gap-3 bg-muted/20 hover:bg-muted/30 text-secondary dark:text-foreground/80 border-none transition-all rounded-xl"
                        >
                            {brand.logoUrl && (
                                <div className="h-5 w-5 rounded-md overflow-hidden bg-muted border border-border/40 flex-shrink-0">
                                    <img src={brand.logoUrl} alt=""className="h-full w-full object-cover"/>
                                </div>
                            )}
                            <span className="text-xs font-semibold">
                                {brand.name?.[locale] || brand.name?.en}
                            </span>
                            <button
                                onClick={() => removeBrand(brand.id!)}
                                className="hover:text-destructive transition-colors p-1"
                            >
                                <X className="h-3 w-3"/>
                            </button>
                        </Badge>
                    ))
                )}
            </div>

            <BrandModal
                open={brandModalOpen}
                brand={editingBrand}
                onOpenChange={setBrandModalOpen}
                onSuccess={() => {
                    fetchBrands()
                    setBrandModalOpen(false)
                }}
            />
        </div>
    )
}
