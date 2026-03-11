
import { getDefaultLocale, getSystemConfig } from "@/app/actions/settings"
import PlatformPage_Client from "./_components/platform-client"

export default async function PlatformSettingsPage() {
    const defaultLocale = await getDefaultLocale()
    const platformName = await getSystemConfig('platform_name', 'Vitaflix')
    const supportEmail = await getSystemConfig('support_email', 'support@vitaflix.com')
    const allowSignups = await getSystemConfig('allow_signups', true)

    // New settings
    const maintenanceMode = await getSystemConfig('maintenance_mode', false)
    const supportPhone = await getSystemConfig('support_phone', '')
    const termsUrl = await getSystemConfig('terms_url', '')
    const privacyUrl = await getSystemConfig('privacy_url', '')
    const instagramUrl = await getSystemConfig('instagram_url', '')
    const facebookUrl = await getSystemConfig('facebook_url', '')
    const logoUrl = await getSystemConfig('logo_url', '')
    const faviconUrl = await getSystemConfig('favicon_url', '')

    return (
        <PlatformPage_Client
            initialData={{
                defaultLocale,
                platformName: platformName as string,
                supportEmail: supportEmail as string,
                allowSignups: allowSignups as boolean,
                maintenanceMode: maintenanceMode as boolean,
                supportPhone: supportPhone as string,
                termsUrl: termsUrl as string,
                privacyUrl: privacyUrl as string,
                instagramUrl: instagramUrl as string,
                facebookUrl: facebookUrl as string,
                logoUrl: logoUrl as string,
                faviconUrl: faviconUrl as string,
            }}
        />
    )
}
