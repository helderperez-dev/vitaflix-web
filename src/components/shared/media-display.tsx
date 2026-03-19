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
    const fullUrl = React.useMemo(() => getMediaUrl(src), [src])
    
    if (!fullUrl) return null

    // Clean URL from query parameters if any to parse the extension correctly
    const cleanUrl = fullUrl.split('?')[0]
    const isVideo = cleanUrl.match(/\.(mp4|webm|mov|ogg|m4v|3gp|mkv)$/i)

    if (isVideo) {
        return (
            <video
                src={fullUrl}
                className={cn("w-full h-full object-cover", className, videoClassName)}
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
            className={cn("w-full h-full object-cover", className)}
            {...props}
        />
    )
}
