"use client"

import * as React from "react"
import { useTranslations, useLocale } from "next-intl"
import { Home, Apple, Utensils, Users, Settings, Sun, Moon, PanelLeftClose, PanelLeftOpen, Bell, Handshake, Boxes } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar"
import { Link, usePathname } from "@/i18n/routing"
import { ModeToggle } from "../theme-toggle"

interface AppSidebarProps {
    user: {
        id: string
        email: string
    }
}

export function AppSidebar({ user }: AppSidebarProps) {
    const { theme, setTheme } = useTheme()
    const { toggleSidebar } = useSidebar()
    const [mounted, setMounted] = React.useState(false)
    const t = useTranslations("Navigation")
    const pathname = usePathname()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const groups = [
        {
            id: "main",
            items: [
                {
                    title: t("dashboard"),
                    url: "/dashboard",
                    icon: Home,
                },
            ]
        },
        {
            id: "catalogue",
            items: [
                {
                    title: t("products"),
                    url: "/products",
                    icon: Apple,
                },
                {
                    title: t("meals"),
                    url: "/meals",
                    icon: Utensils,
                },
                {
                    title: t("leads"),
                    url: "/leads",
                    icon: Handshake,
                },
            ]
        },
        {
            id: "system",
            items: [
                {
                    title: t("users"),
                    url: "/users",
                    icon: Users,
                },
                {
                    title: t("settings"),
                    url: "/settings",
                    icon: Settings,
                },
            ]
        }
    ]

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border/50 bg-sidebar">
            <SidebarHeader className="flex flex-row items-center justify-between pl-7 pr-4 pt-5 pb-4 transition-all duration-300 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pt-5">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Image
                            src="/vitaflix_logo_light_mode.png"
                            alt="Vitaflix Logo"
                            width={32}
                            height={32}
                            className="dark:hidden object-contain transition-all duration-300 w-8 h-8 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5"
                        />
                        <Image
                            src="/vitaflix_logo_dark_mode.png"
                            alt="Vitaflix Logo"
                            width={32}
                            height={32}
                            className="hidden dark:block object-contain transition-all duration-300 w-8 h-8 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5"
                        />
                    </div>
                    <span className="font-light text-xl tracking-tighter text-foreground group-data-[collapsible=icon]:hidden">
                        Vitaflix
                    </span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent transition-colors group-data-[collapsible=icon]:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                    <PanelLeftClose className="h-[1.2rem] w-[1.2rem]" />
                </button>
            </SidebarHeader>
            <SidebarContent className="px-3 group-data-[collapsible=icon]:px-0">
                {groups.map((group) => (
                    <SidebarGroup key={group.id} className="py-0 group-data-[collapsible=icon]:px-0">
                        <SidebarGroupContent>
                            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                                {group.items.map((item) => {
                                    const isActive = pathname.includes(item.url)
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.title}
                                                className={cn(
                                                    "h-10 transition-all duration-300 relative group/button overflow-hidden rounded-lg",
                                                    "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!rounded-lg group-data-[collapsible=icon]:!p-0",
                                                    isActive
                                                        ? "bg-primary/10 text-primary"
                                                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                                                )}
                                            >
                                                <Link href={item.url} className="flex items-center gap-3 px-3 w-full h-full relative group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!px-0">
                                                    <item.icon className={cn(
                                                        "size-[18px] transition-colors duration-300 shrink-0",
                                                        isActive
                                                            ? "text-primary scale-110"
                                                            : "text-muted-foreground/70 group-hover/button:text-sidebar-foreground group-hover/button:scale-105"
                                                    )} />
                                                    <span className={cn(
                                                        "font-medium text-[13px] tracking-tight transition-colors duration-300 group-data-[collapsible=icon]:hidden",
                                                        isActive ? "text-primary" : "text-sidebar-foreground/80"
                                                    )}>{t(item.title.toLowerCase())}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
                <SidebarMenu className="gap-2">
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="h-10 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-300 group/theme-toggle"
                            tooltip={mounted ? (theme === "dark" ? t("lightMode") : t("darkMode")) : t("darkMode")}
                        >
                            <div className="flex items-center gap-3 px-3 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!px-0">
                                <div className="relative size-5 flex items-center justify-center shrink-0">
                                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-sidebar-foreground/50 group-hover/theme-toggle:text-primary" />
                                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sidebar-foreground/50 group-hover/theme-toggle:text-primary" />
                                </div>
                                <span className="text-[13px] font-medium text-sidebar-foreground/70 group-hover/theme-toggle:text-sidebar-foreground transition-colors group-data-[collapsible=icon]:hidden">
                                    {mounted ? (theme === "dark" ? t("darkMode") : t("lightMode")) : t("darkMode")}
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="hidden group-data-[collapsible=icon]:block">
                        <SidebarMenuButton
                            onClick={toggleSidebar}
                            className="h-10 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-300 group/toggle-expanded"
                        >
                            <div className="flex items-center justify-center w-full">
                                <PanelLeftOpen className="h-[1.2rem] w-[1.2rem] text-sidebar-foreground/50 group-hover/toggle-expanded:text-primary transition-colors" />
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
