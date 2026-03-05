"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { BellRing, Mail, Smartphone, MessageSquare, Clock, Eye, MoreHorizontal, FileText, Pencil, Trash2 } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function BroadcastTab({
    groups,
    notifications,
    onView
}: {
    groups: any[],
    notifications: any[],
    onView?: (data: any) => void
}) {
    const t = useTranslations("Notifications")
    const commonT = useTranslations("Common")

    const columns = React.useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: "title",
            header: ({ column }) => <SortableHeader column={column} title={t("subject")} />,
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[300px]">
                    <span className="font-semibold text-sm truncate">{row.getValue("title")}</span>
                    <span className="text-[10px] text-muted-foreground/60 line-clamp-1">{row.original.body}</span>
                </div>
            ),
            size: 350,
        },
        {
            accessorKey: "type",
            header: ({ column }) => <SortableHeader column={column} title={t("type")} />,
            cell: ({ row }) => {
                const type = row.getValue("type") as string || "marketing"
                return (
                    <Badge variant="outline" className="capitalize text-[9px] h-5 px-1.5 border-none bg-muted/10 text-muted-foreground/80 font-bold tracking-tight">
                        {t(type)}
                    </Badge>
                )
            },
            size: 120,
        },
        {
            accessorKey: "channel",
            header: ({ column }) => <SortableHeader column={column} title={t("channel") || "Channel"} />,
            cell: ({ row }) => {
                const channel = row.getValue("channel") as string
                return (
                    <div className="flex items-center gap-1.5 text-muted-foreground/80 font-medium text-[11px] uppercase tracking-tight">
                        {channel === 'app' && <BellRing className="size-3 text-muted-foreground/60" />}
                        {channel === 'push' && <Smartphone className="size-3 text-muted-foreground/60" />}
                        {channel === 'email' && <Mail className="size-3 text-muted-foreground/60" />}
                        {channel === 'sms' && <MessageSquare className="size-3 text-muted-foreground/60" />}
                        {t(`channels.${channel}`)}
                    </div>
                )
            },
            size: 150,
        },
        {
            accessorKey: "status",
            header: ({ column }) => <SortableHeader column={column} title={commonT("status")} />,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant="outline" className={cn(
                        "capitalize text-[9px] h-5 px-2 border-none font-bold tracking-tight",
                        status === 'sent' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted/10 text-muted-foreground"
                    )}>
                        {status || 'pending'}
                    </Badge>
                )
            },
            size: 100,
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => <SortableHeader column={column} title={commonT("date") || "Date"} />,
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"))
                return (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 font-medium">
                        <Clock className="size-3" />
                        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                )
            },
            size: 150,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()} className="flex justify-end pr-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl hover:bg-muted transition-all active:scale-95"
                            >
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border/40 p-1.5 min-w-[140px]">
                            <DropdownMenuItem
                                onClick={() => onView?.(row.original)}
                                className="rounded-lg text-xs font-medium cursor-pointer"
                            >
                                <Eye className="size-3.5 mr-2 text-muted-foreground" />
                                {t("viewDetails") || "View Details"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
            size: 50,
        }
    ], [t, commonT, onView])

    return (
        <div className="h-full flex flex-col">
            <DataTable
                columns={columns}
                data={notifications}
                className="flex-1"
                onRowClick={onView}
                emptyStateText={t("noNotifications") || "No broadcast history found."}
            />
        </div>
    )
}
