"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import {
    Loader2, Radio, Zap, Users, Clock,
    User, MapPin, Smartphone, Mail,
    MessageSquare, RefreshCcw, Send,
    Search, Filter, ArrowUpDown, Check,
    BellRing, History, Trash, Edit,
    Plus, X, MoreVertical, Save,
    Trash2, FileText, Image, Paperclip,
    ExternalLink, LayoutTemplate, Braces, Eye,
    Image as ImageIcon, Target, ArrowLeft, Sparkles, AlignLeft
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { sendBroadcastAction, saveTriggerAction, saveGroupAction, saveGroupMembersAction, getGroupMembersAction, retryNotificationAction } from "@/app/actions/notifications"
import { SearchableSelect } from "./searchable-select"
import { PlaceholderSelector } from "./placeholder-selector"
import { RichText } from "@/components/ui/rich-text"
import { ImageUploader } from "@/components/shared/image-uploader"
import { FileUploader } from "@/components/shared/file-uploader"
import { createClient } from "@/lib/supabase/client"

export type NotificationDrawerMode = "broadcast" | "trigger" | "group" | "view-notification"

interface NotificationDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: NotificationDrawerMode
    groups: any[]
    users: any[]
    editingData?: any
    initialGroupTab?: "details" | "members"
}

export function NotificationDrawer({ open, onOpenChange, mode, groups, users, editingData, initialGroupTab = "details" }: NotificationDrawerProps) {
    const t = useTranslations("Notifications")
    const commonT = useTranslations("Common")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isRetrying, setIsRetrying] = React.useState(false)
    const [templates, setTemplates] = React.useState<any[]>([])
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null)
    const [isSavingTemplate, setIsSavingTemplate] = React.useState(false)
    const [designerTab, setDesignerTab] = React.useState<"composer" | "styles" | "preview">("composer")
    const [composerMode, setComposerMode] = React.useState<"html" | "text">("html")
    const [groupTab, setGroupTab] = React.useState<"details" | "members">(initialGroupTab)
    const [groupMembers, setGroupMembers] = React.useState<string[]>([])
    const [isSavingMembers, setIsSavingMembers] = React.useState(false)
    const [memberSearch, setMemberSearch] = React.useState("")
    const supabase = createClient()

    const form = useForm({
        defaultValues: {
            channel: editingData?.channel || "app",
            type: editingData?.type || "marketing",
            targetType: "everyone",
            targetValue: "",
            manualEmail: "",
            manualPhone: "",
            title: editingData?.title || "",
            body: editingData?.body || "",
            html: editingData?.html || "",
            css: editingData?.css || "",
            attachments: editingData?.attachments || [],
        }
    })

    const targetType = form.watch("targetType")
    const channel = form.watch("channel")

    // Fetch templates
    React.useEffect(() => {
        const fetchTemplates = async () => {
            const { data } = await supabase
                .from("notification_templates")
                .select("*")
                .order("name")
            if (data) setTemplates(data)
        }
        if (open) fetchTemplates()
    }, [open])

    // Reset when drawer opens/closes
    React.useEffect(() => {
        if (open) {
            setIsExpanded(false)
            setSelectedTemplateId(null)
            setGroupTab(initialGroupTab)
            setMemberSearch("")
            setGroupMembers([])
            form.reset({
                channel: editingData?.channel || "app",
                type: editingData?.type || "marketing",
                targetType: "everyone",
                targetValue: "",
                manualEmail: "",
                manualPhone: "",
                title: editingData?.title || "",
                body: editingData?.body || "",
                html: editingData?.html || "",
                css: editingData?.css || "",
                attachments: editingData?.attachments || [],
            })
            triggerForm.reset({
                name: editingData?.name || "",
                action_type: editingData?.action_type || "",
                channels: editingData?.channels || ["app"],
                title_template: editingData?.title_template || "",
                body_template: editingData?.body_template || "",
                html_template: editingData?.html_template || "",
                css_template: editingData?.css_template || "",
            })
            groupForm.reset({
                name: editingData?.name || "",
                description: editingData?.description || "",
            })
        }
    }, [open, editingData, form, initialGroupTab])

    // Load group members when editing
    React.useEffect(() => {
        if (open && mode === "group" && editingData?.id) {
            getGroupMembersAction(editingData.id).then(({ members }) => {
                setGroupMembers(members || [])
            })
        }
    }, [open, mode, editingData?.id])

    const triggerForm = useForm({
        defaultValues: {
            name: editingData?.name || "",
            action_type: editingData?.action_type || "",
            channels: editingData?.channels || ["app"],
            title_template: editingData?.title_template || "",
            body_template: editingData?.body_template || "",
            html_template: editingData?.html_template || "",
            css_template: editingData?.css_template || "",
        }
    })

    const groupForm = useForm({
        defaultValues: {
            name: editingData?.name || "",
            description: editingData?.description || "",
        }
    })

    async function onBroadcastSubmit(data: any) {
        setIsSubmitting(true)
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => formData.append(key, v))
            } else if (value) {
                formData.append(key, value as string)
            }
        })

        try {
            const { success, error } = await sendBroadcastAction(formData)
            if (success) {
                toast.success(commonT("createdSuccessfully"))
                onOpenChange(false)
            } else {
                toast.error(error || commonT("errorSaving"))
            }
        } catch (error) {
            toast.error(commonT("errorSaving"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const insertToInput = (fieldName: any, ph: string) => {
        const currentVal = form.getValues(fieldName) || ""
        form.setValue(fieldName, currentVal + ph)
    }

    const loadTemplate = (template: any) => {
        if (mode === "trigger") {
            triggerForm.setValue("title_template", template.subject || "")
            triggerForm.setValue("body_template", template.body || "")
            triggerForm.setValue("html_template", template.html || "")
            triggerForm.setValue("css_template", template.css || "")
            if (template.channel && !triggerForm.getValues("channels").includes(template.channel)) {
                triggerForm.setValue("channels", [...triggerForm.getValues("channels"), template.channel])
            }
        } else {
            form.setValue("title", template.subject || "")
            form.setValue("body", template.body || "")
            form.setValue("html", template.html || "")
            form.setValue("css", template.css || "")
            if (template.channel) form.setValue("channel", template.channel)
            if (template.type) form.setValue("type", template.type)
        }
        setSelectedTemplateId(template.id)
        toast.success(`Template "${template.name}" loaded`)
    }

    const onTriggerSubmit = async (data: any) => {
        setIsSubmitting(true)
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => formData.append(key, v))
            } else if (value) {
                formData.append(key, value as string)
            }
        })

        try {
            const { success, error } = await saveTriggerAction(formData)
            if (success) {
                toast.success(commonT("savedSuccessfully"))
                onOpenChange(false)
            } else {
                toast.error(error || commonT("errorSaving"))
            }
        } catch (err) {
            toast.error(commonT("errorSaving"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const onGroupSubmit = async (data: any) => {
        setIsSubmitting(true)
        const formData = new FormData()
        if (editingData?.id) formData.append("id", editingData.id)
        Object.entries(data).forEach(([key, value]) => {
            if (value) formData.append(key, value as string)
        })

        try {
            const { success, error } = await saveGroupAction(formData)
            if (success) {
                toast.success(commonT("savedSuccessfully"))
                onOpenChange(false)
            } else {
                toast.error(error || commonT("errorSaving"))
            }
        } catch (err) {
            toast.error(commonT("errorSaving"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRetry = async () => {
        if (!editingData?.id) return
        setIsRetrying(true)
        try {
            const { success, error } = await retryNotificationAction(editingData.id)
            if (success) {
                toast.success(commonT("retriedSuccessfully"))
                onOpenChange(false)
            } else {
                toast.error(error || "Retry failed")
            }
        } catch (err) {
            toast.error("Retry failed")
        } finally {
            setIsRetrying(false)
        }
    }

    const saveAsTemplate = async () => {
        const isTrigger = mode === "trigger"
        const activeForm = isTrigger ? triggerForm : form
        const values: any = activeForm.getValues()

        let name = ""
        let isUpdating = !!selectedTemplateId

        if (isUpdating) {
            const existing = templates.find(t => t.id === selectedTemplateId)
            name = existing?.name || ""
        } else {
            const promptedName = prompt("Enter a name for this template")
            if (!promptedName) return
            name = promptedName
        }

        setIsSavingTemplate(true)
        try {
            const templateData = {
                name,
                channel: isTrigger ? (values.channels?.[0] || 'email') : values.channel,
                type: isTrigger ? 'marketing' : values.type,
                subject: isTrigger ? values.title_template : values.title,
                body: isTrigger ? values.body_template : values.body,
                html: isTrigger ? values.html_template : values.html,
                css: isTrigger ? values.css_template : values.css,
            }

            const { data, error } = isUpdating
                ? await supabase.from("notification_templates").update(templateData).eq("id", selectedTemplateId).select().single()
                : await supabase.from("notification_templates").insert(templateData).select().single()

            if (error) throw error

            if (!isUpdating && data) {
                setSelectedTemplateId(data.id)
            }

            toast.success(isUpdating ? "Template updated successfully" : "Template saved successfully")

            // Refresh templates list
            const { data: updated } = await supabase.from("notification_templates").select("*").order("name")
            if (updated) setTemplates(updated)

            // Close designer after save
            setIsExpanded(false)
        } catch (err: any) {
            toast.error(err.message || "Error saving template")
        } finally {
            setIsSavingTemplate(false)
        }
    }

    const renderTemplateSelector = (currentChannel: string, compact: boolean = false) => {
        const recommendedTemplates = templates.filter(t => t.channel === currentChannel)
        const otherTemplates = templates.filter(t => t.channel !== currentChannel)

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "rounded-xl border-border/40 bg-muted/5 focus:bg-background transition-all font-medium justify-between px-4 group shadow-none hover:bg-white",
                            compact ? "w-[200px] h-10 text-[10px] uppercase font-bold bg-muted/20 border-border/60" : "w-full h-10 text-sm"
                        )}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <LayoutTemplate className={cn("shrink-0 transition-colors", compact ? "size-3.5" : "size-4 text-muted-foreground/40 group-hover:text-primary")} />
                            <span className={cn(
                                "transition-colors truncate",
                                selectedTemplateId ? "text-primary font-bold uppercase tracking-tight" : "text-muted-foreground/60"
                            )}>
                                {selectedTemplateId
                                    ? templates.find(t => t.id === selectedTemplateId)?.name
                                    : compact ? "Quick Load..." : t("selectTemplate") || "Select from library..."
                                }
                            </span>
                        </div>
                        <Search className="size-3.5 text-muted-foreground/20 shrink-0" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px] rounded-2xl border-border/40 overflow-hidden shadow-2xl" align={compact ? "end" : "start"}>
                    <Command className="p-0">
                        <CommandInput placeholder="Search templates..." className="h-11 text-[11px] font-medium border-none" />
                        <CommandList className="max-h-[350px] p-2 custom-scrollbar">
                            <CommandEmpty className="py-12 text-center">
                                <Search className="size-10 mx-auto mb-4 text-muted-foreground/10" />
                                <div className="text-[10px] uppercase font-bold text-muted-foreground/30 px-6">
                                    No templates match your search
                                </div>
                            </CommandEmpty>

                            {templates.length === 0 && (
                                <div className="py-12 text-center">
                                    <LayoutTemplate className="size-10 mx-auto mb-4 text-muted-foreground/10" />
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground/30 px-6 leading-relaxed">
                                        Your template library is empty.<br />Create one in the designer.
                                    </div>
                                </div>
                            )}

                            {recommendedTemplates.length > 0 && (
                                <CommandGroup heading={<span className="text-[9px] uppercase font-bold tracking-widest text-primary/60 ml-1">Recommended for {currentChannel}</span>}>
                                    {recommendedTemplates.map((tpl) => (
                                        <CommandItem
                                            key={tpl.id}
                                            value={`${tpl.name} ${tpl.channel}`}
                                            onSelect={() => loadTemplate(tpl)}
                                            className="rounded-xl py-3 px-4 cursor-pointer group transition-all aria-selected:bg-primary/5 mb-1"
                                        >
                                            <div className="flex flex-col gap-0.5 w-full">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold uppercase tracking-tight group-aria-selected:text-primary transition-colors">{tpl.name}</span>
                                                    <Badge variant="outline" className="text-[8px] font-bold uppercase px-1.5 h-4 bg-primary/10 border-none text-primary/80">
                                                        {tpl.channel}
                                                    </Badge>
                                                </div>
                                                <span className="text-[9px] font-medium text-muted-foreground/40 lowercase italic line-clamp-1">{tpl.subject || "No subject"}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {otherTemplates.length > 0 && (
                                <CommandGroup heading={<span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/40 ml-1">Other Templates</span>}>
                                    {otherTemplates.map((tpl) => (
                                        <CommandItem
                                            key={tpl.id}
                                            value={`${tpl.name} ${tpl.channel}`}
                                            onSelect={() => loadTemplate(tpl)}
                                            className="rounded-xl py-3 px-4 cursor-pointer group transition-all aria-selected:bg-muted/10 mb-1 opacity-60 hover:opacity-100"
                                        >
                                            <div className="flex flex-col gap-0.5 w-full">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold uppercase tracking-tight group-aria-selected:text-foreground transition-colors">{tpl.name}</span>
                                                    <Badge variant="outline" className="text-[8px] font-bold uppercase px-1.5 h-4 bg-muted/40 border-none text-muted-foreground/60">
                                                        {tpl.channel}
                                                    </Badge>
                                                </div>
                                                <span className="text-[9px] font-medium text-muted-foreground/40 lowercase italic line-clamp-1">{tpl.subject || "No subject"}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }

    const renderBroadcastForm = () => (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onBroadcastSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                    <div className="flex flex-col gap-8">
                        {/* Template Selection & Designer Entry */}
                        <div className="flex flex-col gap-3">
                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">
                                Notification Template <span className="normal-case opacity-50 ml-1 font-normal">(Optional)</span>
                            </FormLabel>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    {renderTemplateSelector(channel)}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsExpanded(true)}
                                    className="h-10 px-4 rounded-xl border-border/40 bg-white hover:bg-muted/10 text-primary shadow-sm flex-shrink-0 active:scale-95 transition-all"
                                    title="Open Template Designer"
                                >
                                    <LayoutTemplate className="size-4 mr-2" />
                                    <span className="text-xs font-bold">Designer</span>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="channel"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{t("channel")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 rounded-xl border-border/40 bg-muted/5 focus:bg-background transition-all text-sm font-medium">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-border/40">
                                                <SelectItem value="app">
                                                    <span className="flex items-center gap-2 font-medium"><BellRing className="size-4 text-primary" />{t("channels.app")}</span>
                                                </SelectItem>
                                                <SelectItem value="push">
                                                    <span className="flex items-center gap-2 font-medium"><Smartphone className="size-4 text-primary" />{t("channels.push")}</span>
                                                </SelectItem>
                                                <SelectItem value="email">
                                                    <span className="flex items-center gap-2 font-medium"><Mail className="size-4 text-primary" />{t("channels.email")}</span>
                                                </SelectItem>
                                                <SelectItem value="sms">
                                                    <span className="flex items-center gap-2 font-medium"><MessageSquare className="size-4 text-primary" />{t("channels.sms")}</span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{t("type")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 rounded-xl border-border/40 bg-muted/5 focus:bg-background transition-all text-sm font-medium">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-border/40">
                                                <SelectItem value="marketing" className="font-medium text-xs">{t("marketing")}</SelectItem>
                                                <SelectItem value="transactional" className="font-medium text-xs">{t("transactional")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{t("sendTo")}</FormLabel>
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    value={targetType}
                                    onValueChange={(v: any) => form.setValue("targetType", v)}
                                >
                                    <SelectTrigger className="h-10 rounded-xl border-border/40 bg-muted/5 text-sm font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/40">
                                        <SelectItem value="everyone" className="font-medium">{t("everyone")}</SelectItem>
                                        <SelectItem value="group" className="font-medium">Specific Group</SelectItem>
                                        <SelectItem value="specific-user" className="font-medium">Specific User</SelectItem>
                                        <SelectItem value="manual" className="font-medium">Manual Entry</SelectItem>
                                    </SelectContent>
                                </Select>

                                {targetType === "group" && (
                                    <SearchableSelect
                                        options={groups.map(g => ({ value: g.id, label: g.name }))}
                                        value={form.watch("targetValue")}
                                        onValueChange={(v) => form.setValue("targetValue", v)}
                                        placeholder="Select Group"
                                    />
                                )}

                                {targetType === "specific-user" && (
                                    <SearchableSelect
                                        options={users.map(u => ({ value: u.id, label: u.display_name || u.email, secondary: u.email }))}
                                        value={form.watch("targetValue")}
                                        onValueChange={(v) => form.setValue("targetValue", v)}
                                        placeholder="Select User"
                                    />
                                )}
                            </div>
                        </div>

                        {targetType === "manual" && (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                <FormField
                                    control={form.control}
                                    name="manualEmail"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Email Address</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="user@example.com" className="h-10 rounded-xl border-border/40 bg-muted/5 focus:bg-background px-4 text-sm font-medium transition-all" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="manualPhone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Phone Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="+1234567890" className="h-10 rounded-xl border-border/40 bg-muted/5 focus:bg-background px-4 text-sm font-medium transition-all" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{t("subject")}</FormLabel>
                                        <PlaceholderSelector onSelect={(ph) => insertToInput("title", ph)} />
                                    </div>
                                    <FormControl>
                                        <Input {...field} required placeholder="e.g. Special Offer!" className="h-10 rounded-xl border-border/40 bg-muted/5 focus:bg-background px-4 text-sm font-medium transition-all" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {channel === "email" ? (
                            <FormField
                                control={form.control}
                                name="html"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Email Content (HTML)</FormLabel>
                                        <FormControl>
                                            <div className="rounded-xl border border-border/40 overflow-hidden bg-muted/5">
                                                <RichText
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Write your email content here..."
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name="body"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{t("message")}</FormLabel>
                                            <PlaceholderSelector onSelect={(ph) => insertToInput("body", ph)} />
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                required
                                                placeholder="Your message content..."
                                                className="min-h-[150px] rounded-xl border-border/40 bg-muted/5 focus:bg-background p-4 text-sm font-medium resize-none custom-scrollbar transition-all leading-relaxed shadow-none"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="attachments"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2">
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Document Attachments <span className="normal-case opacity-50 ml-1 font-normal">(Optional)</span></FormLabel>
                                    {channel === "email" && (
                                        <FileUploader
                                            folder="notifications/attachments"
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            maxFiles={5}
                                        />
                                    )}
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <SheetFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-2 bg-muted/5">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors">
                        {commonT("cancel")}
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]">
                        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {t("sendNow")}
                    </Button>
                </SheetFooter>
            </form>
        </Form>
    )

    const renderTriggerForm = () => (
        <Form {...triggerForm}>
            <form onSubmit={triggerForm.handleSubmit(onTriggerSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                    <div className="flex flex-col gap-8">
                        {/* Template Selection & Designer Entry (Trigger Mode) */}
                        <div className="flex flex-col gap-3">
                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">
                                Notification Template <span className="normal-case opacity-50 ml-1 font-normal">(Optional)</span>
                            </FormLabel>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    {renderTemplateSelector(triggerForm.getValues().channels?.[0] || 'all')}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsExpanded(true)}
                                    className="h-10 px-4 rounded-xl border-border/40 bg-white hover:bg-muted/10 text-primary shadow-sm flex-shrink-0 active:scale-95 transition-all"
                                    title="Open Template Designer"
                                >
                                    <LayoutTemplate className="size-4 mr-2" />
                                    <span className="text-xs font-bold">Designer</span>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                            <FormField
                                control={triggerForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Automation Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} required placeholder="e.g. Welcome Series" className="h-10 rounded-xl border-border/40 bg-muted/5 focus:bg-background px-4 text-sm font-medium transition-all" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={triggerForm.control}
                                name="action_type"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{t("triggerAction")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} required placeholder="e.g. user_signed_up" className="h-10 rounded-xl border-border/40 bg-muted/5 focus:bg-background px-4 font-mono text-[10px] transition-all" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Enabled Channels</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {['app', 'push', 'email', 'sms'].map(ch => (
                                    <div key={ch} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/5 hover:bg-muted/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {ch === 'app' && <BellRing className="size-4 text-primary" />}
                                            {ch === 'push' && <Smartphone className="size-4 text-primary" />}
                                            {ch === 'email' && <Mail className="size-4 text-primary" />}
                                            {ch === 'sms' && <MessageSquare className="size-4 text-primary" />}
                                            <label htmlFor={`ch-${ch}`} className="text-xs font-bold uppercase tracking-tight cursor-pointer">
                                                {ch}
                                            </label>
                                        </div>
                                        <FormField
                                            control={triggerForm.control}
                                            name="channels"
                                            render={({ field }) => (
                                                <Checkbox
                                                    id={`ch-${ch}`}
                                                    checked={field.value?.includes(ch)}
                                                    onCheckedChange={(checked) => {
                                                        const current = field.value || []
                                                        if (checked) {
                                                            field.onChange([...current, ch])
                                                        } else {
                                                            field.onChange(current.filter((c: string) => c !== ch))
                                                        }
                                                    }}
                                                    className="rounded-md border-border/60 data-[state=checked]:bg-primary"
                                                />
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <FormField
                            control={triggerForm.control}
                            name="title_template"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2">
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t("subject")} Template</FormLabel>
                                    <FormControl>
                                        <Input {...field} required placeholder="Hi {{name}}, welcome!" className="h-10 rounded-xl border-border/40 bg-muted/5 px-4 font-medium" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={triggerForm.control}
                            name="body_template"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2">
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t("message")} Template</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            required
                                            placeholder="Describe your automated message... Use {{variables}}"
                                            className="min-h-[120px] rounded-xl border-border/40 bg-muted/5 p-4 font-medium resize-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {triggerForm.watch("channels")?.includes("email") && (
                            <FormField
                                control={triggerForm.control}
                                name="html_template"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2">
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Email HTML Template</FormLabel>
                                        <FormControl>
                                            <RichText
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Write your email template here..."
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                <SheetFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-2 bg-muted/5">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors">
                        {commonT("cancel")}
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]">
                        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {editingData ? commonT("update") : commonT("save")}
                    </Button>
                </SheetFooter>
            </form>
        </Form>
    )

    const toggleGroupMember = (userId: string) => {
        setGroupMembers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        )
    }

    const handleSaveMembers = async () => {
        if (!editingData?.id) {
            toast.error("Save the group first before managing members.")
            return
        }
        setIsSavingMembers(true)
        try {
            const { success, error } = await saveGroupMembersAction(editingData.id, groupMembers)
            if (success) {
                toast.success("Members updated successfully")
            } else {
                toast.error(error || "Error saving members")
            }
        } catch (err: any) {
            toast.error(err.message || "Error saving members")
        } finally {
            setIsSavingMembers(false)
        }
    }

    const filteredUsers = users.filter(u => {
        const q = memberSearch.toLowerCase()
        return (
            (u.display_name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q)
        )
    })

    const renderGroupForm = () => (
        <Form {...groupForm}>
            <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Tabs */}
                <div className="flex items-center gap-8 px-8 border-b border-border/40">
                    {(["details", "members"] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setGroupTab(tab)}
                            className={cn(
                                "relative py-4 text-[11px] font-bold tracking-wider uppercase transition-all duration-300",
                                groupTab === tab
                                    ? "text-primary"
                                    : "text-muted-foreground/30 hover:text-muted-foreground/60"
                            )}
                        >
                            {tab === "details" ? "Details" : `Members${groupMembers.length > 0 ? ` (${groupMembers.length})` : ""}`}
                            {groupTab === tab && (
                                <motion.div
                                    layoutId="groupTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {groupTab === "details" ? (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar"
                        >
                            <div className="flex flex-col gap-8">
                                <FormField
                                    control={groupForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{t("groupName")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} required placeholder="e.g. Early Adopters, VIPs..." className="h-10 rounded-xl border-border/40 bg-muted/5 focus:bg-background px-4 text-sm font-medium transition-all" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={groupForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Description <span className="normal-case opacity-50 ml-1 font-normal">(Optional)</span></FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Short summary of this user cohort..."
                                                    className="min-h-[120px] rounded-xl border-border/40 bg-muted/5 focus:bg-background p-4 text-sm font-medium resize-none shadow-none transition-all leading-relaxed"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {!editingData && (
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                                        <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <Users className="size-3 text-primary" />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground/70 leading-relaxed font-medium">
                                            Save this group first, then you can add members from the <strong className="text-primary">Members</strong> tab.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="members"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex-1 flex flex-col min-h-0 overflow-hidden"
                        >
                            {/* Search */}
                            <div className="px-8 py-4 border-b border-border/40">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/30" />
                                    <Input
                                        type="text"
                                        placeholder="Search users..."
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        className="h-10 pl-9 rounded-xl border-border/40 bg-muted/5 text-sm font-medium"
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-muted-foreground/40 font-medium">
                                        {groupMembers.length} of {users.length} selected
                                    </span>
                                    {groupMembers.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setGroupMembers([])}
                                            className="text-[10px] text-destructive/60 font-bold uppercase tracking-wider hover:text-destructive transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* User List */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
                                {filteredUsers.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <Users className="size-10 mx-auto mb-4 text-muted-foreground/10" />
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/30">
                                            {memberSearch ? "No users match your search" : "No users available"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {filteredUsers.map((user) => {
                                            const isSelected = groupMembers.includes(user.id)
                                            const initials = (user.display_name || user.email || "U")
                                                .split(" ")
                                                .map((n: string) => n[0])
                                                .join("")
                                                .toUpperCase()
                                                .slice(0, 2)
                                            return (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => toggleGroupMember(user.id)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                                                        isSelected
                                                            ? "bg-primary/8 border border-primary/20"
                                                            : "hover:bg-muted/10 border border-transparent"
                                                    )}
                                                >
                                                    {/* Avatar */}
                                                    <div className={cn(
                                                        "size-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all",
                                                        isSelected
                                                            ? "bg-primary text-white"
                                                            : "bg-muted/20 text-muted-foreground/60"
                                                    )}>
                                                        {initials}
                                                    </div>
                                                    {/* Info */}
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-sm font-semibold tracking-tight text-secondary truncate">
                                                            {user.display_name || user.email}
                                                        </span>
                                                        {user.display_name && (
                                                            <span className="text-[10px] font-medium text-muted-foreground/50 truncate">
                                                                {user.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Check */}
                                                    <div className={cn(
                                                        "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                                        isSelected
                                                            ? "bg-primary border-primary"
                                                            : "border-border/40"
                                                    )}>
                                                        {isSelected && <Check className="size-3 text-white" />}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <SheetFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-2 bg-muted/5">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors">
                        {commonT("cancel")}
                    </Button>
                    {groupTab === "details" ? (
                        <Button type="submit" disabled={isSubmitting} className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]">
                            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {editingData ? commonT("update") : commonT("save")}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleSaveMembers}
                            disabled={isSavingMembers}
                            className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                        >
                            {isSavingMembers && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Save Members
                        </Button>
                    )}
                </SheetFooter>
            </form>
        </Form>
    )

    const renderNotificationView = () => {
        const targetUser = editingData?.user_id ? users.find((u: any) => u.id === editingData.user_id) : null;

        return (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                    <div className="flex flex-col gap-10">
                        {/* Primary Message Display */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="h-5 px-2 text-[10px] font-semibold uppercase tracking-tight border-none bg-primary/10 text-primary rounded-md">
                                    {t(editingData?.type || 'marketing')}
                                </Badge>
                                <div className="flex items-center gap-1.5 text-muted-foreground/50 font-semibold text-[10px] uppercase tracking-wider">
                                    {editingData?.channel === 'app' && <BellRing className="size-3.5 text-primary" />}
                                    {editingData?.channel === 'push' && <Smartphone className="size-3.5 text-primary" />}
                                    {editingData?.channel === 'email' && <Mail className="size-3.5 text-primary" />}
                                    {editingData?.channel === 'sms' && <MessageSquare className="size-3.5 text-primary" />}
                                    {t(`channels.${editingData?.channel}`)}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold tracking-tight text-secondary leading-tight">{editingData?.title}</h3>
                                {editingData?.html ? (
                                    <div className="rounded-xl border border-border/40 overflow-hidden bg-white shadow-sm">
                                        <div className="bg-muted/5 border-b px-4 py-2 flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Email Context</span>
                                            <div className="flex gap-1.5">
                                                <div className="size-2 rounded-full bg-border" />
                                                <div className="size-2 rounded-full bg-border" />
                                                <div className="size-2 rounded-full bg-border" />
                                            </div>
                                        </div>
                                        <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar prose prose-sm max-w-none dark:prose-invert">
                                            <div dangerouslySetInnerHTML={{ __html: editingData.html }} />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm leading-relaxed text-muted-foreground/80 font-medium bg-muted/5 p-4 rounded-xl border border-border/40 italic">
                                        "{editingData?.body}"
                                    </p>
                                )}

                                {editingData?.attachments && (editingData.attachments as string[]).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {(editingData.attachments as string[]).map((url: string, idx: number) => {
                                            const fileName = url.split('/').pop()?.split('-').slice(5).join('-') || "Document"
                                            return (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/10 border border-border/40 hover:bg-muted/20 hover:border-primary/30 transition-all group"
                                                >
                                                    <FileText className="size-3.5 text-primary" />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground group-hover:text-primary">{fileName}</span>
                                                    <ExternalLink className="size-3 text-muted-foreground/30" />
                                                </a>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {editingData?.media_url && (
                                <div className="mt-4 rounded-xl overflow-hidden border border-border/40 aspect-video relative group">
                                    <img src={editingData.media_url} alt="Notification media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                            )}
                        </div>

                        {/* Status & Timing - Divider Pattern */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-[11px] uppercase tracking-wider text-secondary dark:text-white">Delivery Lifecycle</h3>
                                    <p className="text-[10px] text-muted-foreground/60">Execution metrics and transit state</p>
                                </div>
                                <div className="h-px flex-1 bg-border/40 ml-4" />
                            </div>

                            <div className="grid grid-cols-2 gap-8 pl-1">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">Status</span>
                                    <div className="flex items-center gap-2">
                                        <Badge className={cn(
                                            "w-fit border-none px-2 h-5 text-[10px] font-bold uppercase tracking-tight rounded-md",
                                            editingData?.status === 'sent' ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                                        )}>
                                            {editingData?.status || 'Sent'}
                                        </Badge>
                                        {editingData?.status === 'failed' && (
                                            <Button
                                                onClick={handleRetry}
                                                disabled={isRetrying}
                                                variant="ghost"
                                                className="h-5 px-2 text-[10px] font-bold uppercase tracking-tight text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5 rounded-md border border-primary/20"
                                            >
                                                {isRetrying ? <RefreshCcw className="size-3 animate-spin" /> : <RefreshCcw className="size-3" />}
                                                Retry
                                            </Button>
                                        )}
                                        {editingData?.status === 'sent' && (
                                            <Button
                                                onClick={handleRetry}
                                                disabled={isRetrying}
                                                variant="ghost"
                                                className="h-5 px-2 text-[10px] font-bold uppercase tracking-tight text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5 rounded-md border border-primary/20"
                                            >
                                                {isRetrying && <Loader2 className="size-3 animate-spin" />}
                                                Resend
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">Timestamp</span>
                                    <span className="text-xs font-semibold text-secondary tracking-tight">
                                        {editingData?.created_at ? new Date(editingData.created_at).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        }) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recipient Profile - Divider Pattern */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-[11px] uppercase tracking-wider text-secondary dark:text-white">Recipient Profile</h3>
                                    <p className="text-[10px] text-muted-foreground/60">Target audience and contact parameters</p>
                                </div>
                                <div className="h-px flex-1 bg-border/40 ml-4" />
                            </div>

                            <div className="p-5 rounded-xl bg-muted/10 border border-border/40 space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-lg bg-white dark:bg-muted/20 border border-border flex items-center justify-center shadow-sm">
                                        <User className="size-5 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold tracking-tight text-secondary">
                                            {targetUser?.display_name || (editingData?.user_id ? 'Registered User' : 'Manual Recipient')}
                                        </span>
                                        <span className="text-xs font-medium text-muted-foreground/70">{editingData?.target || editingData?.email || 'No target info'}</span>
                                    </div>
                                </div>

                                {editingData?.user_id && (
                                    <div className="flex gap-8 pt-4 border-t border-border/20">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="size-3.5 text-muted-foreground/30" />
                                            <span className="text-[11px] font-semibold text-muted-foreground/60">Locale: {targetUser?.locale || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="size-3.5 text-muted-foreground/30" />
                                            <span className="text-[11px] font-semibold text-muted-foreground/60">Push: {targetUser?.push_token ? 'Registered' : 'None'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error Contextual Card */}
                        {editingData?.status === 'failed' && (
                            <div className="p-5 rounded-xl bg-destructive/5 border border-destructive/10 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-destructive" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-destructive/70">Provider Diagnostic</span>
                                </div>
                                <p className="text-xs font-medium text-destructive/80 leading-relaxed">
                                    {editingData.error_message || "The notification could not be dispatched due to a carrier rejection or invalid endpoint. Please verify connection strings."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <SheetFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-2 bg-muted/5">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors"
                    >
                        {commonT("cancel")}
                    </Button>

                    <Button
                        onClick={() => onOpenChange(false)}
                        className="h-10 px-10 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                    >
                        {commonT("done")}
                    </Button>
                </SheetFooter>
            </div>
        )
    }

    const renderTemplateBuilder = (activeForm: any, isTrigger: boolean = false) => {
        const htmlField = isTrigger ? "html_template" : "html"
        const cssField = isTrigger ? "css_template" : "css"

        return (
            <div className="h-full flex flex-col bg-background relative overflow-hidden">
                {/* Design System Ambient Glow */}
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-50 via-white to-white pointer-events-none -z-10" />

                <SheetHeader className="px-8 py-6 space-y-4 relative z-10 border-b border-border/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="flex flex-col">
                                <SheetTitle className="text-2xl font-bold tracking-tight text-secondary dark:text-foreground">Advanced Designer</SheetTitle>
                                <SheetDescription className="text-[11px] font-semibold text-muted-foreground/50 tracking-wide uppercase mt-0.5">Notification Crafting Studio</SheetDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {renderTemplateSelector(channel, true)}

                        </div>
                    </div>

                    {/* Minimalist Tabs with Sliding Highlight */}
                    <div className="flex items-center gap-10 mt-2">
                        {(["composer", "styles", "preview"] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setDesignerTab(tab)}
                                className={cn(
                                    "relative pb-4 text-[11px] font-semibold transition-all duration-300 flex items-center gap-2",
                                    designerTab === tab
                                        ? "text-secondary dark:text-foreground"
                                        : "text-muted-foreground/30 hover:text-muted-foreground/60"
                                )}
                            >
                                {tab === "composer" && <FileText className="size-3.5" />}
                                {tab === "styles" && <Braces className="size-3.5" />}
                                {tab === "preview" && <Eye className="size-3.5" />}
                                <span className="uppercase tracking-wider">
                                    {tab === "composer" ? "Composer" : tab === "styles" ? "Styling" : "Preview"}
                                </span>
                                {designerTab === tab && (
                                    <motion.div
                                        layoutId="designerTabUnderline"
                                        className="absolute -bottom-px left-0 right-0 h-px bg-primary z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col relative z-10">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {designerTab === "composer" && (
                                <motion.div
                                    key="composer"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="p-8 space-y-10 max-w-4xl mx-auto"
                                >
                                    <div className="space-y-12">
                                        {/* Composer Mode Tabs */}
                                        <div className="flex items-center gap-8 border-b border-border/40">
                                            {(["html", "text"] as const).map((mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setComposerMode(mode)}
                                                    className={cn(
                                                        "relative pb-4 text-[10px] font-bold tracking-wider transition-all duration-300",
                                                        composerMode === mode
                                                            ? "text-primary"
                                                            : "text-muted-foreground/40 hover:text-muted-foreground/60"
                                                    )}
                                                >
                                                    <span className="uppercase">{mode === "html" ? "HTML Designer" : "Plain Text"}</span>
                                                    {composerMode === mode && (
                                                        <motion.div
                                                            layoutId="composerModeUnderline"
                                                            className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary z-10"
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <FormField
                                            control={activeForm.control}
                                            name={isTrigger ? "title_template" : "title"}
                                            render={({ field }) => (
                                                <FormItem className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Campaign Subject</FormLabel>
                                                        <PlaceholderSelector onSelect={(ph) => field.onChange((field.value || "") + ph)} />
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Email subject or app notification title..."
                                                            className="h-12 rounded-xl border-border/40 bg-muted/5 focus:bg-background transition-all duration-300 px-4 text-sm font-medium focus:ring-4 ring-primary/5 shadow-none"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        <AnimatePresence mode="wait">
                                            {composerMode === "text" ? (
                                                <motion.div
                                                    key="text-editor"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                >
                                                    <FormField
                                                        control={activeForm.control}
                                                        name={isTrigger ? "body_template" : "body"}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-4">
                                                                <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Plain Text Content</FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        {...field}
                                                                        placeholder="Classic text experience for all devices..."
                                                                        className="min-h-[350px] rounded-2xl border-border/40 bg-muted/5 focus:bg-background transition-all duration-300 p-6 text-sm font-medium resize-none focus:ring-8 ring-primary/5 leading-relaxed shadow-none"
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="html-editor"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-6"
                                                >
                                                    <FormField
                                                        control={activeForm.control}
                                                        name={htmlField}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <FormLabel className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Rich Text Designer</FormLabel>
                                                                    <PlaceholderSelector onSelect={(ph) => field.onChange((field.value || "") + ph)} />
                                                                </div>
                                                                <FormControl>
                                                                    <div className="rounded-2xl border border-border/60 overflow-hidden shadow-sm bg-background transition-all duration-500 hover:shadow-md">
                                                                        <RichText
                                                                            value={field.value}
                                                                            onChange={field.onChange}
                                                                            placeholder="Unleash advanced design logic..."
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}

                            {designerTab === "styles" && (
                                <motion.div
                                    key="styles"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="p-8 max-w-4xl mx-auto"
                                >
                                    <FormField
                                        control={activeForm.control}
                                        name={cssField}
                                        render={({ field }) => (
                                            <FormItem className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col">
                                                        <h3 className="font-semibold text-xs text-secondary tracking-tight">Global Styling Overrides</h3>
                                                        <p className="text-[10px] text-muted-foreground/60">Manage brand-consistent CSS rules</p>
                                                    </div>
                                                    <div className="h-px flex-1 bg-border/60 ml-4" />
                                                </div>
                                                <FormControl>
                                                    <div className="relative group overflow-hidden rounded-2xl border border-border/60 shadow-inner">
                                                        <Textarea
                                                            {...field}
                                                            placeholder=".header { background: #f8fafc; color: #1e293b; padding: 40px; text-align: center; } ..."
                                                            className="min-h-[450px] border-none bg-slate-950 text-emerald-400 p-10 font-mono text-[11px] leading-relaxed resize-none focus-visible:ring-0 shadow-none"
                                                        />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </motion.div>
                            )}

                            {designerTab === "preview" && (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="p-8 max-w-3xl mx-auto flex flex-col gap-10"
                                >


                                    <div className="aspect-[9/16] max-h-[700px] min-h-[550px] rounded-[2.5rem] border-[10px] border-slate-950 bg-white overflow-hidden shadow-2xl flex flex-col relative mx-auto group ring-1 ring-border/20">
                                        <div className="h-6 bg-slate-950 flex items-center justify-center">
                                            <div className="w-16 h-1 rounded-full bg-slate-800" />
                                        </div>
                                        <div className="flex-1 bg-white">
                                            <iframe
                                                title="Notification Preview"
                                                className="w-full h-full border-0"
                                                srcDoc={`
                                                    <html>
                                                        <head>
                                                            <style>${activeForm.watch(cssField) || ""}</style>
                                                        </head>
                                                        <body style="margin:0; padding:40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6;">
                                                            <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 24px; letter-spacing: -0.02em;">${activeForm.watch(isTrigger ? "title_template" : "title") || "Draft Subject"}</h1>
                                                            ${activeForm.watch(htmlField) || activeForm.watch(isTrigger ? "body_template" : "body") || "<div style='color: #94a3b8; font-style: italic;'>Awaiting creative input...</div>"}
                                                        </body>
                                                    </html>
                                                `}
                                            />
                                        </div>
                                        <div className="h-10 bg-slate-950 flex items-center justify-center">
                                            <div className="size-8 rounded-full border-2 border-slate-900" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <SheetFooter className="px-8 py-5 border-t flex flex-row items-center justify-end gap-3 bg-muted/5 relative z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                    <Button
                        variant="outline"
                        onClick={() => setIsExpanded(false)}
                        className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors shadow-none"
                    >
                        {commonT("cancel")}
                    </Button>
                    <Button
                        onClick={saveAsTemplate}
                        disabled={isSavingTemplate}
                        className="h-10 px-10 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                    >
                        {isSavingTemplate && <Loader2 className="size-3.5 mr-2 animate-spin" />}
                        {commonT("save")}
                    </Button>
                </SheetFooter>
            </div>
        )
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className={cn(
                    "p-0 flex flex-col bg-background border-l border-border",
                    isExpanded ? "sm:max-w-4xl" : "sm:max-w-2xl"
                )}
            >
                {/* High-End Ambient Glow */}
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-50 via-white to-white pointer-events-none -z-10" />

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
                    {/* Standard View Integration */}
                    {!isExpanded ? (
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            <SheetHeader className="px-8 py-6 space-y-3">
                                <div>
                                    <SheetTitle className="text-2xl font-semibold tracking-tight text-secondary dark:text-foreground">
                                        {mode === "broadcast" && t("broadcastTitle")}
                                        {mode === "trigger" && (editingData ? t("editTrigger") : t("createTrigger"))}
                                        {mode === "group" && (editingData ? editingData.name : t("createGroup"))}
                                        {mode === "view-notification" && "Notification Details"}
                                    </SheetTitle>
                                    <SheetDescription className="text-xs font-medium text-muted-foreground/60 tracking-tight">
                                        {mode === "broadcast" && "Dispatch multi-channel visual communications"}
                                        {mode === "trigger" && "Define automated behavioral engagement logic"}
                                        {mode === "group" && (editingData ? "Audience segmentation & member management" : "Create a new audience segment")}
                                        {mode === "view-notification" && "Comprehensive insight into dispatched communication"}
                                    </SheetDescription>
                                </div>
                            </SheetHeader>

                            {mode === "broadcast" && renderBroadcastForm()}
                            {mode === "trigger" && renderTriggerForm()}
                            {mode === "group" && renderGroupForm()}
                            {mode === "view-notification" && renderNotificationView()}
                        </div>
                    ) : (
                        /* Advanced Designer Panel - Full Immersion View */
                        <div className="flex-1 h-full overflow-hidden">
                            {mode === "broadcast" && (
                                <Form {...form}>
                                    {renderTemplateBuilder(form, false)}
                                </Form>
                            )}
                            {mode === "trigger" && (
                                <Form {...triggerForm}>
                                    {renderTemplateBuilder(triggerForm, true)}
                                </Form>
                            )}
                        </div>
                    )}
                </div>

                {/* Always-on Accessibility Title - satisfying Radix/ARIA requirements while preserving immersive design */}
                <div className="sr-only">
                    <SheetTitle>Notification Management - {mode}</SheetTitle>
                    <SheetDescription>Configure and manage system-wide notifications and broadcasts</SheetDescription>
                </div>
            </SheetContent>
        </Sheet>
    )
}
