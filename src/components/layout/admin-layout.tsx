import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "../theme-toggle"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar user={{
                    id: user.id,
                    email: user.email || "admin@vitaflix.com"
                }} />
                <main className="flex-1 overflow-y-auto">
                    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                        <SidebarTrigger />
                        <div className="flex-1" />
                        <ModeToggle />
                    </header>
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}
