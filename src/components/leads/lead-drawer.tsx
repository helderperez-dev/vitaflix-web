"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, User, Phone, Mail, Kanban, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { leadSchema, type Lead } from "@/shared-schemas/lead"
import { upsertLeadAction } from "@/app/actions/leads"
import { cn } from "@/lib/utils"

interface LeadDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead?: Lead | null
    funnels: any[]
}

type DrawerView = "personal" | "pipeline"

export function LeadDrawer({ open, onOpenChange, lead, funnels }: LeadDrawerProps) {
    const t = useTranslations("Leads")
    const commonT = useTranslations("Common")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState<DrawerView>("personal")

    const form = useForm({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            funnel_id: null,
            step_id: null,
            source: "",
            is_archived: false,
        },
    }) as any

    React.useEffect(() => {
        if (open) {
            if (lead) {
                form.reset({
                    ...lead,
                    email: lead.email || "",
                    phone: lead.phone || "",
                    source: lead.source || "",
                    funnel_id: lead.funnel_id || null,
                    step_id: lead.step_id || null,
                })
            } else {
                form.reset({
                    name: "",
                    email: "",
                    phone: "",
                    funnel_id: funnels[0]?.id || null,
                    step_id: null,
                    source: "",
                    is_archived: false,
                })
            }
            setActiveTab("personal")
        }
    }, [lead, form, open, funnels])

    const { errors } = form.formState
    const hasPersonalErrors = !!(errors.name || errors.email || errors.phone)
    const hasPipelineErrors = !!(errors.funnel_id || errors.step_id || errors.source)

    function onInvalid(errs: any) {
        // Switch to the first tab that has an error
        if (errs.name || errs.email || errs.phone) {
            setActiveTab("personal")
        } else if (errs.funnel_id || errs.step_id || errs.source) {
            setActiveTab("pipeline")
        }
        toast.error(commonT("pleaseCheckForm"))
    }

    async function onSubmit(values: any) {
        setIsSubmitting(true)
        try {
            const submissionValues = { ...values }
            if (submissionValues.step_id === "unassigned" || !submissionValues.step_id) {
                submissionValues.step_id = null
            }
            const result = await upsertLeadAction(submissionValues)
            if (result.success) {
                toast.success(lead ? commonT("updatedSuccessfully") : commonT("createdSuccessfully"))
                onOpenChange(false)
            } else {
                toast.error(result.error || commonT("errorSaving"))
            }
        } catch (error) {
            toast.error(commonT("errorSaving"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedFunnelId = form.watch("funnel_id")
    const selectedFunnel = funnels.find(f => f.id === selectedFunnelId)
    const steps = selectedFunnel?.lead_funnel_steps || []

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl p-0 flex flex-col bg-background border-l border-border/40 shadow-2xl">
                {/* High-End Ambient Glow */}
                <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-slate-50 dark:from-white/[0.02] via-transparent to-transparent pointer-events-none -z-10" />

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10 font-sans">
                    <SheetHeader className="px-8 pt-8 pb-6 space-y-4">
                        <div className="space-y-1">
                            <SheetTitle className="text-2xl font-bold tracking-tight text-foreground dark:text-white">
                                {lead ? lead.name : t("addLead")}
                            </SheetTitle>
                            <SheetDescription className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed capitalize tracking-widest">
                                {lead ? t("editLead") : t("description")}
                            </SheetDescription>
                        </div>

                        {/* Premium Sliding Tabs */}
                        <div className="flex items-center gap-8 border-b border-border/40">
                            <button
                                type="button"
                                onClick={() => setActiveTab("personal")}
                                className={cn(
                                    "relative pb-3.5 text-xs font-bold capitalize tracking-widest transition-all duration-300 flex items-center gap-2",
                                    activeTab === "personal"
                                        ? "text-primary"
                                        : "text-muted-foreground/30 hover:text-muted-foreground/50"
                                )}
                            >
                                <User className="size-3.5" />
                                {t("personalInfo")}
                                {hasPersonalErrors && (
                                    <div className="size-1.5 rounded-lg bg-destructive animate-pulse" />
                                )}
                                {activeTab === "personal" && (
                                    <motion.div
                                        layoutId="leadDrawerActiveTab"
                                        className="absolute -bottom-px left-0 right-0 h-[2px] bg-primary z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("pipeline")}
                                className={cn(
                                    "relative pb-3.5 text-xs font-bold capitalize tracking-widest transition-all duration-300 flex items-center gap-2",
                                    activeTab === "pipeline"
                                        ? "text-primary"
                                        : "text-muted-foreground/30 hover:text-muted-foreground/50"
                                )}
                            >
                                <Kanban className="size-3.5" />
                                {t("pipelineInfo")}
                                {hasPipelineErrors && (
                                    <div className="size-1.5 rounded-lg bg-destructive animate-pulse" />
                                )}
                                {activeTab === "pipeline" && (
                                    <motion.div
                                        layoutId="leadDrawerActiveTab"
                                        className="absolute -bottom-px left-0 right-0 h-[2px] bg-primary z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        </div>
                    </SheetHeader>

                    <Form {...form}>
                        <form
                            id="lead-form"
                            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                            className="flex-1 flex flex-col min-h-0 overflow-hidden"
                        >
                            <div className="flex-1 px-8 py-6 overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-8"
                                    >
                                        {activeTab === "personal" ? (
                                            <div className="space-y-8 pb-4">
                                                <div className="space-y-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="name"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground/50 ml-1">{t("tableName")}</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative group">
                                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                                                        <Input placeholder="John Doe" {...field} className="pl-10 h-11 border-border/40 bg-white/50 dark:bg-black/20 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-lg text-sm font-medium" />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground/50 ml-1">{commonT("email")}</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative group">
                                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                                                            <Input placeholder="john@example.com" {...field} className="pl-10 h-11 border-border/40 bg-white/50 dark:bg-black/20 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-lg text-sm font-medium" />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className="text-[10px]" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="phone"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground/50 ml-1">{t("tablePhone")}</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative group">
                                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                                                            <Input placeholder="+351 900 000 000" {...field} className="pl-10 h-11 border-border/40 bg-white/50 dark:bg-black/20 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-lg text-sm font-medium" />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className="text-[10px]" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-8 pb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="funnel_id"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2 text-left">
                                                                <FormLabel className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground/50 ml-1">{t("funnel")}</FormLabel>
                                                                <Select value={field.value || undefined} onValueChange={field.onChange}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-11 border-border/40 bg-white/50 dark:bg-black/20 focus:ring-primary/20 transition-all rounded-lg text-sm font-medium">
                                                                            <SelectValue placeholder={t("selectFunnel")} />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="rounded-lg border-border/40">
                                                                        {funnels.map(f => (
                                                                            <SelectItem key={f.id} value={f.id} className="text-sm font-medium rounded-lg">{f.name}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="step_id"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2 text-left">
                                                                <FormLabel className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground/50 ml-1">{commonT("status")}</FormLabel>
                                                                <Select
                                                                    value={field.value || "unassigned"}
                                                                    onValueChange={(val) => field.onChange(val === "unassigned" ? null : val)}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-11 border-border/40 bg-white/50 dark:bg-black/20 focus:ring-primary/20 transition-all rounded-lg text-sm font-medium">
                                                                            <SelectValue placeholder={t("selectStatus")} />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="rounded-lg border-border/40">
                                                                        <SelectItem value="unassigned" className="text-sm font-medium rounded-lg">{t("unassigned")}</SelectItem>
                                                                        {steps.map((s: any) => (
                                                                            <SelectItem key={s.id} value={s.id} className="text-sm font-medium rounded-lg">{s.name}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name="source"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground/50 ml-1">{t("tableSource")}</FormLabel>
                                                            <FormControl>
                                                                <div className="relative group">
                                                                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                                                    <Input placeholder={t("sourcePlaceholder")} {...field} className="pl-10 h-11 border-border/40 bg-white/50 dark:bg-black/20 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-lg text-sm font-medium" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-[10px]" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <SheetFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-2 bg-muted/5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                >
                                    {commonT("cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {commonT("save")}
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    )
}
