"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function VideoBackground() {
    const [videoIndex, setVideoIndex] = useState(0)
    const videos = ["1.mp4", "2.mp4", "3.mp4", "4.mp4", "5.mp4"]

    useEffect(() => {
        // Select an initial random video, then cycle
        const initialIndex = Math.floor(Math.random() * videos.length)
        setVideoIndex(initialIndex)

        const timer = setInterval(() => {
            setVideoIndex((current) => (current + 1) % videos.length)
        }, 15000) // Cycle videos every 15 seconds

        return () => clearInterval(timer)
    }, [videos.length])

    return (
        <div className="absolute inset-0 h-full w-full bg-black overflow-hidden">
            <AnimatePresence>
                <motion.video
                    key={videos[videoIndex]}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                    src={`/videos/${videos[videoIndex]}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
            </AnimatePresence>
        </div>
    )
}
