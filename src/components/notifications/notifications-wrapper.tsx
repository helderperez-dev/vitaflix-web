"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Plus, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BroadcastTab } from "./broadcast-tab"
import { TriggersTab } from "./triggers-tab"
import { GroupsTab } from "./groups-tab"
import { Link } from "@/i18n/routing"

import { NotificationDrawer, type NotificationDrawerMode } from "./notification-drawer"

interface NotificationsWrapperProps {
    initialGroups: any[]
    initialTriggers: any[]
    initialNotifications: any[]
    users: any[]
    isSettingsMode?: boolean
}

type TabValue = "broadcast" | "triggers" | "groups"

export function NotificationsWrapper({ initialGroups, initialTriggers, initialNotifications, users, isSettingsMode }: NotificationsWrapperProps) {
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
        <div className="h-full flex flex-col pt-0 overflow-hidden bg-white dark:bg-background">
            <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                {/* Premium Background Accent */}
                <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-white dark:from-white/[0.03] dark:to-transparent pointer-events-none" />

                <div className="flex flex-col relative z-10 w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-full opacity-80" />
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white leading-none capitalize">
                            {t("title").toLowerCase()}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 ml-0">
                        {isSettingsMode && (
                            <Link href="/settings">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-5 -ml-1 rounded-lg text-muted-foreground/30 hover:text-primary transition-all group"
                                >
                                    <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                                </Button>
                            </Link>
                        )}
                        <p className="text-[11px] font-medium text-muted-foreground/70 dark:text-white/40 max-w-2xl leading-relaxed">
                            {t("description")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10 shrink-0">
                    <div className="flex items-center gap-8 mr-4 border-r border-border/40 pr-8 h-8">
                        {(["broadcast", "triggers", "groups"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "relative pb-1 text-xs font-bold transition-all duration-300 flex items-center gap-1 whitespace-nowrap",
                                    activeTab === tab
                                        ? "text-primary opacity-100"
                                        : "text-muted-foreground/30 hover:text-muted-foreground/60"
                                )}
                            >
                                <span className="capitalize">{t(`tabs.${tab}`).toLowerCase()}</span>
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="notificationTabUnderline"
                                        className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary z-10 rounded-lg"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <Button
                        className="bg-primary hover:bg-primary/95 text-white font-bold transition-all active:scale-95 shadow-sm h-10 px-6 rounded-lg text-[11px] flex items-center gap-2 whitespace-nowrap shrink-0"
                        onClick={() => {
                            const mode = activeTab === "broadcast" ? "broadcast" : activeTab === "triggers" ? "trigger" : "group"
                            handleAction(mode)
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="capitalize">
                            {activeTab === "broadcast" && t("sendBroadcast").toLowerCase()}
                            {activeTab === "triggers" && t("createTrigger").toLowerCase()}
                            {activeTab === "groups" && t("createGroup").toLowerCase()}
                        </span>
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
