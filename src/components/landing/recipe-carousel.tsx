"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring, useMotionValue, animate } from "framer-motion"
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

const recipeKeys = [
    { id: 1, key: "rice", video: "/videos/recipes/1.mp4" },
    { id: 2, key: "shepherd", video: "/videos/recipes/2.mp4" },
    { id: 3, key: "cake", video: "/videos/recipes/3.mp4" },
    { id: 4, key: "sandwich", video: "/videos/recipes/4.mp4" },
    { id: 5, key: "breakfast", video: "/videos/recipes/5.mp4" },
    { id: 6, key: "lasagna", video: "/videos/recipes/6.mp4" },
]

export function RecipeCarousel() {
    const t = useTranslations("Landing.Recipes")
    const containerRef = useRef<HTMLDivElement>(null)
    const [playingIndex, setPlayingIndex] = useState<number | null>(null)
    const x = useMotionValue(0)

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
                            className={cn(
                                "relative shrink-0 w-[240px] sm:w-[280px] aspect-[9/16] rounded-[2rem] overflow-hidden bg-slate-900 group cursor-pointer transition-all duration-500 snap-center",
                                playingIndex === index ? "scale-105 z-20" : ""
                            )}
                            onClick={() => togglePlay(index)}
                        >
                        <video
                            src={recipe.video}
                            className="absolute inset-0 w-full h-full object-cover"
                            loop
                            muted={false}
                            playsInline
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
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity duration-300" 
                             style={{ opacity: playingIndex === index ? 0.4 : 0.7 }}
                        />

                        {/* Play Button Overlay */}
                        <div className={cn(
                            "absolute inset-0 flex items-center justify-center transition-all duration-300",
                            playingIndex === index ? "opacity-0 scale-110" : "opacity-100 scale-100 group-hover:scale-110"
                        )}>
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                                <Play className="size-6 text-white fill-white ml-1" />
                            </div>
                        </div>

                        {/* Content */}
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
