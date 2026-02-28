"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Settings2, X, Loader2 } from "lucide-react"
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
                    <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">Product Tags</h3>
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
                            Select Tags
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0" align="end">
                        <Command className="border-none shadow-none">
                            <CommandInput placeholder="Search tags..." className="h-9 text-xs" />
                            <CommandList>
                                <CommandEmpty className="py-4 text-[11px] text-muted-foreground text-center">
                                    No tags found.
                                </CommandEmpty>
                                <CommandGroup heading="Available Tags" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">
                                    {tags.map((tag) => (
                                        <CommandItem
                                            key={tag.id}
                                            onSelect={() => toggleTag(tag.id!)}
                                            className="text-xs py-2 flex items-center justify-between group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-all",
                                                    selectedTagIds.includes(tag.id!) ? "bg-primary text-primary-foreground" : "opacity-50"
                                                )}>
                                                    {selectedTagIds.includes(tag.id!) && <Check className="h-3 w-3" />}
                                                </div>
                                                <span className="font-medium text-secondary">
                                                    {tag.name?.[locale] || tag.name?.en}
                                                </span>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all hover:bg-muted/50"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingTag(tag)
                                                    setTagModalOpen(true)
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
                                            setEditingTag(null)
                                            setTagModalOpen(true)
                                            setOpen(false)
                                        }}
                                        className="text-xs py-2 text-primary font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
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
                    <div className="w-full py-8 border border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center bg-muted/5 group hover:bg-muted/10 transition-colors">
                        <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">No tags selected</p>
                    </div>
                ) : (
                    selectedTags.map((tag) => (
                        <Badge
                            key={tag.id}
                            variant="secondary"
                            className="h-7 px-3 flex items-center gap-2 bg-muted/20 hover:bg-muted/30 text-secondary border-none transition-all rounded-full"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {tag.name?.[locale] || tag.name?.en}
                            </span>
                            <button
                                onClick={() => removeTag(tag.id!)}
                                className="hover:text-destructive transition-colors p-0.5"
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
