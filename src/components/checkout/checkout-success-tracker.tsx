"use client"

import { useEffect } from "react"
import { usePostHog } from "posthog-js/react"

export function CheckoutSuccessTracker() {
    const posthog = usePostHog()

    useEffect(() => {
        posthog?.capture("payment_success", {
            source: "success_page"
        })
    }, [posthog])

    return null
}
