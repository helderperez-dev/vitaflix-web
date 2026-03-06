import { getTranslations } from "next-intl/server"
import { getFunnelsAction, getLeadsAction } from "@/app/actions/leads"
import { LeadsManager } from "@/components/leads/leads-manager"

export async function generateMetadata() {
    return {
        title: "Leads | Vitaflix Admin",
    }
}

export default async function LeadsPage() {
    const t = await getTranslations("Common")

    const funnelsResult = await getFunnelsAction()
    // By default fetch all leads, or just for the first funnel.
    const leadsResult = await getLeadsAction(undefined)

    return (
        <LeadsManager
            initialFunnels={funnelsResult.funnels || []}
            initialLeads={leadsResult.leads || []}
        />
    )
}
