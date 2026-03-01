"use client"

import * as React from "react"
import { Search, Loader2, X, Apple, Utensils, Users, Tag, Store, type LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePathname } from "@/i18n/routing"
import { useLocale } from "next-intl"
import { useDebounce } from "use-debounce"
import { globalSearch, type SearchResult } from "@/app/actions/search"

import { cn } from "@/lib/utils"

const sectionConfig: Record<string, { label: string; icon: LucideIcon }> = {
    product: { label: "Products", icon: Apple },
    recipe: { label: "Recipes", icon: Utensils },
    user: { label: "Users", icon: Users },
    brand: { label: "Brands", icon: Store },
    tag: { label: "Tags", icon: Tag },
}

export function GlobalSearch() {
    const router = useRouter()
    const pathname = usePathname()
    const locale = useLocale()
    const inputRef = React.useRef<HTMLInputElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const scrollContainerRef = React.useRef<HTMLDivElement>(null)
    const [query, setQuery] = React.useState("")
    const [debouncedQuery] = useDebounce(query, 300)
    const [results, setResults] = React.useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(-1)
    const [selectedItems, setSelectedItems] = React.useState<SearchResult[]>([])

    // Track the pathname that was active when items were selected
    const selectionPathRef = React.useRef<string | null>(null)

    // Flatten results for keyboard navigation
    const flatResults = React.useMemo(() => results, [results])

    const isOpen = isFocused && query.trim().length >= 2

    // ⌘K shortcut
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    // Click-outside to close dropdown (but keep tags)
    React.useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsFocused(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Clear selected items when navigating manually to a different page
    React.useEffect(() => {
        if (selectionPathRef.current && pathname !== selectionPathRef.current) {
            setSelectedItems([])
            selectionPathRef.current = null
        }
    }, [pathname])

    // Scroll tags to end when a item is selected
    React.useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
        }
    }, [selectedItems])

    // Fetch results on debounced query change
    React.useEffect(() => {
        let isMounted = true
        async function fetchResults() {
            if (debouncedQuery.trim().length < 2) {
                setResults([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const searchResults = await globalSearch(debouncedQuery)
                if (!isMounted) return

                // Filter out already-selected items
                const filtered = searchResults.filter(
                    (r) => !selectedItems.some((s) => s.id === r.id && s.type === r.type)
                )

                // Batch updates to avoid unnecessary intermediate renders
                React.startTransition(() => {
                    setResults(filtered)
                    setIsLoading(false)
                })
            } catch (error) {
                console.error(error)
                if (isMounted) setIsLoading(false)
            }
        }

        fetchResults()
        return () => { isMounted = false }
    }, [debouncedQuery, selectedItems])

    // Reset selected index when results change
    React.useEffect(() => {
        setSelectedIndex(-1)
    }, [results])

    // Sync URL search param to tags on mount or manual navigation
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const searchVal = params.get("search")

        // If we have a URL search but no visual tags, try to reconstruct them
        if (searchVal && selectedItems.length === 0) {
            const terms = searchVal.split(/\s+/).filter(Boolean)
            const reconstructed = terms.map(t => ({
                id: `url-${t}`,
                type: 'product',
                title: t,
                url: `${pathname}?search=${encodeURIComponent(t)}`
            } as SearchResult))
            setSelectedItems(reconstructed)
            selectionPathRef.current = pathname
        }
    }, [pathname])

    // Live sync input query to URL if on a compatible page
    React.useEffect(() => {
        // Skip sync if we're in the middle of a category transition
        // or if the current tags don't belong to this page
        if (selectionPathRef.current && pathname !== selectionPathRef.current) return

        const supportedPaths = ["/products", "/recipes", "/users"]
        const isSupported = supportedPaths.some(p => pathname.endsWith(p))
        if (!isSupported) return

        const currentParams = new URLSearchParams(window.location.search)
        const oldSearch = currentParams.get("search") || ""

        const tagTerms = selectedItems
            .filter(s => ["product", "recipe", "user"].includes(s.type))
            .map(s => s.title)

        const allTerms = [...tagTerms]
        if (debouncedQuery.trim()) allTerms.push(debouncedQuery.trim())

        const newSearch = allTerms.join(" ")

        if (newSearch !== oldSearch) {
            if (newSearch) {
                currentParams.set("search", newSearch)
            } else {
                currentParams.delete("search")
            }
            const searchStr = currentParams.toString()
            router.replace(`${pathname}${searchStr ? `?${searchStr}` : ""}`, { scroll: false })
        }
    }, [debouncedQuery, selectedItems, pathname, router])

    function handleSelect(item: SearchResult) {
        const itemUrl = new URL(item.url, "http://dummy")
        const basePath = itemUrl.pathname

        // Use the current pathname to detect if we need a screen jump
        const isChangingCategory = pathname !== basePath

        const newSelected = isChangingCategory ? [item] : [...selectedItems, item]

        // Construct final URL params from all selected items
        const finalParams = new URLSearchParams()

        const searchTerms = newSelected
            .filter(s => ["product", "recipe", "user"].includes(s.type))
            .map(s => s.title)

        if (searchTerms.length > 0) {
            finalParams.set("search", searchTerms.join(" "))
        }

        newSelected.forEach(s => {
            if (["brand", "tag"].includes(s.type)) {
                const sUrl = new URL(s.url, "http://dummy")
                sUrl.searchParams.forEach((v, k) => finalParams.set(k, v))
            }
        })

        // Update selectionPathRef BEFORE setting state to ensure the sync effect
        // can detect the transition and avoid overwriting the URL
        selectionPathRef.current = basePath
        setSelectedItems(newSelected)

        setIsFocused(false)
        setQuery("")
        setResults([])

        const searchStr = finalParams.toString()
        router.push(`/${locale}${basePath}${searchStr ? `?${searchStr}` : ""}`)
    }

    function handleRemoveTag(item: SearchResult) {
        const remainingItems = selectedItems.filter((s) => !(s.id === item.id && s.type === item.type))
        const itemUrl = new URL(item.url, "http://dummy")
        const basePath = itemUrl.pathname

        // Update ref before state to avoid effect race
        selectionPathRef.current = remainingItems.length > 0 ? basePath : null
        setSelectedItems(remainingItems)

        if (remainingItems.length === 0) {
            router.push(`/${locale}${basePath}`)
        } else {
            const finalParams = new URLSearchParams()

            const searchTerms = remainingItems
                .filter(s => ["product", "recipe", "user"].includes(s.type))
                .map(s => s.title)

            if (searchTerms.length > 0) {
                finalParams.set("search", searchTerms.join(" "))
            }

            remainingItems.forEach(s => {
                if (["brand", "tag"].includes(s.type)) {
                    const sUrl = new URL(s.url, "http://dummy")
                    sUrl.searchParams.forEach((v, k) => finalParams.set(k, v))
                }
            })

            const searchStr = finalParams.toString()
            router.push(`/${locale}${basePath}${searchStr ? `?${searchStr}` : ""}`)
        }

        setTimeout(() => inputRef.current?.focus(), 100)
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        // Backspace on empty input removes last tag
        if (e.key === "Backspace" && query === "" && selectedItems.length > 0) {
            e.preventDefault()
            handleRemoveTag(selectedItems[selectedItems.length - 1])
            return
        }

        if (!isOpen) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex((prev) =>
                prev < flatResults.length - 1 ? prev + 1 : 0
            )
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex((prev) =>
                prev > 0 ? prev - 1 : flatResults.length - 1
            )
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            e.preventDefault()
            handleSelect(flatResults[selectedIndex])
        } else if (e.key === "Escape") {
            e.preventDefault()
            setIsFocused(false)
            inputRef.current?.blur()
        }
    }

    // Group results by type - memoized for performance
    const groupedResults = React.useMemo(() => {
        return results.reduce((acc, result) => {
            if (!acc[result.type]) {
                acc[result.type] = []
            }
            acc[result.type].push(result)
            return acc
        }, {} as Record<string, SearchResult[]>)
    }, [results])

    // Track global index for highlighting
    let globalIndex = -1

    const hasSelectedItems = selectedItems.length > 0

    return (
        <div ref={containerRef} className="relative w-fit max-w-full">
            {/* Input trigger with tags */}
            <div
                className={cn(
                    "flex h-9 items-center gap-1.5 rounded-lg border bg-background px-2 transition-all duration-200 overflow-hidden",
                    isFocused
                        ? "border-primary/40 ring-2 ring-primary/10 shadow-sm"
                        : "border-input shadow-xs hover:border-input/80"
                )}
                onClick={() => inputRef.current?.focus()}
            >
                <Search className="size-4 shrink-0 text-muted-foreground/60 ml-1" />

                <div ref={scrollContainerRef} className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1">
                    {/* Selected tags */}
                    {selectedItems.map((item) => {
                        const ItemIcon = sectionConfig[item.type]?.icon || Search
                        return (
                            <span
                                key={`tag-${item.type}-${item.id}`}
                                className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary pl-1.5 pr-0.5 py-0.5 text-xs font-medium animate-in fade-in-0 zoom-in-95 duration-150 whitespace-nowrap shrink-0"
                            >
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt=""
                                        className="size-4 rounded-sm object-cover shrink-0"
                                    />
                                ) : (
                                    <ItemIcon className="size-3 shrink-0 opacity-70" />
                                )}
                                <span className="truncate max-w-[120px]">{item.title}</span>
                                <button
                                    type="button"
                                    className="ml-0.5 rounded-sm p-0.5 hover:bg-primary/20 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemoveTag(item)
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        )
                    })}

                    {/* Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={hasSelectedItems ? "Add filter..." : "Search anywhere..."}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onKeyDown={handleKeyDown}
                        className="min-w-[80px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none py-1"
                    />
                </div>

                {isLoading ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground/60 mx-1" />
                ) : !hasSelectedItems ? (
                    <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border bg-muted/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70 sm:inline-flex ml-1">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                ) : null}
            </div>

            {/* Dropdown results */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-lg border border-border/60 bg-popover shadow-lg shadow-black/[0.08] dark:shadow-black/30 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150">
                    {results.length === 0 && !isLoading && debouncedQuery.length >= 2 && (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </div>
                    )}
                    {results.length === 0 && isLoading && (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="size-3.5 animate-spin" />
                            Searching...
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="max-h-[320px] overflow-y-auto scroll-py-1 py-1">
                            {Object.entries(groupedResults).map(([type, items], groupIdx) => {
                                const config = sectionConfig[type] || { label: type, icon: Search }
                                const SectionIcon = config.icon

                                return (
                                    <div key={type}>
                                        {groupIdx > 0 && (
                                            <div className="mx-3 my-1 h-px bg-border/50" />
                                        )}
                                        <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                                            <SectionIcon className="size-3.5 text-muted-foreground/50" />
                                            <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                                                {config.label}
                                            </span>
                                        </div>
                                        {items.map((item) => {
                                            globalIndex++
                                            const currentIndex = globalIndex
                                            const ItemIcon = sectionConfig[item.type]?.icon || Search
                                            return (
                                                <button
                                                    key={`${item.type}-${item.id}`}
                                                    type="button"
                                                    className={cn(
                                                        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                                                        selectedIndex === currentIndex
                                                            ? "bg-accent text-accent-foreground"
                                                            : "hover:bg-accent/50"
                                                    )}
                                                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault()
                                                        handleSelect(item)
                                                    }}
                                                >
                                                    {item.imageUrl ? (
                                                        <div className="size-8 shrink-0 rounded-md overflow-hidden bg-muted border border-border/40">
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.title}
                                                                className="size-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/60 dark:bg-muted/30">
                                                            <ItemIcon className="size-3.5 text-muted-foreground/70" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-medium text-sm text-foreground truncate">
                                                            {item.title}
                                                        </span>
                                                        {item.subtitle && (
                                                            <span className="text-[11px] text-muted-foreground/50 tracking-tight">
                                                                {item.subtitle}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
