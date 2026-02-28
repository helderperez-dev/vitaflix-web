"use client"

import * as React from "react"
import { Check, Plus, Settings2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { getBrands } from "@/app/actions/brands"
import { type Brand } from "@/shared-schemas/brand"
import { BrandModal } from "@/components/shared/brand-modal"
import { useLocale } from "next-intl"

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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">Associated Brands</h3>
                    <div className="h-px w-full bg-border/40" />
                </div>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="h-7 text-[9px] font-bold uppercase tracking-widest border-border/50 bg-transparent text-muted-foreground hover:bg-muted/5 gap-2"
                        >
                            <Plus className="h-3 w-3" />
                            Select Brands
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0" align="end">
                        <Command className="border-none shadow-none">
                            <CommandInput placeholder="Search brands..." className="h-9 text-xs" />
                            <CommandList>
                                <CommandEmpty className="py-4 text-[11px] text-muted-foreground text-center">
                                    No brands found.
                                </CommandEmpty>
                                <CommandGroup heading="Available Brands" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">
                                    {brands.map((brand) => (
                                        <CommandItem
                                            key={brand.id}
                                            onSelect={() => toggleBrand(brand.id!)}
                                            className="text-xs py-2 flex items-center justify-between group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-all",
                                                    selectedBrandIds.includes(brand.id!) ? "bg-primary text-primary-foreground" : "opacity-50"
                                                )}>
                                                    {selectedBrandIds.includes(brand.id!) && <Check className="h-3 w-3" />}
                                                </div>
                                                {brand.logoUrl && (
                                                    <div className="h-6 w-6 rounded-md overflow-hidden bg-muted border border-border/40 flex-shrink-0">
                                                        <img src={brand.logoUrl} alt="" className="h-full w-full object-cover" />
                                                    </div>
                                                )}
                                                <span className="font-medium text-secondary">
                                                    {brand.name?.[locale] || brand.name?.en}
                                                </span>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all hover:bg-muted/50"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingBrand(brand)
                                                    setBrandModalOpen(true)
                                                }}
                                            >
                                                <Settings2 className="h-3 w-3 text-muted-foreground" />
                                            </Button>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => {
                                            setEditingBrand(null)
                                            setBrandModalOpen(true)
                                            setOpen(false)
                                        }}
                                        className="text-xs py-2 text-primary font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Create New Brand
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex flex-wrap gap-2">
                {selectedBrands.length === 0 ? (
                    <div className="w-full py-8 border border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center bg-muted/5 group hover:bg-muted/10 transition-colors">
                        <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">No brands selected</p>
                    </div>
                ) : (
                    selectedBrands.map((brand) => (
                        <Badge
                            key={brand.id}
                            variant="secondary"
                            className="h-7 px-3 flex items-center gap-2 bg-muted/20 hover:bg-muted/30 text-secondary border-none transition-all rounded-full"
                        >
                            {brand.logoUrl && (
                                <div className="h-5 w-5 rounded-md overflow-hidden bg-muted border border-border/40 flex-shrink-0">
                                    <img src={brand.logoUrl} alt="" className="h-full w-full object-cover" />
                                </div>
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {brand.name?.[locale] || brand.name?.en}
                            </span>
                            <button
                                onClick={() => removeBrand(brand.id!)}
                                className="hover:text-destructive transition-colors p-0.5"
                            >
                                <X className="h-3 w-3" />
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
