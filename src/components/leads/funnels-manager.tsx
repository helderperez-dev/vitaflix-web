"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Database } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, ArrowLeft, Settings2, Trash2 } from "lucide-react"
import { Link } from "@/i18n/routing"
import { toast } from "sonner"
import { createFunnelAction, deleteFunnelAction, createFunnelStepAction, updateFunnelStepOrderAction } from "@/app/actions/leads"

type Funnel = Database['public']['Tables']['lead_funnels']['Row'] & {
    lead_funnel_steps: Database['public']['Tables']['lead_funnel_steps']['Row'][]
}

export function FunnelsManager({ initialFunnels }: { initialFunnels: Funnel[] }) {
    const t = useTranslations("Common")
    const [funnels, setFunnels] = React.useState<Funnel[]>(initialFunnels)
    const [selectedFunnel, setSelectedFunnel] = React.useState<Funnel | null>(initialFunnels[0] || null)

    // Funnel form
    const [newFunnelName, setNewFunnelName] = React.useState("")
    const [isCreatingFunnel, setIsCreatingFunnel] = React.useState(false)

    // Step form
    const [newStepName, setNewStepName] = React.useState("")
    const [newStepColor, setNewStepColor] = React.useState("#10b981")
    const [isCreatingStep, setIsCreatingStep] = React.useState(false)

    const handleCreateFunnel = async () => {
        if (!newFunnelName.trim()) return
        setIsCreatingFunnel(true)
        const { success, funnel, error } = await createFunnelAction(newFunnelName)
        if (success && funnel) {
            const newF = { ...funnel, lead_funnel_steps: [] }
            setFunnels([...funnels, newF])
            setSelectedFunnel(newF)
            setNewFunnelName("")
            toast.success("Funnel created successfully")
        } else {
            toast.error(error || "Failed to create funnel")
        }
        setIsCreatingFunnel(false)
    }

    const handleDeleteFunnel = async (id: string) => {
        if (!confirm("Are you sure you want to delete this funnel? All leads in it will become unassigned.")) return
        const { success, error } = await deleteFunnelAction(id)
        if (success) {
            setFunnels(funnels.filter(f => f.id !== id))
            if (selectedFunnel?.id === id) setSelectedFunnel(funnels[0] || null)
            toast.success("Funnel deleted")
        } else {
            toast.error(error || "Failed to delete funnel")
        }
    }

    const handleCreateStep = async () => {
        if (!selectedFunnel || !newStepName.trim()) return
        setIsCreatingStep(true)
        const order = selectedFunnel.lead_funnel_steps.length
        const { success, step, error } = await createFunnelStepAction(selectedFunnel.id, newStepName, newStepColor, order)
        if (success && step) {
            const updatedFunnels = funnels.map(f => {
                if (f.id === selectedFunnel.id) {
                    const newF = { ...f, lead_funnel_steps: [...f.lead_funnel_steps, step] }
                    setSelectedFunnel(newF)
                    return newF
                }
                return f
            })
            setFunnels(updatedFunnels)
            setNewStepName("")
            toast.success("Step added")
        } else {
            toast.error(error || "Failed to add step")
        }
        setIsCreatingStep(false)
    }

    const handleUpdateStepOrder = async (up: boolean, index: number) => {
        if (!selectedFunnel) return
        const steps = [...selectedFunnel.lead_funnel_steps]
        if (up && index > 0) {
            const temp = steps[index]
            steps[index] = steps[index - 1]
            steps[index - 1] = temp
        } else if (!up && index < steps.length - 1) {
            const temp = steps[index]
            steps[index] = steps[index + 1]
            steps[index + 1] = temp
        } else {
            return
        }

        // update local state
        const updatedSteps = steps.map((s, i) => ({ ...s, order: i }))
        const updatedFunnels = funnels.map(f => {
            if (f.id === selectedFunnel.id) {
                const newF = { ...f, lead_funnel_steps: updatedSteps }
                setSelectedFunnel(newF)
                return newF
            }
            return f
        })
        setFunnels(updatedFunnels)

        // save to server
        const payload = updatedSteps.map(s => ({ id: s.id, order: s.order }))
        await updateFunnelStepOrderAction(payload)
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/leads">
                            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 rounded-xl text-muted-foreground mr-1">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight">Funnels</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                        Manage your lead boards. A funnel defines the pipeline stages that your leads go through.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-[500px]">
                {/* Funnels List */}
                <div className="md:col-span-1 border rounded-2xl p-4 bg-white/50 flex flex-col gap-4 shadow-sm border-border/40">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 px-1">
                        <Settings2 className="size-3.5" />
                        Pipelines
                    </h3>

                    <div className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                        {funnels.map(f => (
                            <div
                                key={f.id}
                                onClick={() => setSelectedFunnel(f)}
                                className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between group
                                    ${selectedFunnel?.id === f.id
                                        ? 'bg-primary/5 border-primary/20 shadow-sm'
                                        : 'bg-white border-border/40 hover:bg-muted/40 hover:border-border/60'
                                    }
                                `}
                            >
                                <div>
                                    <h4 className={`text-sm font-semibold truncate max-w-[140px] ${selectedFunnel?.id === f.id ? 'text-primary' : 'text-foreground'}`}>{f.name}</h4>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{f.lead_funnel_steps.length} steps</p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteFunnel(f.id)
                                    }}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        ))}

                        {funnels.length === 0 && (
                            <div className="text-center p-4 text-xs text-muted-foreground border-2 border-dashed rounded-xl mt-2">
                                No pipelines created yet.
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-border/40 flex flex-col gap-2 mt-auto">
                        <Input
                            value={newFunnelName}
                            onChange={(e) => setNewFunnelName(e.target.value)}
                            placeholder="New funnel name..."
                            className="bg-white rounded-xl h-9 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFunnel()}
                        />
                        <Button
                            className="w-full h-9 rounded-xl text-xs font-semibold"
                            onClick={handleCreateFunnel}
                            disabled={isCreatingFunnel || !newFunnelName.trim()}
                        >
                            <Plus className="size-3.5 mr-2" />
                            Add Pipeline
                        </Button>
                    </div>
                </div>

                {/* Funnel Steps */}
                <div className="md:col-span-3 border rounded-2xl p-6 bg-white shadow-sm border-border/40 flex flex-col">
                    {selectedFunnel ? (
                        <>
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">{selectedFunnel.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Configure the sequence of steps for this pipeline. The order defines the flow of leads.</p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2 pb-4">
                                {selectedFunnel.lead_funnel_steps.length === 0 ? (
                                    <div className="h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground text-sm bg-muted/20">
                                        <Plus className="size-8 text-muted-foreground/30 mb-2" />
                                        Create your first step to start tracking leads
                                    </div>
                                ) : (
                                    selectedFunnel.lead_funnel_steps.map((step, index) => (
                                        <div key={step.id} className="flex items-center gap-3 p-3 bg-white border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex flex-col gap-0.5 ml-1">
                                                <button
                                                    onClick={() => handleUpdateStepOrder(true, index)}
                                                    disabled={index === 0}
                                                    className="p-1 rounded bg-muted/50 hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                                                >
                                                    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-current" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStepOrder(false, index)}
                                                    disabled={index === selectedFunnel.lead_funnel_steps.length - 1}
                                                    className="p-1 rounded bg-muted/50 hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                                                >
                                                    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-current" />
                                                </button>
                                            </div>

                                            <div className="size-4 rounded-full ml-2 ring-2 ring-background shadow-sm" style={{ backgroundColor: step.color || '#primary' }} />

                                            <div className="flex-1 px-3">
                                                <h4 className="font-bold text-sm">{step.name}</h4>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">Step {index + 1}</p>
                                            </div>

                                            {/* Note: Delete step functionality is omitted for brevity, logic usually re-assigns leads or deletes them */}
                                        </div>
                                    ))
                                )}

                                <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center p-4 bg-muted/20 rounded-xl border border-border/40 border-dashed">
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <div className="shrink-0 font-medium text-sm text-muted-foreground">Color:</div>
                                        <input
                                            type="color"
                                            value={newStepColor}
                                            onChange={(e) => setNewStepColor(e.target.value)}
                                            className="w-8 h-8 rounded border p-0 cursor-pointer overflow-hidden shrink-0"
                                        />
                                    </div>
                                    <Input
                                        value={newStepName}
                                        onChange={(e) => setNewStepName(e.target.value)}
                                        placeholder="E.g., In Negotiation, Contacted, Won..."
                                        className="bg-white rounded-xl h-10 w-full"
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateStep()}
                                    />
                                    <Button
                                        className="h-10 rounded-xl w-full sm:w-auto px-6 whitespace-nowrap"
                                        onClick={handleCreateStep}
                                        disabled={isCreatingStep || !newStepName.trim()}
                                    >
                                        <Plus className="size-4 mr-2" />
                                        Add Stage
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center h-[300px]">
                            <Settings2 className="size-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-bold tracking-tight text-foreground">Select a Pipeline</h3>
                            <p className="text-sm mt-2 max-w-sm">
                                Choose a pipeline from the left sidebar to manage its workflow steps, or create a new one.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
