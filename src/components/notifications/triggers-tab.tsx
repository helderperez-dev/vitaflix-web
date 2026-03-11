"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Zap, BellRing, Mail, Smartphone, MessageSquare, Users, ShieldCheck, MoreHorizontal, Clock, Pencil, Trash2 } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TriggersTab({
    initialTriggers,
    onEdit
}: {
    initialTriggers: any[],
    onEdit?: (data: any) => void
}) {
    const t = useTranslations("Notifications")
    const commonT = useTranslations("Common")

    const columns = React.useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: "name",
            header: ({ column }) => <SortableHeader column={column} title={t("table.name") || "Automation Name"} />,
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[250px]">
                    <span className="font-semibold text-sm truncate">{row.getValue("name")}</span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{row.original.action_type}</span>
                </div>
            ),
            size: 250,
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
            accessorKey: "channels",
            header: ({ column }) => <SortableHeader column={column} title={t("table.channels") || "Channels"} />,
            cell: ({ row }) => {
                const channels = (row.getValue("channels") as string[]) || []
                return (
                    <div className="flex flex-wrap gap-1.5">
                        {channels.map(ch => (
                            <Badge key={ch} variant="outline" className="h-5 px-1.5 text-[9px] font-bold capitalize tracking-tight bg-muted/5 text-muted-foreground/60 border-border/40">
                                {ch === 'app' && <BellRing className="size-2.5 mr-1" />}
                                {ch === 'push' && <Smartphone className="size-2.5 mr-1" />}
                                {ch === 'email' && <Mail className="size-2.5 mr-1" />}
                                {ch === 'sms' && <MessageSquare className="size-2.5 mr-1" />}
                                {ch}
                            </Badge>
                        ))}
                    </div>
                )
            },
            size: 200,
        },
        {
            accessorKey: "is_active",
            header: ({ column }) => <SortableHeader column={column} title={commonT("status")} />,
            cell: ({ row }) => {
                const isActive = row.getValue("is_active") as boolean
                return (
                    <Badge variant="outline" className={cn(
                        "h-5 px-2 text-[9px] font-bold capitalize tracking-tight border-none",
                        isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted/10 text-muted-foreground"
                    )}>
                        {isActive ? "Active" : "Inactive"}
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
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                        <Clock className="size-3" />
                        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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
                                className="h-9 w-9 rounded-lg hover:bg-muted transition-all active:scale-95"
                            >
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-lg border-border/40 p-1.5 min-w-[140px]">
                            <DropdownMenuItem
                                onClick={() => onEdit?.(row.original)}
                                className="rounded-lg text-xs font-medium cursor-pointer"
                            >
                                <Pencil className="size-3.5 mr-2 text-muted-foreground" />
                                {commonT("edit") || "Edit"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="rounded-lg text-xs font-medium cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Trash2 className="size-3.5 mr-2" />
                                {commonT("delete") || "Delete"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ], [t, commonT, onEdit])

    return (
        <div className="h-full flex flex-col">
            <DataTable
                columns={columns}
                data={initialTriggers}
                className="flex-1"
                emptyStateText={t("noTriggers") || "No automated triggers found."}
                onRowClick={(row) => onEdit?.(row)}
            />
        </div>
    )
}
