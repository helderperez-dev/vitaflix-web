"use client"

import * as React from "react"
import { UploadCloud, X, Star, Loader2, GripVertical } from "lucide-react"
import { toast } from "sonner"
import type { ProductImage } from "@/shared-schemas/product"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
    folder: string
    value: ProductImage[]
    onChange: (images: ProductImage[]) => void
    maxImages?: number
}

export function ImageUploader({ folder, value = [], onChange, maxImages = 10 }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = React.useState(false)
    const [draggedItemIndex, setDraggedItemIndex] = React.useState<number | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        if (value.length + files.length > maxImages) {
            toast.error(`You can only upload up to ${maxImages} images.`)
            return
        }

        setIsUploading(true)
        const newImages: ProductImage[] = [...value]

        for (const file of files) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${crypto.randomUUID()}.${fileExt}`
            const filePath = `${folder}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('vitaflix')
                .upload(filePath, file)

            if (uploadError) {
                toast.error(`Failed to upload ${file.name}`)
                console.error(uploadError)
                continue
            }

            const { data: { publicUrl } } = supabase.storage
                .from('vitaflix')
                .getPublicUrl(filePath)

            newImages.push({
                url: publicUrl,
                isDefault: newImages.length === 0, // First image is default
            })
        }

        onChange(newImages)
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const removeImage = async (indexToRemove: number) => {
        const imageToRemove = value[indexToRemove]
        if (!imageToRemove) return

        // Extract path from public URL
        const path = imageToRemove.url.split('vitaflix/').pop()

        if (path) {
            const { error } = await supabase.storage.from('vitaflix').remove([path])
            if (error) {
                toast.error("Failed to delete image from storage")
                console.error(error)
            }
        }

        const newImages = value.filter((_, i) => i !== indexToRemove)

        // Relieve default flag if default was removed
        if (imageToRemove.isDefault && newImages.length > 0) {
            newImages[0].isDefault = true
        }

        onChange(newImages)
    }

    const setDefault = (index: number) => {
        const newImages = value.map((img, i) => ({
            ...img,
            isDefault: i === index
        }))
        onChange(newImages)
    }

    // Drag and Drop handlers for reordering
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItemIndex(index)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedItemIndex === null || draggedItemIndex === index) return

        const newImages = [...value]
        const draggedItem = newImages[draggedItemIndex]

        newImages.splice(draggedItemIndex, 1)
        newImages.splice(index, 0, draggedItem)

        onChange(newImages)
        setDraggedItemIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedItemIndex(null)
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Existing Images */}
                {value.map((image, index) => (
                    <div
                        key={image.url}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                            "relative group aspect-square rounded-2xl overflow-hidden border-2 bg-muted transition-all cursor-move shadow-sm hover:shadow-md",
                            image.isDefault ? "border-primary/50 ring-2 ring-primary/10" : "border-border/30",
                            draggedItemIndex === index && "opacity-50 scale-95"
                        )}
                    >
                        <img
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                            <div className="flex justify-between items-start">
                                <div className="p-1.5 bg-black/40 rounded-lg text-white/70 backdrop-blur-md">
                                    <GripVertical className="h-4 w-4" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors backdrop-blur-md"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setDefault(index)}
                                    className={cn(
                                        "px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
                                        image.isDefault
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "bg-white/20 hover:bg-white/40 text-white backdrop-blur-md"
                                    )}
                                >
                                    <Star className={cn("h-3 w-3", image.isDefault && "fill-current")} />
                                    {image.isDefault ? "Main Product" : "Set as Main"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Upload Trigger */}
                {value.length < maxImages && (
                    <div
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={cn(
                            "relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group shadow-sm",
                            isUploading
                                ? "border-primary bg-primary/5 cursor-not-allowed ring-2 ring-primary/5"
                                : "border-border/60 hover:border-primary/50 hover:bg-primary/[0.02] bg-muted/5 hover:shadow-md"
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            multiple={maxImages > 1}
                            onChange={handleUpload}
                            disabled={isUploading}
                        />

                        {isUploading ? (
                            <>
                                <div className="relative h-12 w-12 flex items-center justify-center mb-2">
                                    <Loader2 className="absolute h-10 w-10 text-primary animate-spin" />
                                    <UploadCloud className="h-5 w-5 text-primary/40" />
                                </div>
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] text-center px-2">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 border border-border/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-all shadow-sm group-hover:shadow-primary/10 group-hover:border-primary/30">
                                    <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] text-center px-4 group-hover:text-primary/70 transition-colors">
                                    {maxImages === 1 ? 'Add Logo' : 'Add Image'}
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
