"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { usePathname } from "@/i18n/routing"

export function ThemeProvider({
    children,
    defaultTheme,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    const pathname = usePathname()
    const isLandingPage = pathname === "/"
    const isLoginPage = pathname === "/login" || pathname.endsWith("/login")
    const forcedTheme = isLandingPage ? "light" : undefined
    const resolvedDefaultTheme = isLoginPage ? "light" : defaultTheme

    return <NextThemesProvider forcedTheme={forcedTheme} defaultTheme={resolvedDefaultTheme} {...props}>{children}</NextThemesProvider>
}
