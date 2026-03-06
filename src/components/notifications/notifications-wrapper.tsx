"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BroadcastTab } from "./broadcast-tab"
import { TriggersTab } from "./triggers-tab"
import { GroupsTab } from "./groups-tab"

import { NotificationDrawer, type NotificationDrawerMode } from "./notification-drawer"

interface NotificationsWrapperProps {
    initialGroups: any[]
    initialTriggers: any[]
    initialNotifications: any[]
    users: any[]
}

type TabValue = "broadcast" | "triggers" | "groups"

export function NotificationsWrapper({ initialGroups, initialTriggers, initialNotifications, users }: NotificationsWrapperProps) {
    const t = useTranslations("Notifications")
    const [activeTab, setActiveTab] = React.useState<TabValue>("broadcast")
    const [drawerOpen, setDrawerOpen] = React.useState(false)
    const [drawerMode, setDrawerMode] = React.useState<NotificationDrawerMode>("broadcast")
    const [editingData, setEditingData] = React.useState<any>(null)
    const [initialGroupTab, setInitialGroupTab] = React.useState<"details" | "members">("details")

    const handleAction = (mode: NotificationDrawerMode, data?: any, groupTab?: "details" | "members") => {
        setDrawerMode(mode)
        setEditingData(data || null)
        setInitialGroupTab(groupTab || "details")
        setDrawerOpen(true)
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                {/* Premium Background Accent */}
                <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-white pointer-events-none" />

                <div className="flex flex-col relative z-10 text-pretty">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-full opacity-80" />
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white leading-none">
                            {t("title")}
                        </h2>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground/70 dark:text-white/40 mt-2.5 ml-4">
                        {t("description")}
                    </p>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="flex items-center gap-8 mr-4 border-r border-border/40 pr-8 h-8">
                        {(["broadcast", "triggers", "groups"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "relative pb-1 text-[11px] font-bold transition-all duration-300 flex items-center gap-1",
                                    activeTab === tab
                                        ? "text-primary opacity-100"
                                        : "text-muted-foreground/30 hover:text-muted-foreground/60"
                                )}
                            >
                                {t(`tabs.${tab}`)}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="notificationTabUnderline"
                                        className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary z-10 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <Button
                        className="bg-primary hover:bg-primary/95 text-white font-semibold transition-all active:scale-95 shadow-sm h-10 px-6 rounded-xl text-xs flex items-center gap-2"
                        onClick={() => {
                            const mode = activeTab === "broadcast" ? "broadcast" : activeTab === "triggers" ? "trigger" : "group"
                            handleAction(mode)
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        {activeTab === "broadcast" && t("sendBroadcast")}
                        {activeTab === "triggers" && t("createTrigger")}
                        {activeTab === "groups" && t("createGroup")}
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeTab === "broadcast" && (
                            <BroadcastTab
                                groups={initialGroups}
                                notifications={initialNotifications}
                                onView={(data) => handleAction("view-notification", data)}
                            />
                        )}
                        {activeTab === "triggers" && (
                            <TriggersTab
                                initialTriggers={initialTriggers}
                                onEdit={(data) => handleAction("trigger", data)}
                            />
                        )}
                        {activeTab === "groups" && (
                            <GroupsTab
                                initialGroups={initialGroups}
                                users={users}
                                onEdit={(data) => handleAction("group", data, "details")}
                                onManageMembers={(data) => handleAction("group", data, "members")}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <NotificationDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                mode={drawerMode}
                groups={initialGroups}
                users={users}
                editingData={editingData}
                initialGroupTab={initialGroupTab}
            />
        </div>
    )
}
