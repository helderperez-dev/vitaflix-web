import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient as createServerClient } from "@/lib/supabase/server"

type AuthenticatedRequestUser = {
    authUser: User
    profile: {
        id: string
        email: string
        display_name: string | null
        phone: string | null
        stripe_customer_id: string | null
    }
}

function isMissingSchemaCacheRelationError(error: { code?: string } | null | undefined) {
    return error?.code === "PGRST205"
}

function getBearerToken(request: Request) {
    const authorization = request.headers.get("authorization")

    if (!authorization?.startsWith("Bearer ")) {
        return null
    }

    return authorization.slice("Bearer ".length).trim()
}

async function getUserFromBearerToken(token: string) {
    const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        }
    )

    const { data, error } = await supabase.auth.getUser()

    if (error) {
        console.error("getUserFromBearerToken error:", error);
        return null
    }

    return data.user ?? null
}

export async function getAuthenticatedRequestUser(request: Request): Promise<AuthenticatedRequestUser | null> {
    const token = getBearerToken(request)
    let authUser: User | null

    if (token) {
        authUser = await getUserFromBearerToken(token)
        if (!authUser) console.error("getAuthenticatedRequestUser: authUser from token is null");
    } else {
        const supabase = await createServerClient()
        const { data } = await supabase.auth.getUser()
        authUser = data.user ?? null
        if (!authUser) console.error("getAuthenticatedRequestUser: authUser from server client is null");
    }

    if (!authUser) {
        return null
    }

    const admin = createAdminClient()
    const { data: profile, error: profileError } = await admin
        .from("users")
        .select("id, email, display_name, phone")
        .eq("id", authUser.id)
        .maybeSingle()

    if (profileError) {
        console.error("getAuthenticatedRequestUser: profile lookup error", profileError);
    }

    if (!profile) {
        console.error("getAuthenticatedRequestUser: profile is null for authUser", authUser.id);
        return null
    }

    const { data: billingCustomer, error: billingCustomerError } = await admin
        .from("billing_customers")
        .select("stripe_customer_id")
        .eq("user_id", authUser.id)
        .maybeSingle()

    if (billingCustomerError && !isMissingSchemaCacheRelationError(billingCustomerError)) {
        console.error("getAuthenticatedRequestUser: billing customer lookup error", billingCustomerError);
    }

    return {
        authUser,
        profile: {
            id: profile.id as string,
            email: profile.email as string,
            display_name: (profile.display_name as string | null | undefined) ?? null,
            phone: (profile.phone as string | null | undefined) ?? null,
            stripe_customer_id: (billingCustomer?.stripe_customer_id as string | null | undefined) ?? null,
        },
    }
}
