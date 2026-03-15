import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeMessages(
    base: Record<string, unknown>,
    override: Record<string, unknown>
): Record<string, unknown> {
    const merged: Record<string, unknown> = { ...base };

    for (const [key, value] of Object.entries(override)) {
        const current = merged[key];
        if (isRecord(current) && isRecord(value)) {
            merged[key] = mergeMessages(current, value);
            continue;
        }
        merged[key] = value;
    }

    return merged;
}

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    const baseMessages = (await import('../../messages/en.json')).default as Record<string, unknown>;
    const localeMessages = (await import(`../../messages/${locale}.json`)).default as Record<string, unknown>;

    return {
        locale,
        messages: mergeMessages(baseMessages, localeMessages)
    };
});
