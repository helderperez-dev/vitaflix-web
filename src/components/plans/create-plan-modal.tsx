'use client'

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { createMealPlan } from "@/app/actions/plans"
import { toast } from "sonner"
import { DictionarySelector } from "@/components/shared/dictionary-selector"

interface CreatePlanModalProps {
    userId: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreatePlanModal({ userId, isOpen, onOpenChange, onSuccess }: CreatePlanModalProps) {
    const t = useTranslations("Plans")
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [quantity, setQuantity] = useState("3")

    async function handleCreate() {
        if (!name) {
            toast.error(t("errorNameRequired"))
            return
        }

        setIsLoading(true)
        try {
            const result = await createMealPlan({
                userId,
                name,
                dailyMealsCount: parseInt(quantity),
                selectedMeals: {}
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(t("successCreated"))
                setName("")
                setQuantity("3")
                onOpenChange(false)
                onSuccess?.()
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 border-none shadow-2xl bg-white dark:bg-zinc-950">
                <DialogHeader className="space-y-3 pb-4 border-b border-border/40">
                    <DialogTitle className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2">
                        <Plus className="size-5 text-primary" />
                        {t("createNewPlan")}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                        {t("createPlanDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-6 font-medium">
                    <div className="space-y-2">
                        <Label htmlFor="plan-name" className="text-[11px] uppercase tracking-wider text-muted-foreground ml-1">
                            {t("labelPlanName")}
                        </Label>
                        <Input
                            id="plan-name"
                            placeholder={t("placeholderPlanName")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 rounded-2xl bg-muted/10 border-border/40 focus:ring-primary/20 focus:border-primary transition-all text-sm px-5"
                        />
                    </div>
                    <div className="space-y-2">
                        <DictionarySelector
                            label={t("labelMealQuantity")}
                            value={quantity}
                            onChange={(val: string) => setQuantity(val)}
                            table="meal_plan_sizes"
                            placeholder={t("selectQuantity")}
                            allowCreation={false}
                        />
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t border-border/40 gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-2xl font-bold text-[11px] uppercase tracking-wider h-11 px-6 hover:bg-muted/15 transition-colors"
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isLoading}
                        className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-primary/10 h-11 px-8 transition-all active:scale-95 disabled:grayscale"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("creating")}
                            </>
                        ) : (
                            t("createPlan")
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
