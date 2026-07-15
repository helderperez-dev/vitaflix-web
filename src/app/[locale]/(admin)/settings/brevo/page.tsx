import { getSystemConfig } from "@/app/actions/settings"
import BrevoPage_Client from "./_components/brevo-client"
import { BrevoConfig } from "@/components/settings/brevo-setting"

const DEFAULT_CONFIG: BrevoConfig = {
    landingPage: { enabled: true, listId: 10 },
    addLead: { enabled: true, listId: 10 },
    importCsv: { enabled: true, listId: 10 },
    kanbanSync: { enabled: true, listId: 10 },
    dataGridSync: { enabled: true, listId: 10 }
};

export default async function BrevoSettingsPage() {
    const brevoConfig = await getSystemConfig('brevo_config', DEFAULT_CONFIG) as BrevoConfig

    return (
        <BrevoPage_Client initialConfig={brevoConfig} />
    )
}
