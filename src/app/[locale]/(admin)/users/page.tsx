import { createClient } from "@/lib/supabase/server"
import { UserTableWrapper } from "@/components/users/user-table-wrapper"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
    const supabase = await createClient()

    // Get current user session
    const { data: { user: authUser } } = await supabase.auth.getUser()

    const { data: users } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

    // Fetch user profile for preferences
    const { data: userProfile } = authUser ? await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single() : { data: null }

    return <UserTableWrapper initialUsers={users || []} userProfile={userProfile} />
}
