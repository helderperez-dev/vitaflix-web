'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { type ReactNode, useEffect } from 'react'

export function PHProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
        const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

        if (isProduction && key) {
            posthog.init(key, {
                api_host: host || 'https://us.i.posthog.com',
                person_profiles: 'always',
                capture_pageview: true,
                capture_pageleave: true,
            })
        }
    }, [])

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
