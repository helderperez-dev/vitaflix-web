"use client"

import * as React from "react"
import { Database } from "@/types/database.types"
import { motion } from "framer-motion"
import { Mail, Phone, Calendar, MoreVertical, GripVertical } from "lucide-react"
import { updateLeadStepAction } from "@/app/actions/leads"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { LeadActions } from "./lead-actions"

type Funnel = Database['public']['Tables']['lead_funnels']['Row'] & {
    lead_funnel_steps: Database['public']['Tables']['lead_funnel_steps']['Row'][]
}
type Lead = Database['public']['Tables']['leads']['Row']

interface KanbanBoardProps {
    funnel: Funnel
    leads: Lead[]
    onLeadStepChange: (leadId: string, stepId: string) => void
    onLeadClick?: (lead: Lead) => void
}

export function KanbanBoard({ funnel, leads, onLeadStepChange, onLeadClick }: KanbanBoardProps) {
    const tLeads = useTranslations("Leads")
    const defaultStepId = "unassigned"

    // Group leads by step
    const columns = funnel.lead_funnel_steps.map(step => ({
        ...step,
        leads: leads.filter(l => l.step_id === step.id)
    }))

    const unassignedLeads = leads.filter(l => !l.step_id)

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        e.dataTransfer.setData("leadId", leadId)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (e: React.DragEvent, stepId: string) => {
        e.preventDefault()
        const leadId = e.dataTransfer.getData("leadId")
        if (!leadId) return

        const targetStepId = stepId === defaultStepId ? null : stepId
        const lead = leads.find(l => l.id === leadId)
        if (lead && lead.step_id !== targetStepId) {
            onLeadStepChange(leadId, targetStepId as any)
            await updateLeadStepAction(leadId, targetStepId)
        }
    }

    const renderLeadCard = (lead: Lead) => (
        <motion.div
            layoutId={lead.id}
            key={lead.id}
            draggable
            onDragStart={(e: any) => handleDragStart(e, lead.id)}
            onClick={() => onLeadClick?.(lead)}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-border/40 cursor-grab active:cursor-grabbing hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group flex flex-col gap-3 relative overflow-hidden active:scale-[0.98]"
        >

            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground dark:text-white leading-none truncate pr-4">{lead.name}</h4>
                    <div className="flex items-center gap-1.5 mt-2">
                        <Calendar className="size-3 text-muted-foreground/40" />
                        <span className="text-[10px] text-muted-foreground font-semibold">
                            {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-all absolute top-2 right-2">
                    <LeadActions
                        lead={lead}
                        onEdit={(l) => onLeadClick?.(l)}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-1">
                {lead.email && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                        <div className="size-5 rounded-md bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <Mail className="size-3 opacity-60" />
                        </div>
                        <span className="truncate">{lead.email}</span>
                    </div>
                )}
                {lead.phone && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                        <div className="size-5 rounded-md bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <Phone className="size-3 opacity-60" />
                        </div>
                        <span>{lead.phone}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-1 pt-3 border-t border-border/20">
                <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-none shadow-none">
                    {lead.source || tLeads("direct")}
                </Badge>
                <div className="flex items-center opacity-20 group-hover:opacity-40 transition-opacity">
                    <GripVertical className="size-3.5 text-muted-foreground" />
                </div>
            </div>
        </motion.div>
    )

    return (
        <div className="flex gap-6 h-full overflow-x-auto px-10 pb-10 pt-8 custom-scrollbar items-start">
            {/* New / Unassigned Column */}
            <div
                className="flex-shrink-0 w-80 bg-slate-50/50 dark:bg-white/[0.01] rounded-3xl flex flex-col max-h-full border border-border/40 shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, defaultStepId)}
            >
                <div className="p-5 border-b border-border/40 flex items-center justify-between bg-white dark:bg-slate-900/50 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-slate-300 dark:bg-slate-700 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                        <h3 className="font-bold text-[13px] uppercase tracking-wider text-muted-foreground">{tLeads("newLead")}</h3>
                    </div>
                    <Badge className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-none">{unassignedLeads.length}</Badge>
                </div>
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 min-h-[200px]">
                    {unassignedLeads.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-[11px] font-medium text-muted-foreground/40 text-center p-8 border-2 border-dashed border-border/20 rounded-2xl m-2 bg-white/30 dark:bg-transparent">
                            <div className="size-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-3">
                                <GripVertical className="size-4 opacity-20" />
                            </div>
                            {tLeads("dropLeadsHere")}
                        </div>
                    )}
                    {unassignedLeads.map(renderLeadCard)}
                </div>
            </div>

            {/* Funnel Steps Columns */}
            {columns.map(col => (
                <div
                    key={col.id}
                    className="flex-shrink-0 w-80 bg-slate-50/50 dark:bg-white/[0.01] rounded-3xl flex flex-col max-h-full border border-border/40 shadow-sm"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                >
                    <div className="p-5 border-b border-border/40 flex items-center justify-between bg-white dark:bg-slate-900/50 rounded-t-3xl">
                        <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]" style={{ backgroundColor: col.color || '#primary' }} />
                            <h3 className="font-bold text-[13px] uppercase tracking-wider text-secondary dark:text-white">{col.name}</h3>
                        </div>
                        <Badge className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-none">{col.leads.length}</Badge>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 min-h-[200px]">
                        {col.leads.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-[11px] font-medium text-muted-foreground/40 text-center p-8 border-2 border-dashed border-border/20 rounded-2xl m-2 bg-white/30 dark:bg-transparent opacity-50">
                                <div className="size-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-3">
                                    <GripVertical className="size-4 opacity-20" />
                                </div>
                                {tLeads("dropLeadsHere")}
                            </div>
                        )}
                        {col.leads.map(renderLeadCard)}
                    </div>
                </div>
            ))}
        </div>
    )
}
