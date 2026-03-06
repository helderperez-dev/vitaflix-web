import { getTranslations } from "next-intl/server"
import { getFunnelsAction } from "@/app/actions/leads"
import { FunnelsManager } from "@/components/leads/funnels-manager"

export async function generateMetadata() {
    return {
        title: "Manage Funnels | Vitaflix Admin",
    }
}

export default async function FunnelsPage() {
    const t = await getTranslations("Common")
    const funnelsResult = await getFunnelsAction()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <FunnelsManager initialFunnels={funnelsResult.funnels || []} />
        </div>
    )
}
