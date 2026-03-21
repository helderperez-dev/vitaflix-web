import { PostHog } from "posthog-node"

type PostHogClient = {
    capture: (payload: { distinctId: string; event: string; properties?: Record<string, unknown> }) => void
    identify: (payload: { distinctId: string; properties?: Record<string, unknown> }) => void
    shutdown: () => Promise<void>
}

const posthogNoopClient: PostHogClient = {
    capture: () => undefined,
    identify: () => undefined,
    shutdown: async () => undefined,
}

const posthogKey = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost = process.env.POSTHOG_HOST || "https://us.i.posthog.com"

export const isPostHogEnabled =
    Boolean(posthogKey) &&
    ["production", "prod"].includes(
        (
            process.env.VERCEL_ENV ??
            process.env.NODE_ENV ??
            process.env.ENVIRONMENT ??
            process.env.NEXT_PUBLIC_ENVIRONMENT ??
            ""
        ).toLowerCase()
    )

function createPostHogClient(): PostHogClient {
    if (!isPostHogEnabled || !posthogKey) {
        return posthogNoopClient
    }

    return new PostHog(posthogKey, {
        host: posthogHost,
        flushAt: 1,
        flushInterval: 0,
    })
}

declare global {
    var posthog: undefined | PostHogClient
}

export function getPostHogClient(): PostHogClient {
    if (!globalThis.posthog) {
        globalThis.posthog = createPostHogClient()
    }

    return globalThis.posthog
}

const posthogServer = getPostHogClient()

export default posthogServer
