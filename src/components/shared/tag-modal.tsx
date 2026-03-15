"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TranslationFields } from "./translation-fields"
import { tagSchema, type Tag, type TagTable } from "@/shared-schemas/tag"
import { upsertTag, deleteTag } from "@/app/actions/tags"
import { useLocale, useTranslations } from "next-intl"

interface TagModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tag?: Tag | null
    onSuccess?: () => void
    table?: TagTable
}

export function TagModal({ open, onOpenChange, tag, onSuccess, table = "tags" }: TagModalProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const locale = useLocale()
    const commonT = useTranslations("Common")
    const usersT = useTranslations("Users")
    const isPt = locale.startsWith("pt")

    const getEntityLabel = React.useCallback((targetTable: TagTable) => {
        if (targetTable === "user_roles") return usersT("table.role")
        if (targetTable === "wellness_objectives") return usersT("wellnessObjective")
        if (targetTable === "meal_plan_sizes") return isPt ? "Ciclo de serviço" : "Service cycle"
        if (targetTable === "product_groups") return isPt ? "Grupo" : "Group"
        if (targetTable === "measurement_units") return isPt ? "Unidade" : "Unit"
        if (targetTable === "countries") return isPt ? "País" : "Country"
        if (targetTable === "brands") return commonT("brand")
        return isPt ? "Etiqueta" : "Tag"
    }, [commonT, isPt, usersT])

    const entityLabel = getEntityLabel(table)
    const titleText = tag ? `${commonT("edit")} ${entityLabel}` : `${commonT("addNew")} ${entityLabel}`
    const helperText = isPt
        ? "Atualize os nomes traduzidos deste registo."
        : "Update the translated names for this record."
    const deleteText = `${commonT("delete")} ${entityLabel}`

    const form = useForm<Tag>({
        resolver: zodResolver(tagSchema),
        defaultValues: {
            name: {},
        },
    })

    React.useEffect(() => {
        if (tag) {
            form.reset({
                ...tag,
                name: tag.name || {},
            })
        } else {
            form.reset({
                name: {},
            })
        }
    }, [tag, form, open])

    async function onSubmit(values: Tag) {
        setIsSubmitting(true)
        try {
            const result = await upsertTag(values, table)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(
                    tag ? commonT("updatedSuccessfully") : commonT("createdSuccessfully")
                )
                onSuccess?.()
                onOpenChange(false)
            }
        } catch (error) {
            toast.error(commonT("errorSaving"))
        } finally {
            setIsSubmitting(false)
        }
    }

    async function onDelete() {
        if (!tag?.id) return
        if (!confirm(commonT("deleteConfirmationLabel"))) return

        setIsDeleting(true)
        try {
            const result = await deleteTag(tag.id, table)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(commonT("deletedSuccessfully"))
                onSuccess?.()
                onOpenChange(false)
            }
        } catch (error) {
            toast.error(commonT("errorSaving"))
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md p-0 overflow-hidden bg-background border-border"
                onInteractOutside={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                {/* Visual Accent */}
                <div className="h-1 w-full bg-primary" />

                <div className="p-8 space-y-8">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-xl font-semibold tracking-tight text-secondary dark:text-foreground">{titleText}</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            {helperText}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form id="tag-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <TranslationFields
                                form={form}
                                namePrefix="name"
                                label={entityLabel}
                                placeholder={isPt ? "Nome de exibição..." : "Display Name..."}
                            />
                        </form>
                    </Form>
                </div>

                <DialogFooter className="px-8 py-6 bg-muted/5 border-t flex flex-row items-center justify-between gap-3">
                    <div className="flex-1">
                        {tag && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                disabled={isSubmitting || isDeleting}
                                className="h-9 px-3 text-xs font-semibold text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-colors gap-2"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                {deleteText}
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="h-9 px-6 font-semibold text-xs border-border hover:bg-muted/10 transition-colors"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting || isDeleting}
                        >
                            {commonT("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            form="tag-form"
                            className="h-9 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                            disabled={isSubmitting || isDeleting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {commonT("save")}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
