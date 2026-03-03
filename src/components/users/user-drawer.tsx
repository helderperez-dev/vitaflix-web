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
import { Stepper } from "@/components/ui/stepper"

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
                {/* High-End Ambient Glow */}
                <div className="absolute top-0 left-0 right-0 h-[560px] bg-gradient-to-b from-slate-50 via-white to-white pointer-events-none -z-10" />

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
                    <SheetHeader className="px-8 py-8 space-y-2">
                        <SheetTitle className="text-2xl font-semibold tracking-tight text-secondary dark:text-foreground">
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
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 flex-1">
                                            <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("identityManagement")}</h3>
                                            <div className="h-px w-full bg-border/60" />
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
                                                        <Input disabled={!!user} placeholder="user@example.com"{...field} />
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
                                                        <Input placeholder="John Doe"{...field} />
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
                                                    <FormLabel className="text-xs font-semibold text-muted-foreground/70">System Authorization Role</FormLabel>
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
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 flex-1">
                                            <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("physiologicalBaseline")}</h3>
                                            <div className="h-px w-full bg-border/60" />
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
                                                    <FormLabel className="text-xs font-semibold text-muted-foreground/70">{t("wellnessObjective")}</FormLabel>
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

                                {/* System Configuration */}
                                <div className="space-y-8 pb-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 flex-1">
                                            <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("systemCompliance")}</h3>
                                            <div className="h-px w-full bg-border/60" />
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
                            </form>
                        </Form>
                    </div>

                    <SheetFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-2 bg-muted/5">
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
        </Sheet>
    )
}
