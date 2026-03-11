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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TranslationFields } from "./translation-fields"
import { tagSchema, type Tag, type TagTable } from "@/shared-schemas/tag"
import { upsertTag, deleteTag } from "@/app/actions/tags"

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
                    table === "user_roles" ? (tag ? "Role updated" : "Role created") :
                        table === "wellness_objectives" ? (tag ? "Objective updated" : "Objective created") :
                            table === "product_groups" ? (tag ? "Product Group updated" : "Product Group created") :
                                (tag ? "Tag updated successfully" : "Tag created successfully")
                )
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
        if (!confirm("Are you sure you want to delete this tag? This cannot be undone and may affect associated products.")) return

        setIsDeleting(true)
        try {
            const result = await deleteTag(tag.id, table)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Tag deleted successfully")
                onSuccess?.()
                onOpenChange(false)
            }
        } catch (error) {
            toast.error("Failed to delete tag")
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
                        <DialogTitle className="text-xl font-semibold tracking-tight text-secondary dark:text-foreground">
                            {table === "user_roles" ? (tag ? "Edit Role" : "New Role") :
                                table === "wellness_objectives" ? (tag ? "Edit Objective" : "New Objective") :
                                    table === "meal_plan_sizes" ? (tag ? "Edit Config" : "New Config") :
                                        table === "product_groups" ? (tag ? "Edit Product Group" : "New Product Group") :
                                            (tag ? "Edit Tag" : "New Tag")}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            {table === "user_roles" ? (tag ? "Update role configuration" : "Create a new system role") :
                                table === "wellness_objectives" ? (tag ? "Update wellness objective" : "Create a new system objective") :
                                    table === "meal_plan_sizes" ? (tag ? "Update daily meals configuration" : "Create a configuration for daily meals. Start with the number (e.g. '5 Meals a day')") :
                                        table === "product_groups" ? (tag ? "Update product group info" : "Create a new product group to organize your products.") :
                                            (tag ? "Update the multilingual names for this organizational tag." : "Create a new tag to group and filter your content across languages.")}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form id="tag-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <TranslationFields
                                form={form}
                                namePrefix="name"
                                label={table === "user_roles" ? "Role Name" : table === "wellness_objectives" ? "Objective Name" : table === "meal_plan_sizes" ? "Configuration Name" : table === "product_groups" ? "Group Name" : "Tag Name"}
                                placeholder={table === "meal_plan_sizes" ? "e.g. 5 Meals per day" : "Display Name..."}
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
                                {table === "user_roles" ? "Delete Role" : table === "wellness_objectives" ? "Delete Objective" : table === "meal_plan_sizes" ? "Delete Config" : table === "product_groups" ? "Delete Product Group" : "Delete Tag"}
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
                            Cancel
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
                            Save
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
