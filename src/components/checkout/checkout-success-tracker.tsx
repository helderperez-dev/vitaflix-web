"use client"

import { useEffect } from "react"
import { usePostHog } from "posthog-js/react"

// Declare fbq globally to avoid TypeScript errors
declare global {
    interface Window {
        fbq: any;
    }
}

export function CheckoutSuccessTracker({ amount, currency }: { amount?: number, currency?: string }) {
    const posthog = usePostHog()

    useEffect(() => {
        // Track with PostHog
        posthog?.capture("Purchase", {
            source: "success_page",
            amount: amount,
            currency: currency
        })

        // Track with Meta Pixel
        if (typeof window !== "undefined" && window.fbq && amount) {
            // Amount is typically in cents (e.g. 3900), so we divide by 100 for the Pixel
            window.fbq("track", "Purchase", {
                currency: (currency || "EUR").toUpperCase(),
                value: amount / 100
            })
        }
    }, [posthog, amount, currency])

    return null
}
