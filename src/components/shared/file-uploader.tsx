"use client"

import * as React from "react"
import { UploadCloud, X, Loader2, FileText, Paperclip } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
    folder: string
    value: string[] // Array of URLs
    onChange: (urls: string[]) => void
    maxFiles?: number
    accept?: string
}

export function FileUploader({
    folder,
    value = [],
    onChange,
    maxFiles = 5,
    accept = ".pdf,.docx,.doc,.txt,.xlsx,.xls"
}: FileUploaderProps) {
    const [isUploading, setIsUploading] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        if (value.length + files.length > maxFiles) {
            toast.error(`You can only upload up to ${maxFiles} files.`)
            return
        }

        setIsUploading(true)
        const newUrls = [...value]

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

            newUrls.push(filePath)
        }

        onChange(newUrls)
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const removeFile = async (indexToRemove: number) => {
        const urlToRemove = value[indexToRemove]
        if (!urlToRemove) return

        const path = urlToRemove.includes('vitaflix/') 
            ? urlToRemove.split('vitaflix/').pop() 
            : urlToRemove
            
        if (path) {
            const { error } = await supabase.storage.from('vitaflix').remove([path])
            if (error) {
                toast.error("Failed to delete file from storage")
                console.error(error)
            }
        }

        const newUrls = value.filter((_, i) => i !== indexToRemove)
        onChange(newUrls)
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {value.map((url, index) => {
                    // Get filename from path or URL
                    const fileName = url.split('/').pop()?.split('-').slice(5).join('-') || "Document"
                    return (
                        <div key={url} className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border/40 group max-w-[200px]">
                            <FileText className="size-4 text-primary shrink-0" />
                            <span className="text-[10px] font-medium truncate flex-1">{fileName}</span>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    )
                })}
            </div>

            {value.length < maxFiles && (
                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={cn(
                        "p-3 rounded-lg border border-dashed border-border/60 bg-muted/5 flex items-center gap-3 group cursor-pointer hover:bg-muted/10 transition-colors",
                        isUploading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept={accept}
                        multiple={maxFiles > 1}
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                    <div className="size-8 rounded-lg bg-white border border-border/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                        {isUploading ? <Loader2 className="size-4 text-primary animate-spin" /> : <Paperclip className="size-4 text-muted-foreground group-hover:text-primary" />}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold capitalize tracking-tight text-muted-foreground group-hover:text-primary transition-colors">
                            {isUploading ? "Uploading..." : "Attach Document"}
                        </p>
                        <p className="text-[9px] text-muted-foreground/40">{accept.replace(/\./g, "").toUpperCase()} up to 10MB</p>
                    </div>
                </div>
            )}
        </div>
    )
}
