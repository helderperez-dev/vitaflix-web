"use client"

import Image from "next/image"
import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

interface ImageCollageProps {
    mainImage: string
    topImage: string
    bottomImage: string
    label?: string
}

export function ImageCollage({ mainImage, topImage, bottomImage, label }: ImageCollageProps) {
    const visualRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: visualRef,
        offset: ["start end", "end start"]
    })

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const yMain = useTransform(smoothProgress, [0, 1], [15, -15])
    const yLeft = useTransform(smoothProgress, [0, 1], [50, -50])
    const yRight = useTransform(smoothProgress, [0, 1], [-30, 30])
    
    const rotateLeft = useTransform(smoothProgress, [0, 1], [-8, -4])
    const rotateRight = useTransform(smoothProgress, [0, 1], [3, 7])

    return (
        <div ref={visualRef} className="relative h-[500px] sm:h-[560px]">
            <motion.div
                style={{ y: yMain }}
                className="absolute left-8 right-8 top-6 bottom-10 overflow-hidden rounded-[2.2rem] shadow-[0_24px_65px_-20px_rgba(15,23,42,0.38)]"
            >
                <div className="relative h-full w-full">
                    <Image src={mainImage} alt="Imagem Principal" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/30 via-transparent to-transparent" />
                    {label && (
                        <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-lg shadow-slate-900/10 backdrop-blur">
                            {label}
                        </div>
                    )}
                </div>
            </motion.div>

            <motion.div
                style={{ y: yLeft, rotate: rotateLeft }}
                className="absolute left-0 top-14 h-[230px] w-[190px] overflow-hidden rounded-[1.6rem] shadow-[0_20px_40px_-18px_rgba(15,23,42,0.45)] sm:h-[260px] sm:w-[220px]"
            >
                <div className="relative h-full w-full">
                    <Image src={topImage} alt="Imagem Topo Esquerdo" fill className="object-cover" sizes="220px" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/25 via-transparent to-transparent" />
                </div>
            </motion.div>

            <motion.div
                style={{ y: yRight, rotate: rotateRight }}
                className="absolute bottom-0 right-0 h-[230px] w-[190px] overflow-hidden rounded-[1.6rem] shadow-[0_20px_40px_-18px_rgba(15,23,42,0.45)] sm:h-[260px] sm:w-[220px]"
            >
                <div className="relative h-full w-full">
                    <Image src={bottomImage} alt="Imagem Fundo Direito" fill className="object-cover" sizes="220px" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/25 via-transparent to-transparent" />
                </div>
            </motion.div>
        </div>
    )
}
