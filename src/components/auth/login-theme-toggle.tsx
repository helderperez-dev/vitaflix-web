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
            className="relative flex items-center justify-center p-2 text-foreground/50 hover:text-foreground transition-colors duration-300 group outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
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
                        <Moon className="size-5 transition-colors" />
                    </motion.span>
                ) : (
                    <motion.span
                        key="sun"
                        initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <Sun className="size-5 transition-colors" />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    )
}
