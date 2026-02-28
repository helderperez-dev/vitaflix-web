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
import { tagSchema, type Tag } from "@/shared-schemas/tag"
import { upsertTag, deleteTag } from "@/app/actions/tags"

interface TagModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tag?: Tag | null
    onSuccess?: () => void
}

export function TagModal({ open, onOpenChange, tag, onSuccess }: TagModalProps) {
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
            const result = await upsertTag(values)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(tag ? "Tag updated successfully" : "Tag created successfully")
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
            const result = await deleteTag(tag.id)
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
                    <DialogHeader className=" space-y-2">
                        <DialogTitle className="text-xl font-bold tracking-tight text-secondary">
                            {tag ? "Edit Tag" : "New Tag"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            {tag
                                ? "Update the multilingual names for this organizational tag."
                                : "Create a new tag to group and filter your content across languages."}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form id="tag-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <TranslationFields
                                form={form}
                                namePrefix="name"
                                label="Tag Name"
                                placeholder="e.g. Protein"
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
                                className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-colors gap-2"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Tag
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="h-9 px-6 font-bold text-[10px] uppercase tracking-widest border-border hover:bg-muted/10 transition-colors"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting || isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="tag-form"
                            className="h-9 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase tracking-widest shadow-sm shadow-primary/10 transition-all active:scale-[0.98]"
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
