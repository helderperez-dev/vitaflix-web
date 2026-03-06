"use client"

import * as React from "react"
import { useTranslations, useLocale } from "next-intl"
import { type ColumnDef } from "@tanstack/react-table"
import { Database } from "@/types/database.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Mail, Phone, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateLeadStepAction, bulkDeleteLeads } from "@/app/actions/leads"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { LeadActions } from "./lead-actions"
import { toast } from "sonner"

type Funnel = Database['public']['Tables']['lead_funnels']['Row'] & {
    lead_funnel_steps: Database['public']['Tables']['lead_funnel_steps']['Row'][]
}
type Lead = Database['public']['Tables']['leads']['Row']

interface LeadsDatagridProps {
    funnels: Funnel[]
    activeFunnelId?: string
    leads: Lead[]
    onRowClick?: (lead: Lead) => void
}

export function LeadsDatagrid({ funnels, activeFunnelId, leads, onRowClick }: LeadsDatagridProps) {
    const t = useTranslations("Common")
    const tLeads = useTranslations("Leads")
    const locale = useLocale()

    const handleStepChange = async (leadId: string, stepId: string) => {
        await updateLeadStepAction(leadId, stepId === 'unassigned' ? null : stepId)
    }

    const columns = React.useMemo<ColumnDef<Lead>[]>(() => [
        {
            accessorKey: "name",
            header: ({ column }) => <SortableHeader column={column} title={tLeads("tableName")} />,
            cell: ({ row }) => (
                <div className="font-semibold text-sm">{row.getValue("name")}</div>
            ),
            size: 200,
        },
        {
            id: "contact",
            header: tLeads("contact"),
            cell: ({ row }) => {
                const lead = row.original
                return (
                    <div className="flex flex-col gap-0.5">
                        {lead.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Mail className="size-3 opacity-50" />
                                <span>{lead.email}</span>
                            </div>
                        )}
                        {lead.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Phone className="size-3 opacity-50" />
                                <span>{lead.phone}</span>
                            </div>
                        )}
                        {!lead.email && !lead.phone && <span className="text-[11px] text-muted-foreground/40 italic">{tLeads("noContactInfo")}</span>}
                    </div>
                )
            },
            size: 220,
        },
        {
            accessorKey: "source",
            header: ({ column }) => <SortableHeader column={column} title={tLeads("tableSource")} />,
            cell: ({ row }) => (
                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-none px-2 py-0.5">
                    {row.getValue("source") || tLeads("direct")}
                </Badge>
            ),
            size: 120,
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => <SortableHeader column={column} title={tLeads("created")} />,
            cell: ({ row }) => (
                <div className="text-[11px] font-mono text-muted-foreground">
                    {new Date(row.getValue("created_at")).toLocaleDateString()}
                </div>
            ),
            size: 120,
        },
        {
            id: "step",
            header: tLeads("pipelineStep"),
            cell: ({ row }) => {
                const lead = row.original
                if (!lead.funnel_id) {
                    return (
                        <Badge variant="secondary" className="text-[10px] font-medium rounded-md bg-slate-100 dark:bg-white/5 text-slate-400 border-none px-2 py-0.5">
                            {tLeads("newLead")}
                        </Badge>
                    )
                }
                const leadFunnel = funnels.find(f => f.id === lead.funnel_id)
                const steps = leadFunnel?.lead_funnel_steps || []
                const currentStep = steps.find(s => s.id === lead.step_id)

                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Select
                            defaultValue={lead.step_id || "unassigned"}
                            onValueChange={(val) => handleStepChange(lead.id, val)}
                        >
                            <SelectTrigger className="h-8 w-[160px] bg-white/50 dark:bg-white/5 border-none text-[10px] font-semibold uppercase tracking-wider transition-all hover:bg-white dark:hover:bg-white/10 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="size-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                                        style={{ backgroundColor: currentStep?.color || "#e2e8f0" }}
                                    />
                                    <SelectValue>
                                        {currentStep?.name || tLeads("unassigned")}
                                    </SelectValue>
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/40 shadow-xl overflow-hidden p-1.5 min-w-[180px]">
                                <SelectItem value="unassigned" className="text-[10px] font-bold uppercase rounded-lg py-2 cursor-pointer">{tLeads("unassigned")}</SelectItem>
                                {steps.map((step) => (
                                    <SelectItem
                                        key={step.id}
                                        value={step.id}
                                        className="text-[10px] font-bold uppercase rounded-lg py-2 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full" style={{ backgroundColor: step.color || '#primary' }} />
                                            {step.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )
            },
            size: 180,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()} className="flex justify-end pr-4">
                    <LeadActions
                        lead={row.original}
                        onEdit={(l) => onRowClick?.(l)}
                    />
                </div>
            ),
            size: 50,
            enableResizing: false,
        }
    ], [funnels, activeFunnelId, locale, onRowClick])

    return (
        <DataTable
            columns={columns as any}
            data={leads}
            className="flex-1"
            emptyStateText={tLeads("noLeads")}
            onRowClick={onRowClick}
            enableRowSelection={true}
            selectionActions={(selectedRows, clearSelection) => (
                <div className="flex items-center gap-6 w-full">
                    <Button
                        variant="ghost"
                        className="h-9 px-4 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground dark:text-white/80 hover:text-foreground dark:hover:text-white transition-all shrink-0"
                        onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${selectedRows.length} leads?`)) {
                                const result = await bulkDeleteLeads(selectedRows.map(r => r.id))
                                if (result.success) {
                                    toast.success(`${selectedRows.length} leads deleted`)
                                    clearSelection()
                                } else {
                                    toast.error(result.error || "Failed to delete leads")
                                }
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({selectedRows.length})
                    </Button>
                </div>
            )}
        />
    )
}

