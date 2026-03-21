import React from 'react'
import { cn, getMediaUrl } from "@/lib/utils"

interface MediaDisplayProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    alt?: string;
    className?: string;
    videoClassName?: string;
    showControls?: boolean;
    loop?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
}

export function MediaDisplay({
    src,
    alt,
    className,
    videoClassName,
    showControls = false,
    loop = true,
    autoPlay = true,
    muted = true,
    ...props
}: MediaDisplayProps) {
    const fullUrl = React.useMemo(() => {
        if (!src) return ""
        if (src.startsWith("http") || src.startsWith("data:")) return src
        
        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const cleanPath = src.startsWith("/") ? src.slice(1) : src
        
        const finalUrl = `${baseUrl}/storage/v1/object/public/vitaflix/${cleanPath}`
        
        if (process.env.NODE_ENV === 'development' && !baseUrl) {
            console.warn("MediaDisplay: NEXT_PUBLIC_SUPABASE_URL is missing!")
        }
        
        return finalUrl
    }, [src])
    
    if (!fullUrl) return null

    // Clean URL from query parameters if any to parse the extension correctly
    const cleanUrl = fullUrl.split('?')[0]
    const isVideo = cleanUrl.match(/\.(mp4|webm|mov|ogg|m4v|3gp|mkv)$/i)

    if (isVideo) {
        return (
            <video
                src={fullUrl}
                className={cn("w-full h-full object-cover bg-white", className, videoClassName)}
                muted={muted}
                playsInline
                autoPlay={autoPlay}
                loop={loop}
                controls={showControls}
            />
        )
    }

    return (
        <img
            src={fullUrl}
            alt={alt || "Media"}
            className={cn("w-full h-full object-cover bg-white", className)}
            {...props}
        />
    )
}
