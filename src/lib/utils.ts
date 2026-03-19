import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves a media path to a full URL.
 * If the path is already a full URL (starts with http), it returns it as is.
 * Otherwise, it concatenates the Supabase storage public URL.
 */
export function getMediaUrl(path: string | null | undefined): string {
    if (!path) return ""
    if (path.startsWith("http") || path.startsWith("data:")) return path

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) return path

    // Clean leading slash from path if any
    const cleanPath = path.startsWith("/") ? path.slice(1) : path

    return `${supabaseUrl}/storage/v1/object/public/vitaflix/${cleanPath}`
}
