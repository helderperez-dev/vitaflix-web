"use client"

import * as React from "react"
import { Braces, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const PLACEHOLDERS = [
    { label: "User Full Name", value: "{{user_name}}", description: "John Doe" },
    { label: "User First Name", value: "{{first_name}}", description: "John" },
    { label: "User Email", value: "{{user_email}}", description: "john@example.com" },
    { label: "App Name", value: "{{app_name}}", description: "Vitaflix" },
    { label: "Magic Link", value: "{{magic_link}}", description: "https://vitaflix.com/login?token=..." },
    { label: "Current Date", value: "{{date}}", description: "Mar 3, 2026" },
    { label: "Unsubscribe Link", value: "{{unsubscribe_url}}", description: "Link to user preferences" },
]

interface PlaceholderSelectorProps {
    onSelect: (placeholder: string) => void
    className?: string
}

export function PlaceholderSelector({ onSelect, className }: PlaceholderSelectorProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "size-8 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all",
                        open && "text-primary bg-primary/10",
                        className
                    )}
                    title="Insert Placeholder"
                >
                    <Braces className="size-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-[280px] p-1 rounded-lg border-border/40 shadow-2xl">
                <div className="p-2 border-b border-border/10">
                    <h4 className="text-[10px] font-bold capitalize tracking-wider text-muted-foreground/60">Choose Placeholder</h4>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                    {PLACEHOLDERS.map((ph) => (
                        <button
                            key={ph.value}
                            type="button"
                            onClick={() => {
                                onSelect(ph.value)
                                setOpen(false)
                            }}
                            className="w-full flex flex-col items-start gap-0.5 p-2 rounded-lg hover:bg-primary/5 transition-colors text-left group"
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-semibold text-secondary group-hover:text-primary transition-colors">{ph.label}</span>
                                <code className="text-[10px] bg-muted/50 px-1 rounded font-mono text-muted-foreground/60">{ph.value}</code>
                            </div>
                            <span className="text-[10px] text-muted-foreground/40 font-medium">Example: {ph.description}</span>
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
