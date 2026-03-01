"use client"

import * as React from "react"
import { UserPlus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { type UserProfile } from "@/shared-schemas/user"
import { UserDrawer } from "./user-drawer"
import { UserActions } from "./user-actions"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { useQueryState } from "nuqs"
import type { ColumnDef } from "@tanstack/react-table"

interface UserTableWrapperProps {
    initialUsers: any[]
}

export function UserTableWrapper({ initialUsers }: UserTableWrapperProps) {
    const t = useTranslations("Users")
    const commonT = useTranslations("Common")
    const [open, setOpen] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null)
    const [searchQuery, setSearchQuery] = useQueryState("search", { defaultValue: "" })
    const [idParam, setIdParam] = useQueryState("id")

    const data = React.useMemo<UserProfile[]>(() => {
        return initialUsers.map(u => ({
            id: u.id,
            email: u.email,
            displayName: u.display_name,
            genre: u.genre,
            height: u.height,
            weight: u.weight,
            birthday: u.birthday,
            objective: u.objective,
            tmb: u.tmb,
            recommendedKcalIntake: u.recommended_kcal_intake,
            extraDataComplete: u.extra_data_complete || false,
            role: u.role || 'user',
            locale: u.locale || 'en',
            createdAt: u.created_at,
            updatedAt: u.updated_at,
        }))
    }, [initialUsers])


    const columns = React.useMemo<ColumnDef<UserProfile>[]>(() => [
        {
            accessorKey: "displayName",
            header: ({ column }) => <SortableHeader column={column} title={t("table.user")} />,
            cell: ({ row }) => {
                const user = row.original
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-primary/10">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                {user.displayName?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium text-foreground text-sm">{user.displayName || "Anonymous User"}</span>
                            <span className="text-[10px] text-muted-foreground tabular-nums tracking-tight">{user.email}</span>
                        </div>
                    </div>
                )
            },
            size: 300,
        },
        {
            accessorKey: "role",
            header: ({ column }) => <SortableHeader column={column} title={t("table.role")} />,
            cell: ({ row }) => (
                <Badge variant={row.getValue("role") === "admin" ? "default" : "outline"} className="capitalize text-[10px] font-bold">
                    {row.getValue("role")}
                </Badge>
            ),
            size: 100,
        },
        {
            accessorKey: "objective",
            header: ({ column }) => <SortableHeader column={column} title={t("table.goal")} />,
            cell: ({ row }) => {
                const goal = row.getValue("objective") as string
                return (
                    <span className="text-[10px] capitalize font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded tracking-wider">
                        {goal?.replace("_", " ") || "No goal"}
                    </span>
                )
            },
            size: 150,
        },
        {
            accessorKey: "extraDataComplete",
            header: ({ column }) => <SortableHeader column={column} title={t("table.status")} />,
            cell: ({ row }) => (
                row.getValue("extraDataComplete") ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 text-[10px] font-bold border">Full Profile</Badge>
                ) : (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10 text-[10px] font-bold border">Pending Bio</Badge>
                )
            ),
            size: 120,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()} className="flex justify-end pr-2">
                    <UserActions
                        user={row.original}
                        onEdit={(user) => {
                            setSelectedUser(user)
                            setOpen(true)
                        }}
                    />
                </div>
            ),
            size: 50,
        },
    ], [])

    function handleAdd() {
        setSelectedUser(null)
        setOpen(true)
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0 px-8 py-5 border-b border-border/40 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/5 dark:from-primary/20 dark:via-primary/10 dark:to-secondary/20">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold tracking-tight text-secondary dark:text-white dark:drop-shadow-sm leading-none">{t("title")}</h2>
                    <p className="text-xs text-muted-foreground dark:text-white/60 mt-1.5">{t("description")}</p>
                </div>
                <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white font-bold transition-all active:scale-95 shadow-sm shadow-primary/20 h-8 px-4 rounded-md uppercase tracking-widest text-[10px]">
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    {t("addManual")}
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={data}
                globalFilter={searchQuery}
                onGlobalFilterChange={setSearchQuery}
                className="flex-1"
                enableRowSelection={true}
                onRowClick={(row) => {
                    setSelectedUser(row)
                    setOpen(true)
                }}
            />

            <UserDrawer
                open={open}
                onOpenChange={(val) => {
                    setOpen(val)
                    if (!val) {
                        setSelectedUser(null)
                        setIdParam(null)
                    }
                }}
                user={selectedUser}
            />
        </div>
    )
}
