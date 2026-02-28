import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    // This should correspond to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        // Here we could fetch the global default from the DB if needed
        // For simplicity and performance, we'll keep the routing.defaultLocale as static
        // but we've already ensured logic elsewhere updates the user preference.
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
