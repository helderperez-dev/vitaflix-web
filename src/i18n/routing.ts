import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'es', 'pt-pt', 'pt-br'],

    // Used when no locale matches
    defaultLocale: 'en',

    // Enable locale detection from cookies and Accept-Language header
    localeDetection: true
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
