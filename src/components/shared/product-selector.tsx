"use client"

import * as React from "react"
import { Check, Plus, Search, Loader2 } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
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
import { useDebounce } from "../../hooks/use-debounce"

interface ProductSelectorProps {
    onSelect: (product: any) => void
    placeholder?: string
    className?: string
}

export function ProductSelector({ onSelect, placeholder, className }: ProductSelectorProps) {
    const t = useTranslations("Meals")
    const commonT = useTranslations("Common")
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [products, setProducts] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)
    const locale = useLocale()
    const debouncedQuery = useDebounce(query, 300)

    React.useEffect(() => {
        async function fetchProducts() {
            setLoading(true)
            const data = await getProducts(debouncedQuery)
            setProducts(data)
            setLoading(false)
        }
        fetchProducts()
    }, [debouncedQuery])

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
            <PopoverContent className="w-[320px] p-0 shadow-2xl border-border/40 rounded-2xl backdrop-blur-xl bg-background/90" align="end">
                <Command shouldFilter={false} className="bg-transparent">
                    <CommandInput
                        placeholder={t("searchProduct")}
                        value={query}
                        onValueChange={setQuery}
                        className="h-10 text-xs border-none focus:ring-0"
                    />
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
                            {products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={product.id}
                                    onSelect={() => {
                                        onSelect(product)
                                        setOpen(false)
                                        setQuery("")
                                    }}
                                    className="text-xs py-2.5 px-3 flex items-center gap-3 group cursor-pointer rounded-xl hover:bg-primary/5 mb-1 last:mb-0 transition-all active:scale-[0.98]"
                                >
                                    <div className="h-10 w-10 rounded-lg bg-muted border border-border/40 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/20 transition-colors">
                                        {product.images?.[0]?.url ? (
                                            <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] font-semibold text-muted-foreground/30 italic">P</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-secondary dark:text-foreground/90 truncate leading-tight">
                                            {product.name?.[locale] || product.name?.en || product.name?.["pt-br"] || product.name?.["pt-pt"] || t("unnamedProduct")}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/50 font-medium tracking-tight mt-0.5">
                                            {product.kcal} kcal | P: {product.protein}g | C: {product.carbs}g | F: {product.fat}g
                                        </span>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
