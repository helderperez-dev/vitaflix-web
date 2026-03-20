import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { postHogMiddleware } from '@posthog/next';
import { type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);
const posthogProxyConfig = {
    pathPrefix: '/ingest',
    host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
};
const posthogProxyMiddleware = postHogMiddleware({ proxy: posthogProxyConfig });

export default async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/ingest')) {
        return posthogProxyMiddleware(request);
    }

    const response = intlMiddleware(request);
    return postHogMiddleware({ response, proxy: posthogProxyConfig })(request);
}

export const config = {
    matcher: ['/ingest/:path*', '/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)']
};
