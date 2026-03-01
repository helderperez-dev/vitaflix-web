import { createClient } from "@/lib/supabase/server"
import { UserTableWrapper } from "@/components/users/user-table-wrapper"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
    const supabase = await createClient()

    const { data: users } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

    return <UserTableWrapper initialUsers={users || []} />
}
