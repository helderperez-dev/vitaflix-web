"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, LayoutGrid, Kanban, Search, Filter, Settings2, Loader2, ChevronRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database } from "@/types/database.types"
import { getLeadsAction } from "@/app/actions/leads"
import { toast } from "sonner"
import { KanbanBoard } from "@/components/leads/kanban-board"
import { LeadsDatagrid } from "@/components/leads/leads-datagrid"
import { LeadDrawer } from "@/components/leads/lead-drawer"
import { motion } from "framer-motion"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useQueryState } from "nuqs"
import { cn } from "@/lib/utils"

type Funnel = Database['public']['Tables']['lead_funnels']['Row'] & {
    lead_funnel_steps: Database['public']['Tables']['lead_funnel_steps']['Row'][]
}
type Lead = Database['public']['Tables']['leads']['Row']

interface LeadsManagerProps {
    initialFunnels: Funnel[]
    initialLeads: Lead[]
    userProfile?: any
}

export function LeadsManager({ initialFunnels, initialLeads, userProfile }: LeadsManagerProps) {
    const locale = useLocale()
    const tLeads = useTranslations("Leads")
    const isPt = locale.startsWith("pt")
    const [funnels, setFunnels] = React.useState<Funnel[]>(initialFunnels)
    const [leads, setLeads] = React.useState<Lead[]>(initialLeads)
    const [activeFunnelId, setActiveFunnelId] = React.useState<string>('all')
    const [viewMode, setViewMode] = React.useState<"kanban" | "datagrid">("kanban")
    const [searchQuery, setSearchQuery] = useQueryState("search", { defaultValue: "" })
    const [isLoading, setIsLoading] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
    const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)

    const activeFunnel = funnels.find(f => f.id === activeFunnelId)
    // For Kanban, if 'all' is selected, default to showing the first funnel's pipeline
    const kanbanFunnel = activeFunnel || funnels[0]

    const handleAddLead = () => {
        setSelectedLead(null)
        setIsDrawerOpen(true)
    }

    const handleEditLead = (lead: Lead) => {
        setSelectedLead(lead)
        setIsDrawerOpen(true)
    }

    // Refresh leads when funnel changes
    React.useEffect(() => {
        let isMounted = true;

        async function fetchLeads() {
            setIsLoading(true);
            // Pass undefined to get all leads when 'all' is selected
            const { leads: newLeads, success, error } = await getLeadsAction(activeFunnelId === 'all' ? undefined : activeFunnelId);
            if (isMounted) {
                if (success) {
                    setLeads(newLeads || []);
                } else {
                    toast.error(error || (isPt ? "Falha ao carregar leads" : "Failed to load leads"));
                }
                setIsLoading(false);
            }
        }

        fetchLeads();

        return () => { isMounted = false };
    }, [activeFunnelId, isPt]);

    const filteredLeads = React.useMemo(() => {
        if (!searchQuery) return leads
        return leads.filter(l =>
            l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.phone?.includes(searchQuery)
        )
    }, [leads, searchQuery])

    const handleLeadStepChange = (leadId: string, stepId: string) => {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, step_id: stepId === 'unassigned' ? null : stepId } : l))
    }

    const handleDeleteLead = (leadId: string) => {
        setLeads(prev => prev.filter(l => l.id !== leadId))
    }

    const handleBulkDelete = (leadIds: string[]) => {
        setLeads(prev => prev.filter(l => !leadIds.includes(l.id)))
    }

    // Only show empty state when there are no funnels at all
    if (funnels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                <Settings2 className="size-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold tracking-tight">{tLeads("noFunnels")}</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-6">
                    {tLeads("noFunnelsDesc")}
                </p>
                <Link href="/leads/funnels">
                    <Button className="">
                        <Plus className="size-4 mr-2" />
                        {tLeads("createFunnel")}
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header with Premium Style */}
            <div className="flex justify-between items-center shrink-0 px-10 py-8 border-b border-border/40 bg-white dark:bg-background relative overflow-hidden">
                {/* Premium Background Accent */}
                <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-50 to-white dark:from-white/[0.02] dark:to-transparent pointer-events-none" />

                <div className="flex flex-col relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-lg opacity-80" />
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white leading-none">
                            {tLeads("title")}
                        </h2>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground/70 dark:text-white/40 mt-2.5 ml-4">
                        {tLeads("description")}
                    </p>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="flex items-center gap-8 mr-4 border-r border-border/40 pr-8 h-8">
                        <button
                            type="button"
                            onClick={() => setViewMode("kanban")}
                            className={cn(
                                "relative pb-1 text-[11px] font-bold transition-all duration-300 flex items-center gap-1",
                                viewMode === "kanban"
                                    ? "text-primary"
                                    : "text-muted-foreground/30 hover:text-muted-foreground/60"
                            )}
                        >
                            {tLeads("kanban")}
                            {mounted && viewMode === "kanban" && (
                                <motion.div
                                    layoutId="leadsViewMode"
                                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary z-10 rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("datagrid")}
                            className={cn(
                                "relative pb-1 text-[11px] font-bold transition-all duration-300 flex items-center gap-1",
                                viewMode === "datagrid"
                                    ? "text-primary"
                                    : "text-muted-foreground/30 hover:text-muted-foreground/60"
                            )}
                        >
                            {tLeads("datagrid")}
                            {mounted && viewMode === "datagrid" && (
                                <motion.div
                                    layoutId="leadsViewMode"
                                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary z-10 rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-muted-foreground/40 hover:text-primary active:scale-95"
                                >
                                    <Filter className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-lg shadow-2xl border-border/40 backdrop-blur-xl bg-background/90 animate-in fade-in-0 zoom-in-95">
                                <DropdownMenuLabel className="text-[10px] capitalize font-bold tracking-widest text-muted-foreground/60 px-3 py-2">
                                    {tLeads("pipelineFilter")}
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => setActiveFunnelId('all')}
                                    className={cn(
                                        "rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer transition-colors",
                                        activeFunnelId === 'all' ? "bg-primary/5 text-primary" : "text-foreground"
                                    )}
                                >
                                    <LayoutGrid className="size-3.5 mr-2 opacity-60" />
                                    {tLeads("allFunnels")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/40 mx-1.5 my-1" />
                                <DropdownMenuLabel className="text-[10px] capitalize font-bold tracking-widest text-muted-foreground/60 px-3 py-2">
                                    {tLeads("activeFunnels")}
                                </DropdownMenuLabel>
                                {funnels.map(f => (
                                    <DropdownMenuItem
                                        key={f.id}
                                        onClick={() => setActiveFunnelId(f.id)}
                                        className={cn(
                                            "rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer transition-colors",
                                            activeFunnelId === f.id ? "bg-primary/5 text-primary" : "text-foreground"
                                        )}
                                    >
                                        <div className="size-2 rounded-lg mr-2" style={{ backgroundColor: f.lead_funnel_steps[0]?.color || undefined }} />
                                        {f.name}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator className="bg-border/40 mx-1.5 my-1" />
                                <Link href="/leads/funnels" className="w-full">
                                    <DropdownMenuItem className="rounded-lg text-[11px] font-semibold py-2.5 px-3 cursor-pointer text-primary bg-primary/5 hover:bg-primary/10">
                                        <Filter className="size-3.5 mr-2" />
                                        {tLeads("manageFunnels")}
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Button className="h-10 bg-primary hover:bg-primary/95 text-white font-semibold text-xs transition-all active:scale-95 shadow-none px-6 flex items-center gap-2.5" onClick={handleAddLead}>
                        <Plus className="h-4 w-4" />
                        {tLeads("addLead")}
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative flex flex-col">
                {/* Background decorative elements to match premium feel */}
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-slate-50/50 dark:from-white/[0.02] to-transparent pointer-events-none" />
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                ) : viewMode === "kanban" && kanbanFunnel ? (
                    <KanbanBoard
                        funnel={kanbanFunnel}
                        leads={filteredLeads}
                        onLeadStepChange={handleLeadStepChange}
                        onLeadClick={handleEditLead}
                        onDeleteLead={handleDeleteLead}
                    />
                ) : (
                    <LeadsDatagrid
                        funnels={funnels}
                        activeFunnelId={activeFunnelId}
                        leads={filteredLeads}
                        onRowClick={handleEditLead}
                        onDeleteLead={handleDeleteLead}
                        onBulkDelete={handleBulkDelete}
                        userProfile={userProfile}
                    />
                )}
            </div>

            <LeadDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                lead={selectedLead}
                funnels={funnels}
            />
        </div>
    )
}
