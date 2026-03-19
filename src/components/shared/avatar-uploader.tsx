"use client"

import * as React from "react"
import { Camera, X, Loader2, User } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn, getMediaUrl } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { CropModal } from "./crop-modal"

interface AvatarUploaderProps {
    value?: string | null
    onChange: (url: string | null) => void
    displayName?: string | null
    folder?: string
    size?: "sm" | "md" | "lg"
    showLabel?: boolean
}

export function AvatarUploader({
    value,
    onChange,
    displayName,
    folder = "profiles",
    size = "lg",
    showLabel = true
}: AvatarUploaderProps) {
    const [isUploading, setIsUploading] = React.useState(false)
    const [cropModalOpen, setCropModalOpen] = React.useState(false)
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file.")
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setSelectedImage(reader.result as string)
            setCropModalOpen(true)
        }
        reader.readAsDataURL(file)
    }

    const onCropComplete = async (croppedFile: File) => {
        setIsUploading(true)
        try {
            const fileName = `${crypto.randomUUID()}.jpg`
            const filePath = `${folder}/${fileName}`

            // Upload the cropped file
            const { error: uploadError } = await supabase.storage
                .from('vitaflix')
                .upload(filePath, croppedFile)

            if (uploadError) throw uploadError

            onChange(filePath)
            toast.success("Profile picture updated.")
        } catch (error) {
            toast.error("Failed to upload image.")
            console.error(error)
        } finally {
            setIsUploading(false)
            setSelectedImage(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removeAvatar = async () => {
        if (!value) return

        try {
            const path = value.includes('vitaflix/') 
                ? value.split('vitaflix/').pop() 
                : value
            
            if (path) {
                const { error } = await supabase.storage.from('vitaflix').remove([path])
                if (error) {
                    console.error("Failed to delete file from storage:", error)
                }
            }
            onChange(null)
            toast.success("Profile picture removed.")
        } catch (error) {
            console.error(error)
        }
    }

    const initials = displayName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"

    return (
        <div className={cn("flex flex-col items-center gap-4", !showLabel && "gap-0")}>
            <div className="relative group">
                <Avatar className={cn(
                    "shadow-xl bg-background rounded-lg overflow-hidden",
                    size === "sm" ? "size-16" : size === "md" ? "size-24 border-3 border-white" : "size-32 border-4 border-white"
                )}>
                    {value ? (
                        <AvatarImage src={getMediaUrl(value)} alt={displayName || "User"} className="object-cover" />
                    ) : null}
                    <AvatarFallback className={cn(
                        "bg-primary/5 text-primary font-bold",
                        size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"
                    )}>
                        {initials}
                    </AvatarFallback>
                </Avatar>

                {isUploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center z-10">
                        <Loader2 className="size-8 text-white animate-spin" />
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={cn(
                        "absolute bottom-0 right-0 bg-primary rounded-lg border-white flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 hover:bg-primary/90",
                        size === "sm" ? "size-6 border-2 bottom-0 right-0" : size === "md" ? "size-8 border-3 bottom-0.5 right-0.5" : "size-10 border-4 bottom-1 right-1"
                    )}
                >
                    <Camera className={cn(size === "sm" ? "size-3" : size === "md" ? "size-4" : "size-5")} />
                </button>

                {value && !isUploading && (
                    <button
                        type="button"
                        onClick={removeAvatar}
                        className={cn(
                            "absolute bg-white rounded-lg border border-border flex items-center justify-center text-muted-foreground shadow-md transition-all hover:scale-110 active:scale-95 group-hover:opacity-100 opacity-0 hover:bg-muted",
                            size === "sm" ? "size-5 top-0 right-0" : size === "md" ? "size-6 top-0.5 right-0.5" : "size-7 top-1 right-1"
                        )}
                    >
                        <X className={cn(size === "sm" ? "size-3" : "size-4")} />
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
            />

            {showLabel && (
                <div className="text-center">
                    <p className="text-sm font-bold text-secondary dark:text-white capitalize tracking-wider">{displayName || "Profile Identification"}</p>
                </div>
            )}

            <CropModal
                open={cropModalOpen}
                onOpenChange={setCropModalOpen}
                image={selectedImage}
                onCropComplete={onCropComplete}
            />
        </div>
    )
}
