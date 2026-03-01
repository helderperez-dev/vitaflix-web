"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface StepperProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    unit?: string
    className?: string
}

export function Stepper({
    value = 0,
    onChange,
    min = 0,
    max = Infinity,
    step = 1,
    unit,
    className,
}: StepperProps) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [isEditing, setIsEditing] = React.useState(false)

    const onIncrement = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newValue = parseFloat((value + step).toFixed(1))
        onChange(Math.min(newValue, max))
    }

    const onDecrement = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newValue = parseFloat((value - step).toFixed(1))
        onChange(Math.max(newValue, min))
    }

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value)
        if (!isNaN(newValue)) {
            const clampedValue = Math.min(Math.max(newValue, min), max)
            onChange(parseFloat(clampedValue.toFixed(1)))
        }
        setIsEditing(false)
    }

    return (
        <div className={cn(
            "relative flex h-10 w-full items-center rounded-lg border border-input bg-background px-2 transition-all hover:border-accent focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 dark:bg-muted/5",
            className
        )}>
            {/* Value Square */}
            <div
                className="flex h-7 min-w-[2.75rem] px-2 items-center justify-center rounded-md bg-primary text-sm font-black text-white shadow-md shadow-primary/20 cursor-text select-none active:scale-[0.98] transition-transform"
                onClick={() => {
                    setIsEditing(true)
                    setTimeout(() => inputRef.current?.focus(), 0)
                }}
            >
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="number"
                        step={step}
                        className="w-full bg-transparent text-center border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
                        defaultValue={value}
                        onBlur={handleInputBlur}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                inputRef.current?.blur()
                            }
                        }}
                    />
                ) : (
                    <span>{value}</span>
                )}
            </div>

            <div className="flex-1" />

            {/* Custom Control Arrows */}
            <div className="flex items-center gap-1.5 mr-2 px-1.5 py-1 rounded-md bg-muted/30 border border-border/5 group-hover:bg-muted/50 transition-colors">
                <button
                    type="button"
                    onClick={onDecrement}
                    disabled={value <= min}
                    className="flex h-5 w-5 items-center justify-center rounded-sm transition-all hover:bg-primary/10 hover:text-primary active:scale-[0.9] text-muted-foreground/60 disabled:opacity-10 disabled:hover:bg-transparent"
                >
                    <ChevronDown className="h-3.5 w-3.5 stroke-[3]" />
                </button>
                <div className="w-px h-3 bg-border/40" />
                <button
                    type="button"
                    onClick={onIncrement}
                    disabled={value >= max}
                    className="flex h-5 w-5 items-center justify-center rounded-sm transition-all hover:bg-primary/10 hover:text-primary active:scale-[0.9] text-muted-foreground/60 disabled:opacity-10 disabled:hover:bg-transparent"
                >
                    <ChevronUp className="h-3.5 w-3.5 stroke-[3]" />
                </button>
            </div>

            {/* Unit */}
            {unit && (
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/30 pr-2 select-none whitespace-nowrap">
                    {unit}
                </span>
            )}
        </div>
    )
}


