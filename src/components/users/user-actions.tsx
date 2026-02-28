"use client"

import * as React from "react"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteUser } from "@/app/actions/users"
import { type UserProfile } from "@/shared-schemas/user"

interface UserActionsProps {
    user: UserProfile
    onEdit: (user: UserProfile) => void
}

export function UserActions({ user, onEdit }: UserActionsProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    async function handleDelete() {
        if (!confirm("Are you sure? This will delete the user profile. Auth account must be deleted manually from Supabase Dashboard.")) return
        if (!user.id) return

        setIsDeleting(true)
        try {
            const result = await deleteUser(user.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("User profile deleted")
            }
        } catch (error) {
            toast.error("Failed to delete user")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
