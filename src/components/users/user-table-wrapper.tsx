"use client"

import * as React from "react"
import { Plus, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { type UserProfile } from "@/shared-schemas/user"
import { UserDrawer } from "./user-drawer"
import { UserActions } from "./user-actions"

interface UserTableWrapperProps {
    initialUsers: any[]
}

export function UserTableWrapper({ initialUsers }: UserTableWrapperProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null)

    // Map DB underscore to camelCase
    const users: UserProfile[] = initialUsers.map(u => ({
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

    function handleAdd() {
        setSelectedUser(null)
        setOpen(true)
    }

    function handleEdit(user: UserProfile) {
        setSelectedUser(user)
        setOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Active Users</h2>
                    <p className="text-sm text-muted-foreground italic">Monitor and manage user profiles and roles.</p>
                </div>
                <Button onClick={handleAdd} variant="secondary">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Manual Profile
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[300px] font-semibold text-foreground">User</TableHead>
                            <TableHead className="font-semibold text-foreground">Role</TableHead>
                            <TableHead className="font-semibold text-foreground">Goal</TableHead>
                            <TableHead className="font-semibold text-foreground">Status</TableHead>
                            <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-accent/50 transition-colors">
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                {user.displayName?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{user.displayName || "Anonymous User"}</span>
                                            <span className="text-xs text-muted-foreground tabular-nums">{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === "admin" ? "default" : "outline"} className="capitalize">
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm capitalize font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
                                        {user.objective?.replace("_", " ") || "No goal"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {user.extraDataComplete ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">Full Profile</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">Pending Bio</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <UserActions user={user} onEdit={handleEdit} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <UserDrawer
                open={open}
                onOpenChange={setOpen}
                user={selectedUser}
            />
        </div>
    )
}
