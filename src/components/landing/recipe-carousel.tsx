"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import Image from "next/image"

const recipeKeys = [
    { id: 1, key: "rice", video: "/videos/recipes/1.mp4", poster: "/videos/recipes/thumbnails/1.jpg" },
    { id: 2, key: "shepherd", video: "/videos/recipes/2.mp4", poster: "/videos/recipes/thumbnails/2.jpg" },
    { id: 3, key: "cake", video: "/videos/recipes/3.mp4", poster: "/videos/recipes/thumbnails/3.jpg" },
    { id: 4, key: "sandwich", video: "/videos/recipes/4.mp4", poster: "/videos/recipes/thumbnails/4.jpg" },
    { id: 5, key: "breakfast", video: "/videos/recipes/5.mp4", poster: "/videos/recipes/thumbnails/5.jpg" },
    { id: 6, key: "lasagna", video: "/videos/recipes/6.mp4", poster: "/videos/recipes/thumbnails/6.jpg" },
]

export function RecipeCarousel() {
    const t = useTranslations("Landing.Recipes")
    const containerRef = useRef<HTMLDivElement>(null)
    const cardRefs = useRef<Array<HTMLDivElement | null>>([])
    const [playingIndex, setPlayingIndex] = useState<number | null>(null)
    const [loadedIndexes, setLoadedIndexes] = useState<number[]>([0, 1])

    useEffect(() => {
        const root = containerRef.current
        if (!root || typeof window === "undefined") return
        
        const observerOptions = {
            root,
            threshold: 0.6,
        }

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            let mostCenteredIdx: number | null = null;
            let maxRatio = 0;

            entries.forEach((entry) => {
                const idx = Number((entry.target as HTMLElement).dataset.index)
                
                if (entry.isIntersecting) {
                    setLoadedIndexes((prev) => {
                        if (prev.includes(idx)) return prev
                        return [...prev, idx]
                    })

                    if (entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio
                        mostCenteredIdx = idx
                    }
                }
            })

            if (mostCenteredIdx !== null) {
                setPlayingIndex(mostCenteredIdx)
            }
        }

        const observer = new IntersectionObserver(handleIntersection, observerOptions)
        
        cardRefs.current.forEach((card) => {
            if (card) observer.observe(card)
        })

        return () => observer.disconnect()
    }, [])

    const scrollLeft = () => {
        const container = containerRef.current
        if (container) {
            container.scrollBy({ left: -300, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        const container = containerRef.current
        if (container) {
            container.scrollBy({ left: 300, behavior: 'smooth' })
        }
    }

    const togglePlay = (index: number) => {
        if (!loadedIndexes.includes(index)) {
            setLoadedIndexes((prev) => [...prev, index])
        }
        if (playingIndex === index) {
            setPlayingIndex(null)
        } else {
            setPlayingIndex(index)
        }
    }

    return (
        <div className="w-full py-10 overflow-hidden">
            <div className="flex items-center justify-between mb-8 px-4 sm:px-6 container mx-auto">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900">{t("title")}</h3>
                    <p className="text-slate-500 text-sm mt-1">{t("subtitle")}</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={scrollLeft}
                        className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 active:scale-95"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                    <button 
                        onClick={scrollRight}
                        className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 active:scale-95"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="size-5" />
                    </button>
                </div>
            </div>

            <div 
                ref={containerRef}
                className="relative w-full overflow-x-auto scrollbar-hide flex gap-4 sm:gap-6 px-4 pb-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                    {recipeKeys.map((recipe, index) => (
                        <motion.div
                            key={`${recipe.id}-${index}`}
                            data-index={index}
                            ref={(el) => {
                                cardRefs.current[index] = el
                            }}
                            className={cn(
                                "relative shrink-0 w-[240px] sm:w-[280px] aspect-[9/16] rounded-[2rem] overflow-hidden bg-slate-900 group cursor-pointer transition-all duration-500 snap-center",
                                playingIndex === index ? "scale-105 z-20" : ""
                            )}
                            onClick={() => togglePlay(index)}
                        >
                        <Image
                            src={recipe.poster}
                            alt={t(`items.${recipe.key}`)}
                            fill
                            className="absolute inset-0 object-cover"
                            sizes="(max-width: 640px) 240px, 280px"
                        />
                        <video
                            src={loadedIndexes.includes(index) ? recipe.video : undefined}
                            className="absolute inset-0 w-full h-full object-cover"
                            loop
                            muted
                            playsInline
                            preload={playingIndex === index ? "auto" : "metadata"}
                            ref={(el) => {
                                if (el) {
                                    if (playingIndex === index) {
                                        el.play().catch(() => {})
                                    } else {
                                        el.pause()
                                        el.currentTime = 0
                                    }
                                }
                            }}
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity duration-300" 
                             style={{ opacity: playingIndex === index ? 0.4 : 0.7 }}
                        />

                        <div className={cn(
                            "absolute inset-0 flex items-center justify-center transition-all duration-300",
                            playingIndex === index ? "opacity-0 scale-110" : "opacity-100 scale-100 group-hover:scale-110"
                        )}>
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                                <Play className="size-6 text-white fill-white ml-1" />
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 transition-transform duration-300 transform translate-y-0 group-hover:-translate-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="px-2 py-1 rounded-full bg-emerald-500/90 backdrop-blur text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                                    {t("badge")}
                                </div>
                            </div>
                            <h4 className="text-white font-bold text-lg leading-tight mb-1">{t(`items.${recipe.key}`)}</h4>
                            <p className="text-white/80 text-sm font-medium">{t("cta")}</p>
                        </div>
                        </motion.div>
                    ))}
            </div>
        </div>
    )
}
