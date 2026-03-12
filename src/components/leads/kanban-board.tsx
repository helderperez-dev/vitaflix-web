"use client"

import * as React from "react"
import { Database } from "@/types/database.types"
import { motion } from "framer-motion"
import { Mail, Phone, Calendar, GripVertical } from "lucide-react"
import { updateLeadStepAction } from "@/app/actions/leads"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { LeadActions } from "./lead-actions"
import { cn } from "@/lib/utils"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Funnel = Database['public']['Tables']['lead_funnels']['Row'] & {
    lead_funnel_steps: Database['public']['Tables']['lead_funnel_steps']['Row'][]
}
type Lead = Database['public']['Tables']['leads']['Row']

interface KanbanBoardProps {
    funnel: Funnel
    leads: Lead[]
    onLeadStepChange: (leadId: string, stepId: string) => void
    onLeadClick?: (lead: Lead) => void
    onDeleteLead?: (leadId: string) => void
}


const TILT_ANGLE = 2

function SortableLeadCard({ lead, onLeadClick, onDeleteLead, isOverlay = false }: { lead: Lead, onLeadClick?: (lead: Lead) => void, onDeleteLead?: (leadId: string) => void, isOverlay?: boolean }) {
    const tLeads = useTranslations("Leads")
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id,
        data: {
            type: 'Lead',
            lead,
        },
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    const cardContent = (
        <div
            className={cn(
                "bg-white dark:bg-slate-900 p-4 rounded-lg border border-border/40 transition-all flex flex-col gap-3 relative overflow-hidden",
                isOverlay ? "shadow-2xl ring-1 ring-primary/10 cursor-grabbing" : "shadow-none cursor-grab active:cursor-grabbing hover:border-border/60",
                isDragging && !isOverlay && "opacity-30 border-dashed border-primary/20 bg-primary/2",
                isOverlay && "scale-[1.03]"
            )}
            style={isOverlay ? { transform: `rotate(${TILT_ANGLE}deg)` } : undefined}
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
                {!isOverlay && (
                    <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-all absolute top-2 right-2">
                        <LeadActions
                            lead={lead}
                            onEdit={(l) => onLeadClick?.(l)}
                            onDelete={() => onDeleteLead?.(lead.id)}
                        />
                    </div>
                )}
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
                <Badge variant="secondary" className="text-[9px] capitalize font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-none shadow-none">
                    {lead.source || tLeads("direct")}
                </Badge>
                {!isOverlay && (
                    <div className="flex items-center opacity-20 group-hover:opacity-40 transition-opacity">
                        <GripVertical className="size-3.5 text-muted-foreground" />
                    </div>
                )}
            </div>
        </div>
    )

    if (isOverlay) return cardContent

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onLeadClick?.(lead)}
            className="group outline-none"
        >
            {cardContent}
        </div>
    )
}

function KanbanColumn({ id, title, color, leads, onLeadClick, onDeleteLead }: { id: string, title: string, color?: string | null, leads: Lead[], onLeadClick?: (lead: Lead) => void, onDeleteLead?: (leadId: string) => void }) {
    const tLeads = useTranslations("Leads")
    const {
        setNodeRef,
        isOver
    } = useSortable({
        id,
        data: {
            type: 'Column',
        },
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-shrink-0 w-80 bg-slate-50/50 dark:bg-white/[0.01] rounded-3xl flex flex-col max-h-full border border-border/40 transition-colors duration-200",
                isOver && "border-primary/20 bg-primary/[0.02]"
            )}
        >
            <div className="p-5 border-b border-border/40 flex items-center justify-between bg-white dark:bg-slate-900/50 rounded-t-3xl">
                <div className="flex items-center gap-3">
                    <div className="size-2 rounded-lg shadow-[0_0_12px_rgba(0,0,0,0.1)]" style={{ backgroundColor: color || '#cbd5e1' }} />
                    <h3 className="font-bold text-[13px] capitalize tracking-wider text-secondary dark:text-white">{title}</h3>
                </div>
                <Badge className="rounded-lg px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-none">{leads.length}</Badge>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 min-h-[400px]">
                <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    {leads.map(lead => (
                        <SortableLeadCard key={lead.id} lead={lead} onLeadClick={onLeadClick} onDeleteLead={onDeleteLead} />
                    ))}
                </SortableContext>
                {leads.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-[11px] font-medium text-muted-foreground/40 text-center p-8 border-2 border-dashed border-border/10 rounded-lg m-2 bg-white/30 dark:bg-transparent transition-opacity duration-200">
                        <div className="size-10 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-3">
                            <GripVertical className="size-4 opacity-20" />
                        </div>
                        {tLeads("dropLeadsHere")}
                    </div>
                )}
            </div>
        </div>
    )
}

