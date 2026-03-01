"use client"

import * as React from "react"
import { useTranslations, useLocale } from "next-intl"
import { LogOut, ChevronDown, Languages, User } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { useRouter, usePathname } from "@/i18n/routing"
import { updateUserLocale } from "@/app/actions/users"

interface UserMenuProps {
    user: {
        id: string
        email: string
    }
}

export function UserMenu({ user }: UserMenuProps) {
    const t = useTranslations("Navigation")
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const handleLocaleChange = async (newLocale: string) => {
        await updateUserLocale(user.id, newLocale)
        router.replace(pathname, { locale: newLocale })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-10 px-2 gap-2 hover:bg-primary/5 transition-all duration-300 rounded-xl border border-transparent hover:border-sidebar-border/50 group"
                >
                    <Avatar className="h-8 w-8 rounded-full border border-primary/10 transition-all ring-4 ring-primary/[0.03]">
                        <AvatarFallback className="rounded-full bg-primary/10 text-primary text-[10px] font-black border border-primary/20">
                            {user.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start gap-0.5 text-left">
                        <span className="text-[11px] font-bold leading-none tracking-tight text-foreground">{t("adminPanel")}</span>
                    </div>
                    <ChevronDown className="size-3 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 shadow-2xl border-sidebar-border/50 p-1.5 rounded-2xl animate-in fade-in-0 zoom-in-95 backdrop-blur-xl bg-background/90"
            >
                <div className="px-2 pb-2 mb-2 border-b border-sidebar-border/30">
                    <div className="flex items-center gap-3 p-2 bg-sidebar-accent/20 rounded-xl">
                        <Avatar className="h-8 w-8 rounded-full border border-sidebar-border/50">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {user.email.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate">{t("admin")}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                        </div>
                    </div>
                </div>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-accent/50 transition-all cursor-pointer mb-1">
                        <Languages className="size-4 text-muted-foreground/60" />
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="font-bold">{t("language")}</span>
                            <span className="text-[10px] text-muted-foreground uppercase opacity-70">
                                {locale === "en" ? "English" : locale === "es" ? "Español" : locale === "pt-pt" ? "Português (PT)" : "Português (BR)"}
                            </span>
                        </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-48 shadow-2xl border-sidebar-border/50 p-1.5 rounded-2xl animate-in slide-in-from-left-1 backdrop-blur-xl bg-background/90">
                            <div className="space-y-1">
                                {[
                                    { code: "en", label: "English" },
                                    { code: "es", label: "Español" },
                                    { code: "pt-pt", label: "Português (PT)" },
                                    { code: "pt-br", label: "Português (BR)" },
                                ].map((lang) => (
                                    <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() => handleLocaleChange(lang.code)}
                                        className={cn(
                                            "rounded-lg text-[11px] py-2 flex items-center gap-2.5 transition-all px-3 cursor-pointer",
                                            locale === lang.code ? "bg-primary/10 text-primary font-bold" : "hover:bg-accent/50"
                                        )}
                                    >
                                        <div className={cn("size-1.5 rounded-full", locale === lang.code ? "bg-primary animate-pulse" : "bg-transparent")} />
                                        <span>{lang.label}</span>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="my-2 bg-sidebar-border/30" />

                <DropdownMenuItem
                    onClick={() => React.startTransition(() => { logoutAction() })}
                    className="rounded-xl transition-all font-bold p-2.5 cursor-pointer hover:bg-accent focus:bg-accent group/logout"
                >
                    <LogOut className="mr-2 h-4 w-4 text-muted-foreground/60 group-hover/logout:text-foreground transition-colors" />
                    <span className="text-xs">{t("logout")}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
