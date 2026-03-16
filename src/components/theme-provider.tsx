"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { usePathname } from "@/i18n/routing"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    const pathname = usePathname()
    const isLandingPage = pathname === "/"
    const forcedTheme = isLandingPage ? "light" : undefined

    return <NextThemesProvider forcedTheme={forcedTheme} {...props}>{children}</NextThemesProvider>
}

