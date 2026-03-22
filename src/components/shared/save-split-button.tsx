"use client"

import * as React from "react"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SaveSplitButtonProps {
    disabled?: boolean
    loading?: boolean
    saveAndStayLabel: string
    saveAndCloseLabel: string
    initialMode?: "stay" | "close"
    size?: "default" | "sm"
    onSaveMode: (mode: "stay" | "close") => void
}

export function SaveSplitButton({
    disabled = false,
    loading = false,
    saveAndStayLabel,
    saveAndCloseLabel,
    initialMode = "close",
    size = "default",
    onSaveMode,
}: SaveSplitButtonProps) {
    const [mode, setMode] = React.useState<"stay" | "close">(initialMode)

    React.useEffect(() => {
        setMode(initialMode)
    }, [initialMode])

    const primaryLabel = mode === "stay" ? saveAndStayLabel : saveAndCloseLabel
    const isSmall = size === "sm"

    return (
        <div className={isSmall ? "flex h-9 items-stretch overflow-hidden rounded-lg shadow-sm shadow-primary/5" : "flex h-10 items-stretch overflow-hidden rounded-lg shadow-sm shadow-primary/5"}>
            <Button
                type="button"
                className={isSmall ? "h-full rounded-none px-5 bg-primary hover:bg-primary/90 text-white font-semibold text-[10px] transition-all active:scale-[0.98]" : "h-full rounded-none px-6 bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-all active:scale-[0.98]"}
                onClick={() => onSaveMode(mode)}
                disabled={disabled}
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {primaryLabel}
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        className={isSmall ? "h-full rounded-none px-2.5 bg-primary hover:bg-primary/90 border-l border-white/25 text-white hover:text-white active:text-white focus:text-white [&_svg]:text-white transition-colors" : "h-full rounded-none px-3 bg-primary hover:bg-primary/90 border-l border-white/25 text-white hover:text-white active:text-white focus:text-white [&_svg]:text-white transition-colors"}
                        disabled={disabled}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-lg p-1.5">
                    <DropdownMenuItem
                        onSelect={() => {
                            setMode("stay")
                            onSaveMode("stay")
                        }}
                        className={isSmall ? "rounded-md text-[10px] font-semibold py-2 cursor-pointer flex items-center justify-between" : "rounded-md text-[11px] font-semibold py-2.5 cursor-pointer flex items-center justify-between"}
                    >
                        {saveAndStayLabel}
                        {mode === "stay" ? <Check className="h-3.5 w-3.5" /> : null}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => {
                            setMode("close")
                            onSaveMode("close")
                        }}
                        className={isSmall ? "rounded-md text-[10px] font-semibold py-2 cursor-pointer flex items-center justify-between" : "rounded-md text-[11px] font-semibold py-2.5 cursor-pointer flex items-center justify-between"}
                    >
                        {saveAndCloseLabel}
                        {mode === "close" ? <Check className="h-3.5 w-3.5" /> : null}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
