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
            {value.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {value.map((image, index) => (
                        <div
                            key={image.url}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                "relative group aspect-square rounded-xl overflow-hidden border-2 bg-muted transition-all cursor-move",
                                image.isDefault ? "border-primary" : "border-transparent",
                                draggedItemIndex === index && "opacity-50 scale-95"
                            )}
                        >
                            <img
                                src={image.url}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-between items-start">
                                    <div className="p-1 bg-black/40 rounded-md text-white/70">
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setDefault(index)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors",
                                            image.isDefault
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm"
                                        )}
                                    >
                                        <Star className={cn("h-3 w-3", image.isDefault && "fill-current")} />
                                        {image.isDefault ? "Thumbnail" : "Set Main"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {value.length < maxImages && (
                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={cn(
                        "w-full py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer group",
                        isUploading ? "border-primary bg-primary/5 cursor-not-allowed" : "border-border/60 hover:border-primary/50 hover:bg-muted/10 bg-muted/5"
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
                            <Loader2 className="h-6 w-6 text-primary animate-spin mb-3" />
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Uploading Media...</p>
                        </>
                    ) : (
                        <>
                            <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                <UploadCloud className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {maxImages === 1 ? 'Click to upload brand logo' : 'Click to upload product images'}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-[200px] text-center leading-relaxed">
                                {maxImages > 1 && "You can drag and drop images to reorder them."} Supports JPG, PNG, WEBP.
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
