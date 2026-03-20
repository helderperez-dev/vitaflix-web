'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
        const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

        if (isProd && key) {
            posthog.init(key, {
                api_host: host || 'https://us.i.posthog.com',
                person_profiles: 'always',
                capture_pageview: false, // Recommended for SPAs like Next.js
                capture_pageleave: true,
            })
        }
    }, [])

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
