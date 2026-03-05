"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface SearchableSelectProps {
    options: { value: string, label: string, secondary?: string }[]
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
    name?: string
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    emptyMessage = "No results found.",
    className,
    name
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)

    const selectedOption = options.find((opt) => opt.value === value)

    return (
        <>
            <input type="hidden" name={name} value={value || ""} />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between h-10 rounded-xl border-border/40 bg-muted/5 font-medium px-4",
                            !value && "text-muted-foreground",
                            className
                        )}
                    >
                        {value ? (
                            <div className="flex items-center gap-2 truncate">
                                <span className="truncate">{selectedOption?.label}</span>
                                {selectedOption?.secondary && (
                                    <span className="text-[10px] text-muted-foreground/50 truncate">
                                        ({selectedOption.secondary})
                                    </span>
                                )}
                            </div>
                        ) : (
                            placeholder
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 sm:w-[var(--radix-popover-trigger-width)] rounded-xl border-border/40 shadow-2xl overflow-hidden" align="start">
                    <Command className="border-none">
                        <CommandInput placeholder="Search..." className="h-10 border-none ring-0 focus:ring-0" />
                        <CommandEmpty className="py-4 text-xs text-center text-muted-foreground/60">{emptyMessage}</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label + " " + (option.secondary || "")}
                                    onSelect={() => {
                                        onValueChange(option.value)
                                        setOpen(false)
                                    }}
                                    className="flex items-center justify-between rounded-lg py-2 hover:bg-primary/5 cursor-pointer data-[selected=true]:bg-primary/10"
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-sm font-semibold truncate text-secondary dark:text-white">
                                            {option.label}
                                        </span>
                                        {option.secondary && (
                                            <span className="text-[10px] text-muted-foreground/60 truncate font-medium">
                                                {option.secondary}
                                            </span>
                                        )}
                                    </div>
                                    <Check
                                        className={cn(
                                            "h-4 w-4 text-primary ml-2 shrink-0",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </>
    )
}
