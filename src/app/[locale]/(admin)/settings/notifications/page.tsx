
import { createClient } from "@/lib/supabase/server"
import { NotificationsWrapper } from "@/components/notifications/notifications-wrapper"

export const dynamic = "force-dynamic"

export default async function NotificationsSettingsPage() {
    const supabase = await createClient()

    // Fetch initial groups
    const { data: groups } = await supabase
        .from("user_groups")
        .select("*")
        .order("created_at", { ascending: false })

    // Fetch triggers
    const { data: triggers } = await supabase
        .from("notification_triggers")
        .select("*")
        .order("created_at", { ascending: false })

    // Fetch users for member management / broadcast selection
    const { data: users } = await supabase
        .from("users")
        .select("id, email, display_name")
        .order("created_at", { ascending: false })

    // Fetch notifications (sent/broadcast history)
    const { data: notifications } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

    // Example notifications for UI demonstration
    const exampleNotifications = [
        {
            id: 'ex-1',
            title: 'Welcome to Vitaflix!',
            body: 'Thank you for joining our wellness community. Check out your initial meal plan!',
            channel: 'app',
            type: 'transactional',
            status: 'sent',
            created_at: new Date().toISOString()
        },
        {
            id: 'ex-2',
            title: 'Weekly Macro Tips',
            body: 'Upgrade your subscription today or read our latest blog on macro tracking.',
            channel: 'email',
            type: 'marketing',
            status: 'sent',
            created_at: new Date(Date.now() - 3600000).toISOString()
        }
    ]

    return (
        <NotificationsWrapper
            initialGroups={groups || []}
            initialTriggers={triggers || []}
            initialNotifications={[...exampleNotifications, ...(notifications || [])]}
            users={(users || []).map(u => ({ id: u.id, email: u.email, display_name: u.display_name }))}
            isSettingsMode={true}
        />
    )
}
