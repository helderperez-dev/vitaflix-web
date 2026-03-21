"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Search, Loader2, Apple, Utensils, Users, Tag, Store, UserCheck, CalendarDays, type LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { useDebounce } from "use-debounce"
import { globalSearch } from "@/app/actions/search"
import { type SearchResult } from "@/shared-schemas/search"

import { cn } from "@/lib/utils"
import { MediaDisplay } from "@/components/shared/media-display"

export function GlobalSearch() {
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations("Common")
    const inputRef = React.useRef<HTMLInputElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const latestRequestRef = React.useRef(0)
    const [query, setQuery] = React.useState("")
    const [debouncedQuery] = useDebounce(query, 300)
    const [results, setResults] = React.useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(-1)
    const [dropdownStyle, setDropdownStyle] = React.useState<{ top: number; left: number; width: number } | null>(null)
    const sectionConfig: Record<string, { label: string; icon: LucideIcon }> = React.useMemo(() => ({
        product: { label: t("product"), icon: Apple },
        meal: { label: t("meal"), icon: Utensils },
        user: { label: t("user"), icon: Users },
        lead: { label: t("lead"), icon: UserCheck },
        plan: { label: t("plan"), icon: CalendarDays },
        brand: { label: t("brand"), icon: Store },
        tag: { label: t("tag"), icon: Tag },
    }), [t])

    const isOpen = isFocused && query.trim().length >= 2

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

    React.useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const targetNode = e.target as Node
            if (
                containerRef.current &&
                !containerRef.current.contains(targetNode) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(targetNode)
            ) {
                setIsFocused(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    React.useEffect(() => {
        if (!isOpen) {
            setDropdownStyle(null)
            return
        }

        const updatePosition = () => {
            if (!containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            setDropdownStyle({
                top: rect.bottom + 6,
                left: rect.left,
                width: rect.width,
            })
        }

        updatePosition()
        window.addEventListener("resize", updatePosition)
        window.addEventListener("scroll", updatePosition, true)
        return () => {
            window.removeEventListener("resize", updatePosition)
            window.removeEventListener("scroll", updatePosition, true)
        }
    }, [isOpen])

    React.useEffect(() => {
        const currentRequest = latestRequestRef.current + 1
        latestRequestRef.current = currentRequest

        async function fetchResults() {
            if (debouncedQuery.trim().length < 2) {
                setResults([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const searchResults = await globalSearch(debouncedQuery, locale)
                if (latestRequestRef.current !== currentRequest) return
                React.startTransition(() => {
                    setResults(searchResults)
                    setIsLoading(false)
                })
            } catch (error) {
                console.error(error)
                if (latestRequestRef.current === currentRequest) {
                    setIsLoading(false)
                }
            }
        }

        fetchResults()
    }, [debouncedQuery, locale])

    React.useEffect(() => {
        setSelectedIndex(-1)
    }, [results])

    function handleSelect(item: SearchResult) {
        router.push(item.url)
        setIsFocused(false)
        setQuery("")
        setResults([])
        setSelectedIndex(-1)
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!isOpen) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex((prev) =>
                prev < results.length - 1 ? prev + 1 : 0
            )
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex((prev) =>
                prev > 0 ? prev - 1 : results.length - 1
            )
        } else if (e.key === "Enter" && results.length > 0) {
            e.preventDefault()
            const fallbackIndex = selectedIndex >= 0 ? selectedIndex : 0
            handleSelect(results[fallbackIndex])
        } else if (e.key === "Escape") {
            e.preventDefault()
            setIsFocused(false)
            inputRef.current?.blur()
        }
    }

    const groupedResults = React.useMemo(() => {
        return results.reduce((acc, result) => {
            if (!acc[result.type]) {
                acc[result.type] = []
            }
            acc[result.type].push(result)
            return acc
        }, {} as Record<string, SearchResult[]>)
    }, [results])

    let globalIndex = -1

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative isolate w-fit max-w-full",
                isOpen ? "z-[9999]" : "z-10"
            )}
        >
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

                <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={t("search")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        className="min-w-[80px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none py-1"
                    />
                </div>

                {isLoading ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground/60 mx-1" />
                ) : (
                    <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border bg-muted/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70 sm:inline-flex ml-1">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                )}
            </div>

            {isOpen && dropdownStyle && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed rounded-lg border border-border/60 bg-popover shadow-lg shadow-black/[0.08] dark:shadow-black/30 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
                    style={{
                        top: dropdownStyle.top,
                        left: dropdownStyle.left,
                        width: dropdownStyle.width,
                        zIndex: 2147483647,
                    }}
                >
                    {results.length === 0 && !isLoading && debouncedQuery.length >= 2 && (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                            {locale.startsWith('pt') ? "Sem resultados." : "No results found."}
                        </div>
                    )}
                    {results.length === 0 && isLoading && (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="size-3.5 animate-spin" />
                            {locale.startsWith('pt') ? "A pesquisar..." : "Searching..."}
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
                                            <span className="text-[11px] font-semibold text-muted-foreground/60 tracking-tight">
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
                                                        <div className="size-8 shrink-0 rounded-md overflow-hidden bg-white border border-border/40">
                                                            <MediaDisplay
                                                                src={item.imageUrl}
                                                                alt={item.title}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white">
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
                </div>,
                document.body
            )}
        </div>
    )
}
