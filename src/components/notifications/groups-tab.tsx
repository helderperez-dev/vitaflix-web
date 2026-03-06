"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Clock, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function GroupsTab({
    initialGroups,
    users,
    onEdit,
    onManageMembers,
}: {
    initialGroups: any[],
    users: any[],
    onEdit?: (data: any) => void,
    onManageMembers?: (data: any) => void,
}) {
    const t = useTranslations("Notifications")
    const commonT = useTranslations("Common")

    const columns = React.useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: "name",
            header: ({ column }) => <SortableHeader column={column} title={t("table.name") || "Name"} />,
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[250px]">
                    <span className="font-semibold text-sm truncate">{row.getValue("name")}</span>
                    {row.original.description && (
                        <span className="text-[10px] text-muted-foreground/60 line-clamp-1">{row.original.description}</span>
                    )}
                </div>
            ),
            size: 300,
        },
        {
            id: "members",
            header: ({ column }) => <SortableHeader column={column} title={t("table.members") || "Members"} />,
            cell: ({ row }) => (
                <Badge variant="outline" className="h-5 px-2 text-[10px] font-bold bg-muted/10 text-muted-foreground/80 border-none">
                    {row.original.member_count ?? "-"}
                </Badge>
            ),
            size: 150,
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
                <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-end pr-4">
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
                data={initialGroups}
                className="flex-1"
                emptyStateText={t("noGroups") || "No user groups found."}
                onRowClick={(row) => onEdit?.(row)}
            />
        </div>
    )
}