export function KanbanBoard({ funnel, leads: initialLeads, onLeadStepChange, onLeadClick, onDeleteLead }: KanbanBoardProps) {
    const tLeads = useTranslations("Leads")
    const [mounted, setMounted] = React.useState(false)
    const [leads, setLeads] = React.useState<Lead[]>(initialLeads)
    const [activeLead, setActiveLead] = React.useState<Lead | null>(null)
    const scrollContainerRef = React.useRef<HTMLDivElement>(null)
    const [isDraggingScroll, setIsDraggingScroll] = React.useState(false)
    const [startX, setStartX] = React.useState(0)
    const [scrollLeft, setScrollLeft] = React.useState(0)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only allow dragging on the container itself or non-interactive background elements
        const target = e.target as HTMLElement
        if (target.closest('button') || target.closest('a') || target.closest('[data-no-dnd="true"]')) return

        setIsDraggingScroll(true)
        if (scrollContainerRef.current) {
            setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
            setScrollLeft(scrollContainerRef.current.scrollLeft)
        }
    }

    const handleMouseLeave = () => {
        setIsDraggingScroll(false)
    }

    const handleMouseUp = () => {
        setIsDraggingScroll(false)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingScroll || activeLead || !scrollContainerRef.current) return
        e.preventDefault()
        const x = e.pageX - scrollContainerRef.current.offsetLeft
        const walk = (x - startX) * 2 // Scroll speed multiplier
        scrollContainerRef.current.scrollLeft = scrollLeft - walk
    }

    React.useEffect(() => {
        setLeads(initialLeads)
    }, [initialLeads])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const activeData = active.data.current
        if (activeData?.type === 'Lead') {
            setActiveLead(activeData.lead)
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        const isActiveALead = active.data.current?.type === 'Lead'
        const isOverALead = over.data.current?.type === 'Lead'
        const isOverAColumn = over.data.current?.type === 'Column'

        if (!isActiveALead) return

        // 1. Dropping a lead over another lead
        if (isActiveALead && isOverALead) {
            setLeads((prev) => {
                const activeIndex = prev.findIndex((l) => l.id === activeId)
                const overIndex = prev.findIndex((l) => l.id === overId)
                const activeLead = prev[activeIndex]
                const overLead = prev[overIndex]

                if (activeLead && overLead && activeLead.step_id !== overLead.step_id) {
                    activeLead.step_id = overLead.step_id
                    return arrayMove(prev, activeIndex, overIndex)
                }

                return arrayMove(prev, activeIndex, overIndex)
            })
        }

        // 2. Dropping a lead over a column
        if (isActiveALead && isOverAColumn) {
            setLeads((prev) => {
                const activeIndex = prev.findIndex((l) => l.id === activeId)
                const activeLead = prev[activeIndex]
                if (activeLead) {
                    const targetStepId = overId === 'unassigned' ? null : String(overId)
                    if (activeLead.step_id !== targetStepId) {
                        activeLead.step_id = targetStepId
                        return arrayMove(prev, activeIndex, activeIndex)
                    }
                }
                return prev
            })
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveLead(null)

        if (!over) return

        const activeId = String(active.id)
        const overId = String(over.id)

        const activeLead = leads.find(l => l.id === activeId)
        if (!activeLead) return

        const targetStepId = isNaN(Number(overId)) && overId !== 'unassigned'
            ? activeLead.step_id
            : (overId === 'unassigned' ? null : overId)

        // Find final step_id based on drop position
        const finalLead = leads.find(l => l.id === activeId)
        if (finalLead) {
            onLeadStepChange(activeId, finalLead.step_id as any)
            await updateLeadStepAction(activeId, finalLead.step_id)
        }
    }

    if (!mounted) return (
        <div className="flex gap-6 h-full overflow-x-auto px-10 pb-10 pt-8 items-start opacity-50">
            <div className="flex-shrink-0 w-80 h-[600px] bg-slate-50 dark:bg-white/5 rounded-3xl" />
            <div className="flex-shrink-0 w-80 h-[600px] bg-slate-50 dark:bg-white/5 rounded-3xl" />
        </div>
    )

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={cn(
                    "flex gap-6 h-full overflow-x-auto px-10 pb-10 pt-8 custom-scrollbar items-start select-none",
                    isDraggingScroll ? "cursor-grabbing" : "cursor-default"
                )}
            >
                <KanbanColumn
                    id="unassigned"
                    title={tLeads("newLead")}
                    leads={leads.filter(l => !l.step_id)}
                    onLeadClick={onLeadClick}
                    onDeleteLead={onDeleteLead}
                />

                {funnel.lead_funnel_steps.map((step: Database['public']['Tables']['lead_funnel_steps']['Row']) => (
                    <KanbanColumn
                        key={step.id}
                        id={step.id}
                        title={step.name}
                        color={step.color}
                        leads={leads.filter(l => l.step_id === step.id)}
                        onLeadClick={onLeadClick}
                        onDeleteLead={onDeleteLead}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: '0.4',
                        },
                    },
                }),
            }}>
                {activeLead ? (
                    <SortableLeadCard lead={activeLead} isOverlay />
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
