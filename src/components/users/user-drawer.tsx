"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Loader2
} from "lucide-react"
import { toast } from "sonner"

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
import { upsertUser } from "@/app/actions/users"

interface UserDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: UserProfile | null
}

export function UserDrawer({ open, onOpenChange, user }: UserDrawerProps) {
    const t = useTranslations("Users")
    const commonT = useTranslations("Common")
    const [isSubmiting, setIsSubmitting] = React.useState(false)

    const form = useForm({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            email: "",
            displayName: "",
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
                genre: user.genre || "other",
                objective: user.objective || "maintain",
                height: user.height ?? 170,
                weight: user.weight ?? 70,
            })
        } else {
            form.reset({
                email: "",
                displayName: "",
                role: "user",
                genre: "other",
                height: 170,
                weight: 70,
                objective: "maintain",
                extraDataComplete: false,
            })
        }
    }, [user, form])

    async function onSubmit(values: UserProfile) {
        setIsSubmitting(true)
        try {
            const result = await upsertUser(values)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(user ? t("title") : t("title")) // Could use more specific keys but keeping it simple
                onOpenChange(false)
            }
        } catch (error) {
            toast.error(commonT("loading"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl p-0 flex flex-col bg-background border-l border-border">
                {/* Minimalist Top Accent */}
                <div className="h-1 w-full bg-primary" />

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <SheetHeader className="px-8 py-8 space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-transparent">
                                {user ? t("identityManagement") : t("accountOnboarding")}
                            </Badge>
                            {user && (
                                <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-mono border-border text-muted-foreground bg-muted/30 uppercase">
                                    {user.role}
                                </Badge>
                            )}
                        </div>
                        <SheetTitle className="text-2xl font-bold tracking-tight text-secondary dark:text-foreground">
                            {user ? t("title") : t("title")}
                        </SheetTitle>
                        <SheetDescription className="text-sm">
                            {t("description")}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
                        <Form {...form}>
                            <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                                {/* Identity & Authentication */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-secondary dark:text-white uppercase tracking-widest">{t("identityManagement")}</h3>
                                        <div className="h-px flex-1 bg-border/60 ml-2" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">E-mail</FormLabel>
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
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nome Completo</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John Doe" {...field} />
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
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Authorization Role</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select access level" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="user">Standard User</SelectItem>
                                                            <SelectItem value="admin">System Administrator</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Physiological Baseline */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-secondary dark:text-white uppercase tracking-widest">{t("physiologicalBaseline")}</h3>
                                        <div className="h-px flex-1 bg-border/60 ml-2" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        <FormField
                                            control={form.control}
                                            name="genre"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("biologicalGender")}</FormLabel>
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
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("wellnessObjective")}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Goal" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="lose_weight">Weight Reduction</SelectItem>
                                                            <SelectItem value="gain_muscle">Muscle Hypertrophy</SelectItem>
                                                            <SelectItem value="maintain">Maintenance</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="height"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("stature")}</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Input
                                                                type="number"
                                                                className="pr-16 font-semibold"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(Number(e.target.value))}
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40 transition-colors group-hover:text-primary">CM</span>
                                                        </div>
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
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("bodyMass")}</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                className="pr-16 font-semibold"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(Number(e.target.value))}
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40 transition-colors group-hover:text-primary">KG</span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* System Configuration */}
                                <div className="space-y-8 pb-6">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-secondary dark:text-white uppercase tracking-widest">{t("systemCompliance")}</h3>
                                        <div className="h-px flex-1 bg-border/60 ml-2" />
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/20 border border-border transition-colors hover:bg-muted/30 group">
                                        <FormField
                                            control={form.control}
                                            name="extraDataComplete"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-sm font-bold text-secondary dark:text-white">{t("profileStatus")}</FormLabel>
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
                            </form>
                        </Form>
                    </div>

                    <SheetFooter className="px-8 py-8 border-t flex flex-row items-center justify-end gap-3 bg-muted/5">
                        <Button
                            variant="outline"
                            className="h-10 px-6 font-bold text-xs uppercase tracking-widest border-border hover:bg-muted/30 transition-colors"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmiting}
                        >
                            {commonT("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            form="user-form"
                            className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-sm shadow-primary/10 transition-all active:scale-[0.98]"
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
        </Sheet>
    )
}
