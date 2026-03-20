'use client'

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { usePostHog } from 'posthog-js/react'

function PostHogPageViewContent() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const posthog = usePostHog()
    const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "production"

    useEffect(() => {
        if (isProduction && pathname && posthog) {
            let url = window.origin + pathname
            if (searchParams.toString()) {
                url = url + "?" + searchParams.toString()
            }
            posthog.capture('$pageview', {
                '$current_url': url,
            })
        }
    }, [isProduction, pathname, searchParams, posthog])

    return null
}

export default function PostHogPageView() {
    return (
        <Suspense fallback={null}>
            <PostHogPageViewContent />
        </Suspense>
    )
}
