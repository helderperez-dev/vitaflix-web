"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Loader2, Camera, ShieldCheck, KeyRound, UserCog, AlertCircle, CheckCircle2, MoreVertical,
    CreditCard, Utensils, ShoppingBag, Bell, User, X, Trash2, Plus, ChevronRight
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { AvatarUploader } from "@/components/shared/avatar-uploader"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { motion } from "framer-motion"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { userProfileSchema, type UserProfile } from "@/shared-schemas/user"
import { upsertUser, requestPasswordReset, adminUpdatePassword, getUserRelatedData } from "@/app/actions/users"
import { createMealPlan } from "@/app/actions/plans"
import { CreatePlanModal } from "@/components/plans/create-plan-modal"
import { PlanDetailsView } from "@/components/plans/plan-details-view"
import { Stepper } from "@/components/ui/stepper"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { DictionarySelector } from "@/components/shared/dictionary-selector"

interface UserDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: UserProfile | null
}

export function UserDrawer({ open, onOpenChange, user }: UserDrawerProps) {
    const t = useTranslations("Users")
    const tp = useTranslations("Plans")
    const commonT = useTranslations("Common")
    const tc = useTranslations("Common")
    const [isSubmiting, setIsSubmitting] = React.useState(false)
    const [isResettingPassword, setIsResettingPassword] = React.useState(false)
    const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false)
    const [newPassword, setNewPassword] = React.useState("")
    const [isCreatePlanOpen, setIsCreatePlanOpen] = React.useState(false)
    const [selectedPlan, setSelectedPlan] = React.useState<any>(null)
    const [relatedData, setRelatedData] = React.useState<any>(null)
    const [isLoadingRelated, setIsLoadingRelated] = React.useState(false)

    const [activeTab, setActiveTab] = React.useState("profile")
    const generatedId = React.useId()
    const formId = React.useMemo(() => user?.id || generatedId, [user?.id, generatedId])
    const form = useForm({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            email: "",
            displayName: "",
            avatarUrl: null,
            role: "user",
            genre: "other",
            height: 170,
            weight: 70,
            objective: "maintain",
            extraDataComplete: false,
        },
    }) as any

    React.useEffect(() => {
        if (user) {
            form.reset({
                ...user,
                displayName: user.displayName || "",
                avatarUrl: user.avatarUrl || null,
                genre: user.genre || "other",
                objective: user.objective || "maintain",
                height: user.height ?? 170,
                weight: user.weight ?? 70,
            })
            fetchRelatedData(user.id!)
        } else {
            form.reset({
                email: "",
                displayName: "",
                avatarUrl: null,
                role: "user",
                genre: "other",
                height: 170,
                weight: 70,
                objective: "maintain",
                extraDataComplete: false,
            })
            setRelatedData(null)
        }
    }, [user, form])

    async function fetchRelatedData(userId: string, silent = false) {
        if (!silent) setIsLoadingRelated(true)
        try {
            const data = await getUserRelatedData(userId)
            setRelatedData(data)

            // Sync selected plan if one is active
            if (selectedPlan) {
                const updated = data.mealPlans?.find((p: any) => p.id === selectedPlan.id)
                if (updated) setSelectedPlan(updated)
            }
        } catch (error) {
            console.error("Error fetching related data:", error)
        } finally {
            if (!silent) setIsLoadingRelated(false)
        }
    }

    async function onSubmit(values: UserProfile) {
        setIsSubmitting(true)
        try {
            const result = await upsertUser(values)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(user ? commonT("updatedSuccessfully") : commonT("createdSuccessfully"))
                onOpenChange(false)
            }
        } catch (error) {
            toast.error(commonT("errorSaving"))
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleRequestReset() {
        if (!user?.email) return
        setIsResettingPassword(true)
        try {
            const result = await requestPasswordReset(user.email)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Success: reset email sent")
            }
        } catch (error) {
            toast.error("Error: reset failed")
        } finally {
            setIsResettingPassword(false)
        }
    }

    async function handleDirectUpdate() {
        if (!user?.id || !newPassword) {
            toast.error("Please enter a password")
            return
        }

        if (newPassword.length < 6) {
            toast.error("Too short")
            return
        }

        setIsUpdatingPassword(true)
        try {
            const result = await adminUpdatePassword(user.id, newPassword)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Identity synchronized")
                setNewPassword("")
            }
        } catch (error) {
            toast.error("Sync failed")
        } finally {
            setIsUpdatingPassword(false)
        }
    }


    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="p-0 sm:max-w-3xl flex flex-col gap-0 border-l-0">
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
                    <div className="relative w-full bg-white dark:bg-zinc-950 border-b border-border/40 overflow-hidden">
                        {/* High-End Ambient Glow (Slate, not Green) */}
                        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-slate-50 via-background to-background pointer-events-none" />

                        <div className="relative z-20 px-8 py-8 flex items-center gap-6">
                            <div className="shrink-0">
                                <AvatarUploader
                                    value={form.watch("avatarUrl")}
                                    onChange={(url) => form.setValue("avatarUrl", url)}
                                    displayName={user?.displayName}
                                    size="sm"
                                    showLabel={false}
                                />
                            </div>

                            <div className="flex-1 space-y-1 min-w-0">
                                <SheetHeader className="p-0 space-y-0 text-left border-none shadow-none bg-transparent">
                                    <SheetTitle className="text-xl font-extrabold text-secondary dark:text-white tracking-tight leading-none mb-1 truncate">
                                        {user ? user.displayName || t("title") : t("title")}
                                    </SheetTitle>
                                    <SheetDescription className="text-muted-foreground/70 text-[11px] font-medium flex items-center gap-2">
                                        <span className="lowercase">{user?.email}</span>
                                        <span className="text-muted-foreground/30">•</span>
                                        <span className="uppercase tracking-widest font-bold text-primary/70">{user?.role || "user"}</span>
                                    </SheetDescription>
                                </SheetHeader>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full size-9" onClick={() => onOpenChange(false)}>
                                    <X className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex-1 flex flex-col min-h-0 overflow-hidden"
                    >
                        <div className="px-8 border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
                            <TabsList variant="line" className="w-full justify-start h-12 gap-8 bg-transparent p-0">
                                <TabsTrigger
                                    value="profile"
                                    className={cn(
                                        "relative h-full gap-2 px-0 border-none bg-transparent shadow-none transition-colors after:hidden",
                                        activeTab === "profile" ? "text-primary dark:text-primary" : "text-muted-foreground/30 hover:text-muted-foreground/60"
                                    )}
                                >
                                    <User className="size-3.5" />
                                    {t("tabs.profile") || commonT("profile")}
                                    {activeTab === "profile" && (
                                        <motion.div
                                            layoutId="userDrawerActiveTab"
                                            className="absolute -bottom-px left-0 right-0 h-px bg-primary z-20"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </TabsTrigger>
                                {user && (
                                    <>
                                        <TabsTrigger
                                            value="security"
                                            className={cn(
                                                "relative h-full gap-2 px-0 border-none bg-transparent shadow-none transition-colors after:hidden",
                                                activeTab === "security" ? "text-primary dark:text-primary" : "text-muted-foreground/30 hover:text-muted-foreground/60"
                                            )}
                                        >
                                            <ShieldCheck className="size-3.5" />
                                            {t("tabs.security")}
                                            {activeTab === "security" && (
                                                <motion.div
                                                    layoutId="userDrawerActiveTab"
                                                    className="absolute -bottom-px left-0 right-0 h-px bg-primary z-20"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="subscription"
                                            className={cn(
                                                "relative h-full gap-2 px-0 border-none bg-transparent shadow-none transition-colors after:hidden",
                                                activeTab === "subscription" ? "text-primary dark:text-primary" : "text-muted-foreground/30 hover:text-muted-foreground/60"
                                            )}
                                        >
                                            <CreditCard className="size-3.5" />
                                            {t("tabs.subscription")}
                                            {activeTab === "subscription" && (
                                                <motion.div
                                                    layoutId="userDrawerActiveTab"
                                                    className="absolute -bottom-px left-0 right-0 h-px bg-primary z-20"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="meal-plan"
                                            className={cn(
                                                "relative h-full gap-2 px-0 border-none bg-transparent shadow-none transition-colors after:hidden",
                                                activeTab === "meal-plan" ? "text-primary dark:text-primary" : "text-muted-foreground/30 hover:text-muted-foreground/60"
                                            )}
                                        >
                                            <Utensils className="size-3.5" />
                                            {t("tabs.plan")}
                                            {activeTab === "meal-plan" && (
                                                <motion.div
                                                    layoutId="userDrawerActiveTab"
                                                    className="absolute -bottom-px left-0 right-0 h-px bg-primary z-20"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="notifications"
                                            className={cn(
                                                "relative h-full gap-2 px-0 border-none bg-transparent shadow-none transition-colors after:hidden",
                                                activeTab === "notifications" ? "text-primary dark:text-primary" : "text-muted-foreground/30 hover:text-muted-foreground/60"
                                            )}
                                        >
                                            <Bell className="size-3.5" />
                                            {t("tabs.activity")}
                                            {activeTab === "notifications" && (
                                                <motion.div
                                                    layoutId="userDrawerActiveTab"
                                                    className="absolute -bottom-px left-0 right-0 h-px bg-primary z-20"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </TabsTrigger>
                                    </>
                                )}
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <TabsContent value="profile" className="px-8 pt-6 outline-none m-0">
                                <Form {...form}>
                                    <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 pb-12" autoComplete="off">
                                        <div className="space-y-12">
                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <h3 className="font-semibold text-[11px] text-secondary dark:text-white uppercase tracking-wider whitespace-nowrap">{t("identityManagement")}</h3>
                                                        <div className="h-[1px] w-full bg-border/40" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                                    <FormField
                                                        control={form.control}
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-semibold text-muted-foreground/70">E-mail</FormLabel>
                                                                <FormControl>
                                                                    <Input disabled={!!user} placeholder="user@example.com" {...field} />
                                                                </FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="displayName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-semibold text-muted-foreground/70">Nome Completo</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="John Doe" {...field} autoComplete="off" />
                                                                </FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="role"
                                                        render={({ field }) => (
                                                            <FormItem className="md:col-span-2">
                                                                <FormControl>
                                                                    <DictionarySelector
                                                                        label="System Authorization Role"
                                                                        value={field.value}
                                                                        onChange={field.onChange}
                                                                        table="user_roles"
                                                                        placeholder="Select access level"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("physiologicalBaseline")}</h3>
                                                        <div className="h-[1px] w-full bg-border/40" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                                    <FormField
                                                        control={form.control}
                                                        name="genre"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-semibold text-muted-foreground/70">{t("biologicalGender")}</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="male">Male</SelectItem>
                                                                        <SelectItem value="female">Female</SelectItem>
                                                                        <SelectItem value="other">Other</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="objective"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <DictionarySelector
                                                                        label={t("wellnessObjective")}
                                                                        value={field.value}
                                                                        onChange={field.onChange}
                                                                        table="wellness_objectives"
                                                                        placeholder="Goal"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="height"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-semibold text-muted-foreground/70">{t("stature")}</FormLabel>
                                                                <FormControl>
                                                                    <Stepper
                                                                        value={field.value ?? 170}
                                                                        onChange={field.onChange}
                                                                        step={1}
                                                                        unit="CM"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="weight"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-semibold text-muted-foreground/70">{t("bodyMass")}</FormLabel>
                                                                <FormControl>
                                                                    <Stepper
                                                                        value={field.value ?? 70}
                                                                        onChange={field.onChange}
                                                                        step={0.1}
                                                                        unit="KG"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-8 pb-6">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("systemCompliance")}</h3>
                                                        <div className="h-[1px] w-full bg-border/40" />
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-lg bg-muted/20 border border-border transition-colors hover:bg-muted/30 group">
                                                    <FormField
                                                        control={form.control}
                                                        name="extraDataComplete"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-center justify-between">
                                                                <div className="space-y-0.5">
                                                                    <FormLabel className="text-sm font-semibold text-secondary dark:text-white">{t("profileStatus")}</FormLabel>
                                                                    <FormDescription className="text-[11px] leading-relaxed">
                                                                        {t("profileStatusDesc")}
                                                                    </FormDescription>
                                                                </div>
                                                                <FormControl>
                                                                    <Switch
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                        className="data-[state=checked]:bg-primary"
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                            </TabsContent>

                            {user && (
                                <>
                                    <TabsContent value="security" className="px-8 pt-6 outline-none m-0 pb-12">
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <h3 className="font-semibold text-[11px] text-secondary dark:text-white uppercase tracking-wider whitespace-nowrap">{t("identityProtection")}</h3>
                                                    <div className="h-[1px] w-full bg-border/40" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="group p-5 rounded-2xl bg-muted/5 border border-border/40 transition-all hover:bg-muted/10 hover:border-primary/20">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex gap-4">
                                                            <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0 transition-colors group-hover:bg-secondary/20">
                                                                <KeyRound className="size-5" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="text-sm font-semibold text-secondary dark:text-white leading-none">{t("externalRecovery")}</h4>
                                                                <p className="text-[11px] text-muted-foreground/60 leading-relaxed max-w-[280px]">
                                                                    {t("externalRecoveryDesc")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleRequestReset}
                                                            disabled={isResettingPassword}
                                                            className="h-9 px-4 rounded-xl text-[11px] font-bold border-border/60 hover:bg-white hover:text-primary transition-all active:scale-95"
                                                        >
                                                            {isResettingPassword ? <Loader2 className="size-3 animate-spin mr-1" /> : <ShieldCheck className="size-3 mr-1.5" />}
                                                            {t("initiateReset")}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="group p-5 rounded-2xl bg-muted/5 border border-border/40 transition-all hover:bg-muted/10 hover:border-primary/20">
                                                    <div className="flex flex-col gap-5">
                                                        <div className="flex items-start gap-4">
                                                            <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0 transition-colors group-hover:bg-secondary/20">
                                                                <UserCog className="size-5" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="text-sm font-semibold text-secondary dark:text-white leading-none">{t("adminOverride")}</h4>
                                                                <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                                                                    {t("adminOverrideDesc")}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <div className="relative flex-1">
                                                                <Input
                                                                    type="password"
                                                                    id="admin-override-password"
                                                                    name="admin-override-password"
                                                                    placeholder={t("newMasterCredential")}
                                                                    value={newPassword}
                                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                                    autoComplete="new-password"
                                                                    className="h-10 text-xs rounded-xl bg-white border-border/40 focus:ring-primary/10 focus:border-primary"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                onClick={handleDirectUpdate}
                                                                disabled={isUpdatingPassword || !newPassword}
                                                                className="h-10 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl text-[11px] font-bold shadow-sm shadow-primary/5 transition-all active:scale-95 disabled:grayscale"
                                                            >
                                                                {isUpdatingPassword ? <Loader2 className="size-3 animate-spin mr-1" /> : <CheckCircle2 className="size-3 mr-1.5" />}
                                                                {t("overrideKey")}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="subscription" className="px-8 pt-6 outline-none m-0 pb-12">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-2 flex-1">
                                                <h3 className="font-semibold text-[11px] text-secondary dark:text-white uppercase tracking-wider whitespace-nowrap">Membership & Billing</h3>
                                                <div className="h-[1px] w-full bg-border/40" />
                                            </div>

                                            {isLoadingRelated ? (
                                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground/40">
                                                    <Loader2 className="size-8 animate-spin" />
                                                    <p className="text-xs font-medium">Synchronizing with payment providers...</p>
                                                </div>
                                            ) : relatedData?.subscriptions?.length > 0 ? (
                                                <div className="space-y-4">
                                                    {relatedData.subscriptions.map((sub: any) => (
                                                        <div key={sub.id} className="group p-5 rounded-2xl bg-muted/5 border border-border/40 transition-all hover:bg-muted/10">
                                                            <div className="flex items-start justify-between mb-6">
                                                                <div className="space-y-1">
                                                                    <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className={cn(
                                                                        "capitalize px-2 py-0 h-5 text-[10px] font-bold tracking-tight",
                                                                        sub.status === 'active' ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20" : ""
                                                                    )}>
                                                                        {sub.status}
                                                                    </Badge>
                                                                    <p className="text-[10px] text-muted-foreground/60 font-mono">
                                                                        {sub.stripe_subscription_id || sub.paypal_subscription_id || 'ID: ' + sub.id.slice(0, 8)}
                                                                    </p>
                                                                </div>
                                                                <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                                                                    <CreditCard className="size-5" />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-6 pb-4 border-b border-border/40">
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/40">Period Start</p>
                                                                    <p className="text-sm font-semibold text-secondary dark:text-white" suppressHydrationWarning>
                                                                        {sub.current_period_start ? new Date(sub.current_period_start).toLocaleDateString() : 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/40">Renewal Date</p>
                                                                    <p className="text-sm font-semibold text-secondary dark:text-white" suppressHydrationWarning>
                                                                        {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn(
                                                                        "size-2 rounded-full",
                                                                        sub.status === 'active' ? (sub.cancel_at_period_end ? "bg-amber-500 animate-pulse" : "bg-green-500") : "bg-muted-foreground/40"
                                                                    )} />
                                                                    <p className="text-[10px] font-medium text-muted-foreground">
                                                                        {sub.status === 'active' ? (sub.cancel_at_period_end ? "Pending Cancellation" : "Auto-renew Enabled") : "Deactivated"}
                                                                    </p>
                                                                </div>
                                                                <Button variant="ghost" size="sm" className="h-7 px-3 text-[10px] font-bold hover:bg-white border text-secondary">
                                                                    View Details
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-muted/5 border border-dashed border-border/60 text-center gap-3">
                                                    <div className="size-12 rounded-full bg-secondary/5 flex items-center justify-center text-secondary/40">
                                                        <CreditCard className="size-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-semibold text-secondary dark:text-white">No active subscription</p>
                                                        <p className="text-[11px] text-muted-foreground/60">This user is currently on the free tier or has no payment history.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {relatedData?.transactions?.length > 0 && (
                                                <div className="space-y-6 pt-4">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <h3 className="font-semibold text-[11px] text-secondary dark:text-white uppercase tracking-wider whitespace-nowrap">Transaction History</h3>
                                                        <div className="h-[1px] w-full bg-border/40" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        {relatedData.transactions.map((tx: any) => (
                                                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/5 transition-colors hover:bg-muted/10">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="size-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 text-secondary">
                                                                        <CheckCircle2 className="size-4" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-[11px] font-bold text-secondary dark:text-white">
                                                                            {(tx.amount / 100).toLocaleString(undefined, { style: 'currency', currency: tx.currency || 'USD' })}
                                                                        </p>
                                                                        <p className="text-[9px] text-muted-foreground/60" suppressHydrationWarning>{new Date(tx.created_at).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                <Badge variant="outline" className="text-[9px] h-5 bg-background font-mono opacity-60">
                                                                    {tx.provider_transaction_id?.slice(0, 12) || tx.id.slice(0, 8)}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="meal-plan" className="px-8 pt-6 outline-none m-0 pb-12">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4 flex-1">
                                                <h3 className="font-semibold text-[11px] text-secondary dark:text-white uppercase tracking-wider whitespace-nowrap">Nutrition & Meal Plans</h3>
                                                <div className="h-[1px] w-full bg-border/40" />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 rounded-lg text-[10px] font-bold gap-2 px-3 border-primary/20 text-primary hover:bg-primary/5 shrink-0"
                                                    onClick={() => setIsCreatePlanOpen(true)}
                                                >
                                                    <Plus className="size-3" />
                                                    {tc("create")}
                                                </Button>
                                            </div>

                                            {selectedPlan ? (
                                                <PlanDetailsView
                                                    plan={selectedPlan}
                                                    onBack={() => setSelectedPlan(null)}
                                                    onUpdate={() => {
                                                        if (user?.id) fetchRelatedData(user.id, true)
                                                    }}
                                                />
                                            ) : isLoadingRelated ? (
                                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground/40">
                                                    <Loader2 className="size-8 animate-spin" />
                                                    <p className="text-xs font-medium">Retrieving meal structures...</p>
                                                </div>
                                            ) : relatedData?.mealPlans?.length > 0 ? (
                                                <div className="space-y-4">
                                                    {relatedData.mealPlans.map((plan: any) => (
                                                        <div
                                                            key={plan.id}
                                                            onClick={() => setSelectedPlan(plan)}
                                                            className="p-4 rounded-xl border border-border/40 bg-muted/5 flex items-center justify-between group hover:bg-muted/10 transition-colors cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                                                    <Utensils className="size-5" />
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <p className="text-xs font-bold text-secondary dark:text-white">
                                                                        {plan.name || `Meal Plan #${plan.id.slice(0, 8)}`}
                                                                    </p>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            {plan.daily_meals_count} {tp("mealsLabel")} • <span suppressHydrationWarning>{new Date(plan.created_at).toLocaleDateString()}</span>
                                                                        </p>
                                                                        <Badge variant="outline" className="h-4 text-[8px] px-1 font-mono uppercase bg-background">
                                                                            {plan.status || 'Active'}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Button variant="ghost" size="icon" className="size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <ChevronRight className="size-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-muted/5 border border-dashed border-border/60 text-center gap-3">
                                                    <div className="size-12 rounded-full bg-secondary/5 flex items-center justify-center text-secondary/40">
                                                        <Utensils className="size-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-semibold text-secondary dark:text-white">{tp("emptyTitle")}</p>
                                                        <p className="text-[11px] text-muted-foreground/60 mb-4">{tp("emptyDescription")}</p>
                                                        <Button
                                                            variant="outline"
                                                            className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold text-[10px] uppercase tracking-wider px-6 h-9 transition-all active:scale-95"
                                                            onClick={() => setIsCreatePlanOpen(true)}
                                                        >
                                                            <Plus className="size-3 mr-2" />
                                                            {tp("addFirst")}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </TabsContent>

                                    <TabsContent value="notifications" className="px-8 pt-6 outline-none m-0 pb-12">
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <h3 className="font-semibold text-[11px] text-secondary dark:text-white uppercase tracking-wider whitespace-nowrap">Session Stats</h3>
                                                    <div className="h-[1px] w-full bg-border/40" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl border border-border/40 bg-muted/5 space-y-1">
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/40">Last Sign In</p>
                                                    <p className="text-xs font-semibold text-secondary dark:text-white">
                                                        {(user as any)?.lastSignInAt ? new Date((user as any).lastSignInAt).toLocaleString() : 'Never'}
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-xl border border-border/40 bg-muted/5 space-y-1">
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/40">Registered Since</p>
                                                    <p className="text-xs font-semibold text-secondary dark:text-white">
                                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 flex-1 pt-4">
                                                <h3 className="font-semibold text-[11px] text-secondary dark:text-white uppercase tracking-wider whitespace-nowrap">Activity Logs</h3>
                                                <div className="h-[1px] w-full bg-border/40" />
                                            </div>

                                            {isLoadingRelated ? (
                                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground/40">
                                                    <Loader2 className="size-8 animate-spin" />
                                                    <p className="text-xs font-medium">Loading history...</p>
                                                </div>
                                            ) : relatedData?.notifications?.length > 0 ? (
                                                <div className="space-y-3">
                                                    {relatedData.notifications.map((notif: any) => (
                                                        <div key={notif.id} className="p-4 rounded-xl border border-border/40 bg-muted/5 flex items-start gap-4 transition-colors hover:bg-muted/10">
                                                            <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0 border border-secondary/20 shadow-sm">
                                                                <Bell className="size-5" />
                                                            </div>
                                                            <div className="space-y-1.5 min-w-0 flex-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="text-xs font-bold text-secondary dark:text-white truncate">{notif.title}</p>
                                                                    <span className="text-[9px] font-medium text-muted-foreground/60 shrink-0">{new Date(notif.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{notif.body}</p>
                                                                <div className="flex items-center gap-2 pt-1">
                                                                    <Badge variant="outline" className="h-4 text-[8px] px-1 font-mono uppercase">
                                                                        {notif.channel}
                                                                    </Badge>
                                                                    <div className="size-1 rounded-full bg-muted-foreground/20" />
                                                                    <span className={cn(
                                                                        "text-[8px] font-bold uppercase tracking-widest",
                                                                        notif.status === 'sent' ? "text-green-600" : "text-red-600"
                                                                    )}>
                                                                        {notif.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-muted/5 border border-dashed border-border/60 text-center gap-3">
                                                    <div className="size-12 rounded-full bg-muted/10 flex items-center justify-center text-muted-foreground/40">
                                                        <Bell className="size-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-semibold text-secondary dark:text-white">No history</p>
                                                        <p className="text-[11px] text-muted-foreground/60">No notifications have been sent to this user yet.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </>
                            )}
                        </div>
                    </Tabs>

                    <SheetFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-2 bg-muted/5 relative z-50">
                        <Button
                            variant="outline"
                            className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmiting}
                        >
                            {commonT("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            form="user-form"
                            className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                            disabled={isSubmiting}
                        >
                            {isSubmiting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {commonT("save")}
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>

            <CreatePlanModal
                userId={user?.id || ""}
                isOpen={isCreatePlanOpen}
                onOpenChange={setIsCreatePlanOpen}
                onSuccess={() => {
                    // Refresh data
                    if (user?.id) fetchRelatedData(user.id)
                }}
            />
        </Sheet>
    )
}
