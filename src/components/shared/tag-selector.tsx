"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Settings2, X, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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
import { getTags } from "@/app/actions/tags"
import { type Tag } from "@/shared-schemas/tag"
import { TagModal } from "@/components/shared/tag-modal"
import { useLocale } from "next-intl"

interface TagSelectorProps {
    selectedTagIds: string[]
    onTagsChange: (tagIds: string[]) => void
}

export function TagSelector({ selectedTagIds, onTagsChange }: TagSelectorProps) {
    const locale = useLocale()
    const [open, setOpen] = React.useState(false)
    const [tags, setTags] = React.useState<Tag[]>([])
    const [loading, setLoading] = React.useState(true)
    const [tagModalOpen, setTagModalOpen] = React.useState(false)
    const [editingTag, setEditingTag] = React.useState<Tag | null>(null)

    const fetchTags = React.useCallback(async () => {
        const data = await getTags()
        setTags(data || [])
        setLoading(false)
    }, [])

    React.useEffect(() => {
        fetchTags()
    }, [fetchTags])

    const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id!))

    const toggleTag = (tagId: string) => {
        if (selectedTagIds.includes(tagId)) {
            onTagsChange(selectedTagIds.filter((id) => id !== tagId))
        } else {
            onTagsChange([...selectedTagIds, tagId])
        }
    }

    const removeTag = (tagId: string) => {
        onTagsChange(selectedTagIds.filter((id) => id !== tagId))
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <h3 className="font-bold text-xs text-secondary dark:text-white whitespace-nowrap">Product Tags</h3>
                    <div className="h-px w-full bg-border/60" />
                </div>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="h-8 w-[140px] justify-start px-4 text-xs font-semibold border-border/50 bg-transparent text-muted-foreground hover:bg-muted/5 gap-2 rounded-xl transition-all"
                        >
                            <Plus className="h-3 w-3" />
                            Select Tags
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0 shadow-2xl border-border/40 rounded-2xl backdrop-blur-xl bg-background/90" align="end">
                        <Command className="bg-transparent border-none">
                            <CommandInput placeholder="Search tags..." className="h-10 text-xs" />
                            <CommandList className="max-h-[300px]">
                                <CommandEmpty className="py-6 text-xs text-muted-foreground/40 text-center">
                                    No tags found.
                                </CommandEmpty>
                                <CommandGroup heading="Available Tags" className="text-[11px] font-semibold text-muted-foreground/40 px-2 py-4">
                                    {tags.map((tag) => (
                                        <CommandItem
                                            key={tag.id}
                                            onSelect={() => toggleTag(tag.id!)}
                                            className="text-xs py-2.5 px-3 flex items-center justify-between group cursor-pointer rounded-lg hover:bg-primary/5 mb-1 last:mb-0 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedTagIds.includes(tag.id!)}
                                                    className="pointer-events-none translate-y-[1px]"
                                                />
                                                <span className="font-medium text-secondary dark:text-foreground/90">
                                                    {tag.name?.[locale] || tag.name?.en}
                                                </span>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all hover:bg-muted/50 rounded-full"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingTag(tag)
                                                    setTagModalOpen(true)
                                                }}
                                            >
                                                <Settings2 className="h-3.5 w-3.5 text-muted-foreground/50" />
                                            </Button>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                <CommandSeparator className="bg-border/40" />
                                <CommandGroup className="px-2 py-2">
                                    <CommandItem
                                        onSelect={() => {
                                            setEditingTag(null)
                                            setTagModalOpen(true)
                                            setOpen(false)
                                        }}
                                        className="text-xs py-2.5 px-3 text-primary font-semibold cursor-pointer flex items-center gap-2 rounded-lg hover:bg-primary/5 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create New Tag
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex flex-wrap gap-2">
                {selectedTags.length === 0 ? (
                    <div className="w-full py-8 border-2 border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center bg-muted/5 group hover:border-primary/20 transition-all duration-500">
                        <p className="text-xs font-semibold text-muted-foreground/30">No tags selected</p>
                    </div>
                ) : (
                    selectedTags.map((tag) => (
                        <Badge
                            key={tag.id}
                            variant="secondary"
                            className="h-8 px-4 flex items-center gap-3 bg-muted/20 hover:bg-muted/30 text-secondary dark:text-foreground/80 border-none transition-all rounded-xl"
                        >
                            <span className="text-xs font-semibold">
                                {tag.name?.[locale] || tag.name?.en}
                            </span>
                            <button
                                onClick={() => removeTag(tag.id!)}
                                className="hover:text-destructive transition-colors p-1"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))
                )}
            </div>

            <TagModal
                open={tagModalOpen}
                tag={editingTag}
                onOpenChange={setTagModalOpen}
                onSuccess={() => {
                    fetchTags()
                    setTagModalOpen(false)
                }}
            />
        </div>
    )
}
