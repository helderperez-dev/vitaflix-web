"use client"

import * as React from "react"
import { useTranslations, useLocale } from "next-intl"
import { Home, Apple, Utensils, Users, Settings, LogOut, ChevronUp, Languages } from "lucide-react"
import Image from "next/image"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { logoutAction } from "@/app/actions/auth"
import { Link, useRouter, usePathname } from "@/i18n/routing"
import { updateUserLocale } from "@/app/actions/users"

interface AppSidebarProps {
    user: {
        id: string
        email: string
    }
}

export function AppSidebar({ user }: AppSidebarProps) {
    const t = useTranslations("Navigation")
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const items = [
        {
            title: t("dashboard"),
            url: "/dashboard",
            icon: Home,
        },
        {
            title: t("products"),
            url: "/products",
            icon: Apple,
        },
        {
            title: t("recipes"),
            url: "/recipes",
            icon: Utensils,
        },
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

    const handleLocaleChange = async (newLocale: string) => {
        // Persist to DB for the user
        await updateUserLocale(user.id, newLocale)

        // We need to keep the same pathname but change the locale
        // next-intl's useRouter handle this
        router.replace(pathname, { locale: newLocale })
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex items-center justify-between px-4 py-6">
                <div className="flex items-center gap-3">
                    <Image
                        src="/vitaflix_logo_light_mode.png"
                        alt="Vitaflix Logo"
                        width={32}
                        height={32}
                        className="dark:hidden object-contain"
                    />
                    <Image
                        src="/vitaflix_logo_dark_mode.png"
                        alt="Vitaflix Logo"
                        width={32}
                        height={32}
                        className="hidden dark:block object-contain"
                    />
                    <span className="text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Vitaflix
                    </span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Administrative</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname.includes(item.url)} tooltip={item.title}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg shadow-sm border">
                                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                                            {user.email.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">Admin Panel</span>
                                        <span className="truncate text-[10px] text-muted-foreground uppercase font-bold">{locale}</span>
                                    </div>
                                    <ChevronUp className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="start"
                                className="w-[200px]"
                            >
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Change Language</div>
                                <DropdownMenuItem onClick={() => handleLocaleChange("en")} className={locale === "en" ? "bg-accent" : ""}>
                                    <span>🇺🇸 English</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleLocaleChange("es")} className={locale === "es" ? "bg-accent" : ""}>
                                    <span>🇪🇸 Español</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleLocaleChange("pt-pt")} className={locale === "pt-pt" ? "bg-accent" : ""}>
                                    <span>🇵🇹 Português (PT)</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleLocaleChange("pt-br")} className={locale === "pt-br" ? "bg-accent" : ""}>
                                    <span>🇧🇷 Português (BR)</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={() => React.startTransition(() => { logoutAction() })}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>{t("logout")}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
