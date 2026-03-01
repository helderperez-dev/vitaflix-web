import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { UserMenu } from "@/components/layout/user-menu"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { GlobalSearch } from "@/components/layout/global-search"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/")
    }

    const userData = {
        id: user.id,
        email: user.email || "admin@vitaflix.com"
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar user={userData} />
                <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
                    <header className="flex h-16 items-center gap-4 px-8 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300 shrink-0 shadow-sm shadow-primary/[0.02] dark:shadow-none">
                        <div className="flex-1 flex items-center max-w-2xl">
                            <GlobalSearch />
                        </div>
                        <div className="flex-1" />
                        <UserMenu user={userData} />
                    </header>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}
