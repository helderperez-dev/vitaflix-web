"use client"

import * as React from "react"
import { Check, Plus, Loader2, Image as ImageIcon } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { cn, getMediaUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { getProducts } from "@/app/actions/products"
import { getTags } from "@/app/actions/tags"
import { useDebounce } from "../../hooks/use-debounce"
import { Tag } from "@/shared-schemas/tag"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ProductSelectorProps {
    onSelect: (product: any) => void
    onMultiSelect?: (products: any[]) => void
    multiSelect?: boolean
    placeholder?: string
    className?: string
}

export function ProductSelector({ onSelect, onMultiSelect, multiSelect, placeholder, className }: ProductSelectorProps) {
    const t = useTranslations("Meals")
    const commonT = useTranslations("Common")
    const productsT = useTranslations("Products")
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [selectedGroup, setSelectedGroup] = React.useState<string | null>(null)
    const [products, setProducts] = React.useState<any[]>([])
    const [selectedProducts, setSelectedProducts] = React.useState<any[]>([])
    const [groups, setGroups] = React.useState<Tag[]>([])
    const [loading, setLoading] = React.useState(false)
    const locale = useLocale()
    const debouncedQuery = useDebounce(query, 300)

    React.useEffect(() => {
        if (!open) {
            setSelectedProducts([])
            setQuery("")
        }
    }, [open])

    React.useEffect(() => {
        async function fetchGroups() {
            const data = await getTags("product_groups")
            setGroups(data)
        }
        fetchGroups()
    }, [])

    React.useEffect(() => {
        async function fetchProducts() {
            setLoading(true)
            const data = await getProducts(debouncedQuery, selectedGroup || undefined)
            setProducts(data)
            setLoading(false)
        }
        fetchProducts()
    }, [debouncedQuery, selectedGroup])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-center gap-2", className)}
                >
                    <Plus className="h-3.5 w-3.5 opacity-50" />
                    {placeholder || t("selectProduct")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0 border-input rounded-lg backdrop-blur-xl bg-background/90" align="end">
                <Command shouldFilter={false} className="bg-transparent pt-3">
                    <CommandInput
                        placeholder={t("searchProduct")}
                        value={query}
                        onValueChange={setQuery}
                        className="h-10 text-xs border-none focus:ring-0"
                    />

                    <div className="px-3 pt-4 pb-2">
                        <Select
                            value={selectedGroup || "all"}
                            onValueChange={(val) => setSelectedGroup(val === "all" ? null : val)}
                        >
                            <SelectTrigger className="h-8 text-[10px] font-bold bg-muted/40 border-transparent hover:bg-muted/60 transition-colors rounded-lg shadow-none focus:ring-0">
                                <div className="flex items-center gap-2">
                                    <SelectValue placeholder={commonT("all")} />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-input">
                                <SelectItem value="all" className="text-xs font-semibold rounded-lg">{commonT("all")}</SelectItem>
                                {groups.map((group) => (
                                    <SelectItem
                                        key={group.id}
                                        value={group.id || ""}
                                        className="text-xs font-semibold rounded-lg"
                                    >
                                        {group.name?.[locale] || group.name?.en || group.name?.["pt-br"] || group.name?.["pt-pt"]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-px bg-border/20 mx-3 mb-2" />
                    <CommandList
                        className="max-h-[300px] overflow-y-auto custom-scrollbar"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                    >
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <p className="mt-2 text-[10px] font-semibold text-primary">{commonT("loading")}</p>
                            </div>
                        )}
                        {!loading && products.length === 0 && (
                            <CommandEmpty className="py-10 text-xs text-muted-foreground/40 font-semibold text-center">
                                {t("noProductFound")}
                            </CommandEmpty>
                        )}
                        <CommandGroup className="px-1.5 py-2">
                            {products.map((product) => {
                                const isSelected = selectedProducts.some(p => p.id === product.id)
                                const productUnit = product.measurement_unit?.slug || product.measurement_unit?.name?.[locale] || product.measurement_unit?.name?.en || "g"
                                const referenceAmount = product.reference_amount || 100
                                return (
                                    <CommandItem
                                        key={product.id}
                                        value={product.id}
                                        onSelect={() => {
                                            if (multiSelect) {
                                                if (isSelected) {
                                                    setSelectedProducts(selectedProducts.filter(p => p.id !== product.id))
                                                } else {
                                                    setSelectedProducts([...selectedProducts, product])
                                                }
                                            } else {
                                                onSelect(product)
                                                setOpen(false)
                                                setQuery("")
                                            }
                                        }}
                                        className={cn(
                                            "text-xs py-2.5 px-3 flex items-center gap-3 group cursor-pointer rounded-lg mb-1 last:mb-0 transition-all active:scale-[0.98]",
                                            isSelected ? "bg-primary/10" : "hover:bg-primary/5"
                                        )}
                                    >
                                        <div className="h-10 w-10 rounded-md overflow-hidden border border-border/40 flex-shrink-0 relative group bg-white">
                                            {product.images?.[0]?.url ? (
                                                <img src={getMediaUrl(product.images[0].url)} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <ImageIcon className="h-4 w-4 text-muted-foreground/35" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-secondary dark:text-foreground/90 truncate leading-tight">
                                                {product.name?.[locale] || product.name?.en || product.name?.["pt-br"] || product.name?.["pt-pt"] || t("unnamedProduct")}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/50 font-medium tracking-tight mt-0.5">
                                                {product.kcal} kcal/{`${referenceAmount}${productUnit}`} | P: {product.protein}g | C: {product.carbs}g | F: {product.fat}g
                                            </span>
                                        </div>
                                        <div className="ml-auto transition-all">
                                            {isSelected ? (
                                                <div className="bg-primary rounded-lg p-1 shadow-sm shadow-primary/20">
                                                    <Check className="h-2.5 w-2.5 text-white" />
                                                </div>
                                            ) : (
                                                <div className="h-1.5 w-1.5 rounded-lg bg-primary opacity-0 group-hover:opacity-100" />
                                            )}
                                        </div>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>

                    {multiSelect && (
                        <div className="p-3 border-t border-border/10">
                            <Button
                                className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50"
                                disabled={selectedProducts.length === 0}
                                onClick={() => {
                                    onMultiSelect?.(selectedProducts)
                                    setOpen(false)
                                }}
                            >
                                {commonT("done")} ({selectedProducts.length})
                            </Button>
                        </div>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    )
}
