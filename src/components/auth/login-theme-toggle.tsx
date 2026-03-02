"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

export function LoginThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="size-9" />

    const isDark = theme === "dark"

    return (
        <motion.button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative size-9 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors duration-300 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.span
                        key="moon"
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <Moon className="size-4 text-white/70 group-hover:text-white transition-colors" />
                    </motion.span>
                ) : (
                    <motion.span
                        key="sun"
                        initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <Sun className="size-4 text-white/70 group-hover:text-white transition-colors" />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    )
}
