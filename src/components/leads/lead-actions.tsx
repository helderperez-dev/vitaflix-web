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
import { deleteLeadAction } from "@/app/actions/leads"
import { useTranslations } from "next-intl"
import { Database } from "@/types/database.types"

type Lead = Database['public']['Tables']['leads']['Row']

interface LeadActionsProps {
    lead: Lead
    onEdit: (lead: Lead) => void
}

export function LeadActions({ lead, onEdit }: LeadActionsProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)
    const t = useTranslations("Leads")
    const commonT = useTranslations("Common")

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this lead?")) return
        if (!lead.id) return

        setIsDeleting(true)
        try {
            const result = await deleteLeadAction(lead.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Lead deleted")
            }
        } catch (error) {
            toast.error("Failed to delete lead")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-9 w-9 p-0 rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-95 group"
                    disabled={isDeleting}
                >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 p-1.5 rounded-2xl shadow-2xl border-sidebar-border/50 backdrop-blur-xl bg-background/90 animate-in fade-in-0 zoom-in-95"
            >
                <DropdownMenuItem
                    onClick={() => onEdit(lead)}
                    className="rounded-lg text-[10px] font-bold uppercase tracking-wider py-2.5 px-3 cursor-pointer"
                >
                    {commonT("editDetails") || "Edit Details"}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="rounded-lg text-[10px] font-bold uppercase tracking-wider py-2.5 px-3 cursor-pointer"
                >
                    {commonT("delete") || "Delete"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
