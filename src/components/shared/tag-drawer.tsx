"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TranslationFields } from "./translation-fields"
import { ImageUploader } from "./image-uploader"
import { tagSchema, type Tag, type TagTable } from "@/shared-schemas/tag"
import { upsertTag, deleteTag } from "@/app/actions/tags"
import { useLocale, useTranslations } from "next-intl"

interface TagDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tag?: Tag | null
    onSuccess?: () => void
    table?: TagTable
}

export function TagDrawer({ open, onOpenChange, tag, onSuccess, table = "tags" }: TagDrawerProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const locale = useLocale()
    const commonT = useTranslations("Common")
    const usersT = useTranslations("Users")
    const isPt = locale.startsWith("pt")

    const entityLabel = React.useMemo(() => {
        if (table === "user_roles") return usersT("table.role")
        if (table === "wellness_objectives") return usersT("wellnessObjective")
        if (table === "meal_plan_sizes") return isPt ? "Ciclo de serviço" : "Service cycle"
        if (table === "product_groups") return isPt ? "Grupo" : "Group"
        if (table === "measurement_units") return isPt ? "Unidade" : "Unit"
        if (table === "countries") return isPt ? "País" : "Country"
        if (table === "brands") return commonT("brand")
        if (table === "meal_categories") return isPt ? "Categoria de refeição" : "Meal category"
        if (table === "dietary_tags") return isPt ? "Etiqueta dietética" : "Dietary tag"
        return isPt ? "Etiqueta" : "Tag"
    }, [commonT, isPt, table, usersT])

    const titleText = tag ? `${commonT("edit")} ${entityLabel}` : `${commonT("addNew")} ${entityLabel}`
    const descriptionText = isPt
        ? "Atualize os nomes traduzidos deste registo."
        : "Update the translated names for this record."

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
                toast.success(tag ? commonT("updatedSuccessfully") : commonT("createdSuccessfully"))
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-xl p-0 flex flex-col bg-background border-l border-border/40 shadow-2xl"
            >
                {/* High-End Ambient Glow */}
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-50 via-white to-white dark:from-white/[0.04] dark:via-transparent dark:to-transparent pointer-events-none -z-10" />

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
                    <SheetHeader className="px-8 py-6 space-y-3 shrink-0">
                        <div>
                            <SheetTitle className="text-2xl font-semibold tracking-tight text-secondary dark:text-foreground">
                                {titleText}
                            </SheetTitle>
                            <SheetDescription className="text-sm">
                                {descriptionText}
                            </SheetDescription>

                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
                        <Form {...form}>
                            <form id="tag-drawer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                                <TranslationFields
                                    form={form}
                                    namePrefix="name"
                                    label={entityLabel}
                                    placeholder={isPt ? "Nome de exibição..." : "Display name..."}
                                />

                                {table === "brands" && (
                                    <div className="space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap capitalize tracking-widest opacity-80">{isPt ? "Identidade do fabricante" : "Manufacturer identity"}</h3>
                                            <div className="h-px w-full bg-border/40" />
                                        </div>
                                        <ImageUploader
                                            folder={`brands/${tag?.id || 'new'}`}
                                            value={form.watch("logo_url") ? [{ url: form.watch("logo_url") as string, isDefault: true }] : []}
                                            onChange={(images) => form.setValue("logo_url", images[0]?.url || null, { shouldDirty: true })}
                                            maxImages={1}
                                        />
                                    </div>
                                )}

                            </form>
                        </Form>
                    </div>

                    <SheetFooter className="px-6 py-4 border-t flex flex-row items-center justify-end bg-muted/5 shrink-0 gap-2">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting || isDeleting}
                            >
                                {commonT("cancel")}
                            </Button>
                            <Button
                                type="submit"
                                form="tag-drawer-form"
                                className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                                disabled={isSubmitting || isDeleting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {commonT("save")}
                            </Button>
                        </div>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    )
}
