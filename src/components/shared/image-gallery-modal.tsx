"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MediaDisplay } from "./media-display"

type GalleryBackground = "transparent" | "light" | "dark"

interface ImageGalleryModalProps {
    images: { url: string; isDefault?: boolean }[]
    initialIndex?: number
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultBackground?: GalleryBackground
    allowBackgroundToggle?: boolean
}

export function ImageGalleryModal({
    images,
    initialIndex = 0,
    open,
    onOpenChange,
    defaultBackground = "transparent",
    allowBackgroundToggle = true,
}: ImageGalleryModalProps) {
    const totalImages = images.length
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex)
    const [direction, setDirection] = React.useState(0)
    const [background, setBackground] = React.useState<GalleryBackground>(defaultBackground)

    const normalizeIndex = React.useCallback((index: number) => {
        if (totalImages === 0) return 0
        return (index % totalImages + totalImages) % totalImages
    }, [totalImages])

    const handleNext = React.useCallback(() => {
        if (totalImages <= 1) return
        setDirection(1)
        setCurrentIndex((prev) => normalizeIndex(prev + 1))
    }, [normalizeIndex, totalImages])

    const handlePrev = React.useCallback(() => {
        if (totalImages <= 1) return
        setDirection(-1)
        setCurrentIndex((prev) => normalizeIndex(prev - 1))
    }, [normalizeIndex, totalImages])

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return
            if (e.key === "ArrowRight") handleNext()
            if (e.key === "ArrowLeft") handlePrev()
            if (e.key === "Escape") onOpenChange(false)
        }

        if (open) {
            window.addEventListener("keydown", handleKeyDown)
            setCurrentIndex(normalizeIndex(initialIndex))
            setBackground(defaultBackground)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = "unset"
        }
    }, [open, initialIndex, handleNext, handlePrev, onOpenChange, defaultBackground, normalizeIndex])

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

    if (!open || totalImages === 0) return null

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    {/* Content Container */}
                    <div className="relative w-full max-w-6xl h-[min(78vh,900px)] min-h-[320px] flex items-center justify-center group">
                        <div className={cn(
                            "relative w-full h-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl p-3 md:p-4",
                            background === "transparent" && "bg-transparent",
                            background === "light" && "bg-white/95 border-black/10",
                            background === "dark" && "bg-black/40"
                        )}
                            onClick={() => onOpenChange(false)}
                        >
                            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                <motion.div
                                    key={currentIndex}
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
                                    className="absolute inset-3 md:inset-4 w-auto h-auto overflow-hidden flex items-center justify-center rounded-2xl"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <MediaDisplay
                                        key={images[currentIndex].url}
                                        src={images[currentIndex].url}
                                        alt={`Gallery image ${currentIndex + 1}`}
                                        className={cn(
                                            "max-w-full max-h-full object-contain rounded-2xl",
                                            background === "transparent" && "bg-transparent",
                                            background === "light" && "bg-white",
                                            background === "dark" && "bg-black"
                                        )}
                                        showControls={true}
                                        autoPlay={true}
                                        muted={false}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            <div
                                className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <div className="flex gap-2 ml-auto">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePrev}
                                        type="button"
                                        className="h-10 w-10 rounded-lg bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all disabled:opacity-40"
                                        disabled={totalImages <= 1}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleNext}
                                        type="button"
                                        className="h-10 w-10 rounded-lg bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all disabled:opacity-40"
                                        disabled={totalImages <= 1}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div
                            className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2"
                            onClick={(event) => event.stopPropagation()}
                        >
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        setDirection(i > currentIndex ? 1 : -1)
                                        setCurrentIndex(i)
                                    }}
                                    className={cn(
                                        "h-1 transition-all duration-300 rounded-lg",
                                        i === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/20 hover:bg-white/40"
                                    )}
                                />
                            ))}
                        </div>

                        <div
                            className="absolute -top-12 inset-x-0 flex items-center justify-end gap-2"
                            onClick={(event) => event.stopPropagation()}
                        >
                            {allowBackgroundToggle && (
                                <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-2 py-1.5">
                                    {(["transparent", "light", "dark"] as const).map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setBackground(option)}
                                            className={cn(
                                                "h-5 w-5 rounded-full border transition-all",
                                                option === "transparent" && "bg-transparent border-white/60",
                                                option === "light" && "bg-white border-white/80",
                                                option === "dark" && "bg-black border-white/40",
                                                background === option ? "ring-2 ring-primary ring-offset-2 ring-offset-black/40 scale-110" : "opacity-80 hover:opacity-100"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                                type="button"
                                className="h-10 w-10 rounded-lg bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all"
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
