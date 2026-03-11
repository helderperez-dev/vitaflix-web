"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TranslationFields } from "./translation-fields"
import { ImageUploader } from "./image-uploader"
import { tagSchema, type Tag, type TagTable } from "@/shared-schemas/tag"
import { upsertTag, deleteTag } from "@/app/actions/tags"

interface TagDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tag?: Tag | null
    onSuccess?: () => void
    table?: TagTable
}

const TABLE_CONFIG: Record<TagTable, {
    editTitle: string
    newTitle: string
    editDescription: string
    newDescription: string
    fieldLabel: string
    toastEdit: string
    toastNew: string
}> = {
    tags: {
        editTitle: "Edit tag",
        newTitle: "New tag",
        editDescription: "Update organizational markers.",
        newDescription: "Create a new marker to filter content across languages.",
        fieldLabel: "Tag name",
        toastEdit: "Tag updated successfully",
        toastNew: "Tag created successfully",
    },
    meal_categories: {
        editTitle: "Edit meal type",
        newTitle: "New meal type",
        editDescription: "Update meal type configuration.",
        newDescription: "Create a new meal type category.",
        fieldLabel: "Meal type name",
        toastEdit: "Meal type updated",
        toastNew: "Meal type created",
    },
    dietary_tags: {
        editTitle: "Edit dietary tag",
        newTitle: "New dietary tag",
        editDescription: "Update dietary restriction or preference.",
        newDescription: "Create a new dietary filter for health requirements.",
        fieldLabel: "Dietary tag name",
        toastEdit: "Dietary tag updated",
        toastNew: "Dietary tag created",
    },
    user_roles: {
        editTitle: "Edit role",
        newTitle: "New role",
        editDescription: "Update role configuration.",
        newDescription: "Create a new system role.",
        fieldLabel: "Role name",
        toastEdit: "Role updated",
        toastNew: "Role created",
    },
    wellness_objectives: {
        editTitle: "Edit goal",
        newTitle: "New goal",
        editDescription: "Update wellness goal.",
        newDescription: "Create a new wellness goal.",
        fieldLabel: "Goal name",
        toastEdit: "Goal updated",
        toastNew: "Goal created",
    },
    meal_plan_sizes: {
        editTitle: "Edit cycle",
        newTitle: "New service cycle",
        editDescription: "Update daily meals configuration.",
        newDescription: "Define a new service frequency for automated plans.",
        fieldLabel: "Configuration name",
        toastEdit: "Service cycle updated",
        toastNew: "Service cycle created",
    },
    product_groups: {
        editTitle: "Edit group",
        newTitle: "New group",
        editDescription: "Update product group info.",
        newDescription: "Organize your inventory into high-level groups.",
        fieldLabel: "Group name",
        toastEdit: "Group updated",
        toastNew: "Group created",
    },
    brands: {
        editTitle: "Edit brand",
        newTitle: "New brand",
        editDescription: "Update manufacturer identity.",
        newDescription: "Register a new brand for product classification.",
        fieldLabel: "Brand name",
        toastEdit: "Brand updated",
        toastNew: "Brand created",
    },
}

export function TagDrawer({ open, onOpenChange, tag, onSuccess, table = "tags" }: TagDrawerProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const config = TABLE_CONFIG[table]

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
                toast.success(tag ? config.toastEdit : config.toastNew)
                onSuccess?.()
                onOpenChange(false)
            }
        } catch (error) {
            toast.error("Failed to save tag")
        } finally {
            setIsSubmitting(false)
        }
    }

    async function onDelete() {
        if (!tag?.id) return
        if (!confirm("Are you sure you want to delete this item? This cannot be undone and may affect associated records.")) return

        setIsDeleting(true)
        try {
            const result = await deleteTag(tag.id, table)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Deleted successfully")
                onSuccess?.()
                onOpenChange(false)
            }
        } catch (error) {
            toast.error("Failed to delete")
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
                                {tag ? config.editTitle : config.newTitle}
                            </SheetTitle>
                            <SheetDescription className="text-sm">
                                {tag ? config.editDescription : config.newDescription}
                            </SheetDescription>

                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
                        <Form {...form}>
                            <form id="tag-drawer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                                <TranslationFields
                                    form={form}
                                    namePrefix="name"
                                    label={config.fieldLabel}
                                    placeholder={table === "meal_plan_sizes" ? "e.g. 5 Meals per day" : "Display name..."}
                                />

                                {table === "brands" && (
                                    <div className="space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap capitalize tracking-widest opacity-80">Manufacturer identity</h3>
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
                                Cancel
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
                                Save
                            </Button>
                        </div>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    )
}
