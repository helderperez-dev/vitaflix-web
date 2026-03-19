"use client"

import * as React from "react"
import { UploadCloud, X, Star, Loader2, GripVertical, WandSparkles, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { ProductImage } from "@/shared-schemas/product"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { MediaDisplay } from "./media-display"
import { useTranslations } from "next-intl"
import { enhanceImageWithAI, generateImageWithAI } from "@/app/actions/ai"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

interface ImageUploaderProps {
    folder: string
    value: ProductImage[]
    onChange: (images: ProductImage[]) => void
    maxImages?: number
    enableAI?: boolean
    aiEntityName?: string
    aiContext?: string
    aiRuntimeContext?: Record<string, unknown>
}

export function ImageUploader({ folder, value = [], onChange, maxImages = 10, enableAI = false, aiEntityName, aiContext, aiRuntimeContext }: ImageUploaderProps) {
    const t = useTranslations("Common")
    const aiT = useTranslations("AIActions")
    const [isUploading, setIsUploading] = React.useState(false)
    const [isAiLoading, setIsAiLoading] = React.useState<"generate" | "enhance" | null>(null)
    const [aiProcessingIndex, setAiProcessingIndex] = React.useState<number | null>(null)
    const [draggedItemIndex, setDraggedItemIndex] = React.useState<number | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const resolveEntityName = React.useMemo(() => {
        if (aiEntityName?.trim()) return aiEntityName.trim()
        const folderName = folder.split("/").filter(Boolean).pop()
        return folderName || "food"
    }, [aiEntityName, folder])

    const uploadDataUrl = async (dataUrl: string) => {
        if (!dataUrl.startsWith("data:")) {
            throw new Error("Invalid AI image payload")
        }
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const extension = blob.type.includes("png") ? "png" : "jpg"
        const filePath = `${folder}/${crypto.randomUUID()}.${extension}`
        const { error } = await supabase.storage.from("vitaflix").upload(filePath, blob, {
            contentType: blob.type || "image/png",
            upsert: false,
        })
        if (error) {
            throw new Error(error.message)
        }
        return filePath
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        if (value.length + files.length > maxImages) {
            toast.error(t("maxImagesExceeded"))
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
                toast.error(t("errorSaving"))
                console.error(uploadError)
                continue
            }

            newImages.push({
                url: filePath,
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

        // Extract path from public URL if it's a full URL, otherwise use it as is
        const path = imageToRemove.url.includes('vitaflix/') 
            ? imageToRemove.url.split('vitaflix/').pop() 
            : imageToRemove.url

        if (path) {
            const { error } = await supabase.storage.from('vitaflix').remove([path])
            if (error) {
                toast.error(t("errorSaving"))
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

    const handleGenerateWithAI = async () => {
        setIsAiLoading("generate")
        setAiProcessingIndex(null)
        try {
            const result = await generateImageWithAI({
                entityName: resolveEntityName,
                context: aiContext,
                runtimeContext: aiRuntimeContext,
            })
            if (result.error || !result.imageDataUrl) {
                toast.error(result.error || aiT("genericError"))
                return
            }
            const imagePath = await uploadDataUrl(result.imageDataUrl)
            const newImages = value.map(image => ({ ...image, isDefault: false }))
            newImages.push({ url: imagePath, isDefault: newImages.length === 0 })
            onChange(newImages)
            toast.success(aiT("imageGenerated"))
        } catch (error) {
            toast.error(error instanceof Error ? error.message : aiT("genericError"))
        } finally {
            setIsAiLoading(null)
        }
    }

    const handleEnhanceWithAI = async (index?: number) => {
        const targetIndex = typeof index === 'number' ? index : value.findIndex(image => image.isDefault) || 0
        const currentImage = value[targetIndex]
        if (!currentImage?.url) {
            toast.error(aiT("missingImage"))
            return
        }
        setIsAiLoading("enhance")
        setAiProcessingIndex(targetIndex)
        try {
            const result = await enhanceImageWithAI({
                imageUrl: currentImage.url,
                entityName: resolveEntityName,
                context: aiContext,
                runtimeContext: aiRuntimeContext,
            })
            if (result.error || !result.imageDataUrl) {
                toast.error(result.error || aiT("genericError"))
                return
            }
            const imagePath = await uploadDataUrl(result.imageDataUrl)
            const newImages = [...value]
            // Insert after current
            newImages.splice(targetIndex + 1, 0, { url: imagePath, isDefault: false })
            onChange(newImages)
            toast.success(aiT("imageEnhanced"))
        } catch (error) {
            toast.error(error instanceof Error ? error.message : aiT("genericError"))
        } finally {
            setIsAiLoading(null)
            setAiProcessingIndex(null)
        }
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
        <TooltipProvider>
            <div className="space-y-4">
                {enableAI && (
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-8 px-3 text-xs font-semibold gap-2 border-border/60"
                            disabled={isAiLoading !== null || isUploading}
                            onClick={handleGenerateWithAI}
                        >
                            {isAiLoading === "generate" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                            {aiT("generateImage")}
                        </Button>
                    </div>
                )}
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
                                "relative group aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-move",
                                image.isDefault ? "border-white ring-2 ring-black/5" : "border-border/30",
                                draggedItemIndex === index && "opacity-50 scale-95"
                            )}
                        >
                            <MediaDisplay
                                src={image.url}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover"
                                autoPlay={true}
                                muted={true}
                                loop={true}
                            />

                            {/* AI Processing Overlay */}
                            {isAiLoading && aiProcessingIndex === index && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                                    <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest animate-pulse">{t("loading")}</p>
                                </div>
                            )}

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5 z-10">
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

                                {/* AI Actions Bar */}
                                {enableAI && (
                                    <div className="flex justify-center gap-1.5 mb-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleEnhanceWithAI(index); }}
                                                    disabled={isAiLoading !== null}
                                                    className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg transition-all backdrop-blur-md active:scale-90 disabled:opacity-50"
                                                >
                                                    <WandSparkles className="h-4 w-4" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-[10px] font-bold uppercase">{aiT("enhanceImage")}</TooltipContent>
                                        </Tooltip>
                                    </div>
                                )}

                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setDefault(index)}
                                        className={cn(
                                            "px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98]",
                                            image.isDefault
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-white/20 hover:bg-white/40 text-white backdrop-blur-md"
                                        )}
                                    >
                                        <Star className={cn("h-3 w-3", image.isDefault && "fill-current")} />
                                        {image.isDefault ? t("defaultMedia") : t("setAsDefault")}
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
                            "relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group",
                            isUploading
                                ? "border-primary bg-primary/5 cursor-not-allowed ring-2 ring-primary/5"
                                : "border-border/60 hover:border-primary/50 hover:bg-primary/[0.02] bg-muted/5 font-medium"
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,video/mp4,video/webm,video/quicktime"
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
                                <p className="text-xs font-semibold text-primary text-center px-2">{t("loading")}</p>
                            </>
                        ) : (
                            <>
                                <div className="h-12 w-12 rounded-lg bg-white dark:bg-slate-900 border border-border/50 flex items-center justify-center mb-3 group-hover:scale-105 transition-all group-hover:border-primary/30">
                                    <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <p className="text-xs font-semibold text-muted-foreground/60 text-center px-4 group-hover:text-primary/70 transition-colors">
                                    {t("addMedia")}
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    </TooltipProvider>
)
}
