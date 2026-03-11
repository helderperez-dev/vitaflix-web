import { getTranslations } from "next-intl/server"
import { getFunnelsAction, getLeadsAction } from "@/app/actions/leads"
import { LeadsManager } from "@/components/leads/leads-manager"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata() {
    return {
        title: "Leads | Vitaflix Admin",
    }
}

export default async function LeadsPage() {
    const supabase = await createClient()

    // Get current user session
    const { data: { user: authUser } } = await supabase.auth.getUser()

    const funnelsResult = await getFunnelsAction()
    // By default fetch all leads, or just for the first funnel.
    const leadsResult = await getLeadsAction(undefined)

    // Fetch user profile for preferences
    const { data: userProfile } = authUser ? await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single() : { data: null }

    return (
        <LeadsManager
            initialFunnels={funnelsResult.funnels || []}
            initialLeads={leadsResult.leads || []}
            userProfile={userProfile}
        />
    )
}
