"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

interface OptionCardProps {
    title: string
    description?: string
    icon?: React.ReactNode
    isSelected: boolean
    onClick: () => void
    className?: string
}

export function OptionCard({
    title,
    description,
    icon,
    isSelected,
    onClick,
    className
}: OptionCardProps) {
    return (
        <motion.div
            whileHover={{ y: isSelected ? 0 : -2, scale: isSelected ? 1.05 : 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "relative flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-all duration-200",
                isSelected 
                    ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary" 
                    : "border-border bg-card hover:border-primary/50 hover:bg-primary/[0.02]",
                className
            )}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>
                {isSelected && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                        <Check className="h-3 w-3" />
                    </motion.div>
                )}
            </div>
            
            <div className="flex flex-col gap-0.5">
                <h3 className={cn(
                    "text-sm font-semibold leading-none tracking-tight",
                    isSelected ? "text-primary" : "text-card-foreground"
                )}>
                    {title}
                </h3>
                {description && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-2">
                        {description}
                    </p>
                )}
            </div>
        </motion.div>
    )
}
