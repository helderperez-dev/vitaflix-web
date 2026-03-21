"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { deleteLeadAction } from "@/app/actions/leads"
import { useTranslations } from "next-intl"
import { Database } from "@/types/database.types"
import { usePostHog } from "@posthog/next"

type Lead = Database['public']['Tables']['leads']['Row']

interface LeadActionsProps {
    lead: Lead
    onEdit: (lead: Lead) => void
    onDelete?: (leadId: string) => void
}

export function LeadActions({ lead, onEdit, onDelete }: LeadActionsProps) {
    const posthog = usePostHog()
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
    const commonT = useTranslations("Common")

    async function handleDelete() {
        if (!lead.id) return

        setIsDeleting(true)
        try {
            const result = await deleteLeadAction(lead.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(commonT("deletedSuccessfully"))
                posthog.capture("lead_deleted", { lead_id: lead.id, lead_name: lead.name, source: lead.source })
                onDelete?.(lead.id)
            }
        } catch (error) {
            toast.error(commonT("errorSaving"))
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
                        className="h-9 w-9 p-0 rounded-lg hover:bg-primary/5 hover:text-primary transition-all active:scale-95 group"
                        disabled={isDeleting}
                    >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-48 p-1.5 rounded-lg shadow-2xl border-sidebar-border/50 backdrop-blur-xl bg-background/90 animate-in fade-in-0 zoom-in-95"
                >
                    <DropdownMenuItem
                        onSelect={() => onEdit(lead)}
                        className="rounded-lg text-[10px] font-bold capitalize tracking-wider py-2.5 px-3 cursor-pointer"
                    >
                        {commonT("editDetails")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => setShowDeleteConfirm(true)}
                        className="rounded-lg text-[10px] font-bold capitalize tracking-wider py-2.5 px-3 cursor-pointer text-destructive focus:text-destructive"
                    >
                        {commonT("delete")}
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
