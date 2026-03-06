"use client"

import * as React from "react"
import { Bell, Check, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export function NotificationBell({ userId }: { userId: string }) {
    const router = useRouter()
    const [notifications, setNotifications] = React.useState<any[]>([])
    const [unreadCount, setUnreadCount] = React.useState(0)
    const supabase = createClient()

    // Fetch initial notifications
    React.useEffect(() => {
        const fetchInitial = async () => {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", userId)
                .eq("channel", "app")
                .order("created_at", { ascending: false })
                .limit(20)

            if (!error && data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => n.read_at === null).length)
            }
        }
        fetchInitial()
    }, [userId, supabase])

    // Subscription to Realtime
    React.useEffect(() => {
        const channel = supabase.channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const newNotif = payload.new
                    if (newNotif.channel === 'app') {
                        setNotifications(prev => [newNotif, ...prev])
                        setUnreadCount(prev => prev + 1)
                        toast.info(newNotif.title, { description: newNotif.body })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase])

    async function markAsRead(id: string) {
        const { error } = await supabase
            .from("notifications")
            .update({ read_at: new Date().toISOString(), status: 'read' })
            .eq("id", id)

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    async function deleteNotification(id: string) {
        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", id)

        if (!error) {
            const isUnread = notifications.find(n => n.id === id)?.read_at === null
            setNotifications(prev => prev.filter(n => n.id !== id))
            if (isUnread) setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    const handleNotificationClick = (notif: any) => {
        if (!notif.read_at) {
            markAsRead(notif.id)
        }
        if (notif.metadata?.action_link) {
            if (notif.metadata.action_link.startsWith('http')) {
                window.open(notif.metadata.action_link, '_blank')
            } else {
                router.push(notif.metadata.action_link)
            }
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex size-2.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground border-2 border-background">
                            <span className="sr-only">New notifications</span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end">
                <div className="flex items-center gap-2 p-4 pb-2 border-b border-border/40 bg-muted/20">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {unreadCount} new
                        </span>
                    )}
                </div>

                <div className="flex flex-col max-h-[400px] overflow-y-auto w-full group/list">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center">
                            <Bell className="size-8 opacity-20 mb-2" />
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div
                                key={notif.id}
                                className={cn(
                                    "flex flex-col gap-1 p-4 border-b border-border/40 hover:bg-muted/30 transition-colors relative group/item",
                                    !notif.read_at && "bg-primary/[0.02]"
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col gap-1 pr-6 cursor-pointer" onClick={() => handleNotificationClick(notif)}>
                                        <h5 className={cn("text-xs font-semibold", !notif.read_at ? "text-foreground" : "text-muted-foreground")}>
                                            {notif.title}
                                            {!notif.read_at && <span className="absolute left-2 top-5 size-1.5 rounded-full bg-primary" />}
                                        </h5>
                                        {/* Simple regex parsing to handle potential HTML if channel is app, though app usually is plain text, let's keep it safe. */}
                                        <p className="text-[11px] text-muted-foreground line-clamp-3 leading-snug break-words" dangerouslySetInnerHTML={{ __html: notif.body }} />
                                    </div>

                                    <div className="absolute right-2 top-3 opacity-0 group-hover/item:opacity-100 flex gap-1 transition-opacity">
                                        {!notif.read_at && (
                                            <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}>
                                                <Check className="size-3" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}>
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </div>
                                </div>
                                <span className="text-[9px] text-muted-foreground/60 font-mono mt-1">
                                    {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
