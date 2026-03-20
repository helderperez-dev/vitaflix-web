import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { postHogMiddleware } from '@posthog/next';
import { type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);
const posthogProxyMiddleware = postHogMiddleware({ proxy: true });

export default async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/ingest')) {
        return posthogProxyMiddleware(request);
    }

    const response = intlMiddleware(request);
    return postHogMiddleware({ response })(request);
}

export const config = {
    // Match all pathnames except for
    // - … if they contain a dot (e.g. `favicon.ico`)
    // - api routes
    // - _next (internal paths)
    // - metadata files (e.g. `robots.txt`, `icon`, `apple-icon`)
    matcher: ['/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)']
};
