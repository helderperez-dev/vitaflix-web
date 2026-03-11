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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslations } from "next-intl"

interface UserActionsProps {
    user: UserProfile
    onEdit: (user: UserProfile) => void
}

export function UserActions({ user, onEdit }: UserActionsProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
    const commonT = useTranslations("Common")

    async function handleDelete() {
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
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-9 w-9 p-0 rounded-lg hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
                        disabled={isDeleting}
                    >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-56 p-1.5 rounded-lg shadow-2xl border-sidebar-border/50 backdrop-blur-xl bg-background/90 animate-in fade-in-0 zoom-in-95"
                >
                    <DropdownMenuItem
                        onSelect={() => onEdit(user)}
                        className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer"
                    >
                        Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => setShowDeleteConfirm(true)}
                        className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer text-destructive focus:text-destructive"
                    >
                        Delete User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="rounded-lg border-sidebar-border/50 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{commonT("confirm")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {commonT("deleteConfirmationLabel")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="font-semibold text-xs h-9">
                            {commonT("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-6"
                        >
                            {commonT("confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
