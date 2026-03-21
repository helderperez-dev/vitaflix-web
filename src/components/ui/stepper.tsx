"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

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
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [isEditing, setIsEditing] = React.useState(false)

    const focusInput = React.useCallback(() => {
        setIsEditing(true)
        requestAnimationFrame(() => inputRef.current?.focus())
    }, [])

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
        <div
            ref={containerRef}
            className={cn(
                "relative flex h-9 w-full items-center rounded-lg border border-input bg-muted/5 px-1.5 transition-all focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 cursor-text select-none",
                className
            )}
            tabIndex={0}
            onClick={() => {
                focusInput()
            }}
            onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                    e.preventDefault()
                    const newValue = parseFloat((value + step).toFixed(1))
                    onChange(Math.min(newValue, max))
                } else if (e.key === "ArrowDown") {
                    e.preventDefault()
                    const newValue = parseFloat((value - step).toFixed(1))
                    onChange(Math.max(newValue, min))
                } else if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    focusInput()
                }
            }}
        >
            {/* Value Badge */}
            <div className="flex h-6 min-w-[2.5rem] px-2.5 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-white active:scale-[0.98] transition-transform">
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
                            } else if (e.key === 'Tab') {
                                setIsEditing(false)
                            }
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span>{value}</span>
                )}
            </div>

            <div className="flex-1" />

            {/* Custom Control Arrows */}
            <div
                className="flex items-center gap-1.5 mr-1.5 px-1 py-1 rounded-md bg-background/50 border border-border/20 cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onDecrement}
                    disabled={value <= min}
                    tabIndex={-1}
                    className="flex h-4 w-4 items-center justify-center rounded-sm transition-all hover:bg-primary/10 hover:text-primary active:scale-[0.9] text-muted-foreground/40 disabled:opacity-5 disabled:hover:bg-transparent"
                >
                    <ChevronDown className="h-3 w-3 stroke-[3]" />
                </button>
                <div className="w-px h-2.5 bg-border/40" />
                <button
                    type="button"
                    onClick={onIncrement}
                    disabled={value >= max}
                    tabIndex={-1}
                    className="flex h-4 w-4 items-center justify-center rounded-sm transition-all hover:bg-primary/10 hover:text-primary active:scale-[0.9] text-muted-foreground/40 disabled:opacity-5 disabled:hover:bg-transparent"
                >
                    <ChevronUp className="h-3 w-3 stroke-[3]" />
                </button>
            </div>

            {/* Unit */}
            {unit && (
                <span className="text-[9px] font-semibold text-muted-foreground/30 pr-1.5 whitespace-nowrap">
                    {unit}
                </span>
            )}
        </div>
    )
}
