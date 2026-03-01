"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ImageGalleryModalProps {
    images: { url: string; isDefault?: boolean }[]
    initialIndex?: number
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ImageGalleryModal({
    images,
    initialIndex = 0,
    open,
    onOpenChange,
}: ImageGalleryModalProps) {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex)
    const [direction, setDirection] = React.useState(0)

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return
            if (e.key === "ArrowRight") handleNext()
            if (e.key === "ArrowLeft") handlePrev()
            if (e.key === "Escape") onOpenChange(false)
        }

        if (open) {
            window.addEventListener("keydown", handleKeyDown)
            setCurrentIndex(initialIndex)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = "unset"
        }
    }, [open, initialIndex])

    const handleNext = () => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const handlePrev = () => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9,
        }),
    }

    if (!open || images.length === 0) return null

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    {/* Content Container */}
                    <div className="relative w-full max-w-6xl aspect-[16/10] flex items-center justify-center group">
                        {/* Main Image Slider */}
                        <div className="relative w-full h-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-black/20">
                            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                <motion.img
                                    key={currentIndex}
                                    src={images[currentIndex].url}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 },
                                        scale: { duration: 0.4 },
                                    }}
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                />
                            </AnimatePresence>

                            {/* Controls Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-8 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent">
                                <div className="flex flex-col gap-1">
                                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                                        Product Reference
                                    </span>
                                    <span className="text-white text-sm font-bold tracking-tight">
                                        Frame {currentIndex + 1} of {images.length}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePrev}
                                        className="h-10 w-10 rounded-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleNext}
                                        className="h-10 w-10 rounded-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Pagination Dots */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setDirection(i > currentIndex ? 1 : -1)
                                        setCurrentIndex(i)
                                    }}
                                    className={cn(
                                        "h-1 transition-all duration-300 rounded-full",
                                        i === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/20 hover:bg-white/40"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Top Controls */}
                        <div className="absolute -top-12 inset-x-0 flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                                className="h-10 w-10 rounded-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}
