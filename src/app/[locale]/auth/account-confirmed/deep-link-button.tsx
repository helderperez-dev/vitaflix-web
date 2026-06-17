"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

const DEFAULT_MOBILE_APP_DEEP_LINK = "vitaflix://login-callback"

export function DeepLinkButton({ text }: { text: string }) {
    const linkRef = useRef<HTMLAnchorElement>(null)

    useEffect(() => {
        // If there's a hash (like #access_token=...), append it to the deep link
        // so the mobile app can catch the session.
        if (typeof window !== "undefined" && window.location.hash && linkRef.current) {
            const baseLink = process.env.NEXT_PUBLIC_MOBILE_APP_DEEP_LINK || DEFAULT_MOBILE_APP_DEEP_LINK
            linkRef.current.href = `${baseLink}${window.location.hash}`
        }
    }, [])

    const baseLink = process.env.NEXT_PUBLIC_MOBILE_APP_DEEP_LINK || DEFAULT_MOBILE_APP_DEEP_LINK

    return (
        <Button asChild size="lg" className="h-12 w-full sm:w-auto rounded-full px-8 text-sm font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <a ref={linkRef} href={baseLink}>{text}</a>
        </Button>
    )
}
