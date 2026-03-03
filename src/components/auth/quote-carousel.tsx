"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface QuoteCarouselProps {
    quotes: string[]
    author: string
    title: string
}

export function QuoteCarousel({ quotes, author, title }: QuoteCarouselProps) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((current) => (current + 1) % quotes.length)
        }, 10000) // Change quote every 10 seconds
        return () => clearInterval(timer)
    }, [quotes.length])

    return (
        <blockquote className="space-y-4 w-full">
            <div className="relative min-h-[120px] flex flex-col justify-end">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl font-medium leading-tight tracking-tight max-w-lg origin-bottom"
                    >
                        &ldquo;{quotes[index]}&rdquo;
                    </motion.p>
                </AnimatePresence>
            </div>
            <footer className="flex flex-col gap-1">
                <cite className="not-italic font-semibold text-primary">{author}</cite>
                <span className="text-sm opacity-60">{title}</span>
            </footer>
        </blockquote>
    )
}
