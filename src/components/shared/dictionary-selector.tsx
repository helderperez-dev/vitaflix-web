"use client"

import * as React from "react"
import { Plus, Settings2, Check, Loader2, ChevronDown } from "lucide-react"
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
import { getTags, type TagTable } from "@/app/actions/tags"
import { type Tag } from "@/shared-schemas/tag"
import { TagModal } from "@/components/shared/tag-modal"
import { useLocale, useTranslations } from "next-intl"

interface DictionarySelectorProps {
    value: string
    onChange: (value: string) => void
    table: TagTable
    placeholder?: string
    label?: string
    allowCreation?: boolean
    returnIdOnly?: boolean
}

export function DictionarySelector({
    value,
    onChange,
    table,
    placeholder,
    label,
    allowCreation = true,
    returnIdOnly = false
}: DictionarySelectorProps) {
    const locale = useLocale()
    const t = useTranslations("Common")
    const [mounted, setMounted] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [items, setItems] = React.useState<Tag[]>([])
    const [loading, setLoading] = React.useState(true)
    const [modalOpen, setModalOpen] = React.useState(false)
    const [editingItem, setEditingItem] = React.useState<Tag | null>(null)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const fetchItems = React.useCallback(async () => {
        setLoading(true)
        const data = await getTags(table)
        setItems(data || [])
        setLoading(false)
    }, [table])

    React.useEffect(() => {
        if (mounted) fetchItems()
    }, [fetchItems, mounted])

    if (!mounted) return (
        <div className="space-y-2">
            {label && <label className="text-xs font-semibold text-muted-foreground/70 px-1">{label}</label>}
            <Button
                variant="outline"
                className="w-full justify-between h-12 px-4 text-sm font-medium border-border/40 bg-muted/5 rounded-xl gap-2 opacity-50"
                disabled
            >
                <span className="truncate text-muted-foreground/50">{placeholder || t("select")}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </div>
    )

    const selectedItem = items.find((item) => returnIdOnly ? item.id === value : (item.slug === value || item.id === value))
    const displayValue = selectedItem?.name?.[locale] || selectedItem?.name?.en || value || placeholder || t("select")

    const handleSelect = (item: Tag) => {
        onChange(returnIdOnly ? item.id! : (item.slug || item.id!))
        setOpen(false)
    }

    return (
        <div className="space-y-2">
            {label && <label className="text-xs font-semibold text-muted-foreground/70 px-1">{label}</label>}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-12 px-4 text-sm font-medium border-border/40 bg-muted/5 hover:bg-background transition-all rounded-xl gap-2 group"
                    >
                        <span className={cn("truncate", !value && "text-muted-foreground/50")}>
                            {displayValue}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 shadow-2xl border-border/40 rounded-2xl backdrop-blur-xl bg-background/90" align="start">
                    <Command className="bg-transparent border-none">
                        <CommandInput placeholder={t("search")} className="h-10 text-xs" />
                        <CommandList className="max-h-[240px] overflow-y-auto custom-scrollbar">
                            <CommandEmpty className="py-6 text-xs text-muted-foreground/40 text-center">
                                {t("noResults")}
                            </CommandEmpty>
                            <CommandGroup heading={placeholder || t("availableOptions")} className="text-[11px] font-semibold text-muted-foreground/40 px-2 py-4">
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        onSelect={() => handleSelect(item)}
                                        className="text-xs py-3 px-3 flex items-center justify-between group cursor-pointer rounded-lg hover:bg-primary/5 mb-1 last:mb-0 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "size-4 rounded-full border border-primary/20 flex items-center justify-center transition-colors",
                                                (returnIdOnly ? item.id === value : (item.slug === value || item.id === value)) ? "bg-primary border-primary" : "bg-transparent"
                                            )}>
                                                {(returnIdOnly ? item.id === value : (item.slug === value || item.id === value)) && <Check className="h-2.5 w-2.5 text-white" />}
                                            </div>
                                            <span className="font-medium text-secondary dark:text-foreground/90">
                                                {item.name?.[locale] || item.name?.en}
                                            </span>
                                        </div>

                                        {allowCreation && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all hover:bg-muted/50 rounded-full"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingItem(item)
                                                    setModalOpen(true)
                                                }}
                                            >
                                                <Settings2 className="h-3.5 w-3.5 text-muted-foreground/50" />
                                            </Button>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                        {allowCreation && (
                            <>
                                <CommandSeparator className="bg-border/40" />
                                <div className="p-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setEditingItem(null)
                                            setModalOpen(true)
                                            setOpen(false)
                                        }}
                                        className="w-full justify-start text-xs py-2.5 px-3 text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors h-auto gap-2"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        {t("addNew")}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Command>
                </PopoverContent>
            </Popover>

            <TagModal
                open={modalOpen}
                tag={editingItem}
                table={table}
                onOpenChange={setModalOpen}
                onSuccess={() => {
                    fetchItems()
                    setModalOpen(false)
                }}
            />
        </div>
    )
}
