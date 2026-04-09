import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"
import { syncContactWithBrevo } from "@/lib/brevo"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { leadIds } = body

        if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return NextResponse.json(
                { error: "Lead IDs are required." },
                { status: 400, headers: corsHeaders }
            )
        }

        // Fetch leads details from Supabase
        const { data: leads, error } = await supabase
            .from("leads")
            .select("id, name, email")
            .in("id", leadIds)

        if (error) {
            console.error("Fetch leads error:", error)
            return NextResponse.json(
                { error: "Failed to fetch leads." },
                { status: 500, headers: corsHeaders }
            )
        }

        if (!leads || leads.length === 0) {
            return NextResponse.json(
                { error: "No leads found for provided IDs." },
                { status: 404, headers: corsHeaders }
            )
        }

        // Sync leads with Brevo
        const syncResults = await Promise.allSettled(
            leads.map(async (lead) => {
                if (!lead.email) {
                    throw new Error(`Lead ${lead.id} has no email.`)
                }
                const success = await syncContactWithBrevo(lead.email, lead.name)
                if (!success) {
                    throw new Error(`Failed to sync lead ${lead.id} to Brevo.`)
                }
                return lead.id
            })
        )

        const succeeded = syncResults.filter(r => r.status === 'fulfilled').length
        const failed = syncResults.filter(r => r.status === 'rejected').length

        return NextResponse.json({ 
            success: true, 
            summary: {
                total: leads.length,
                succeeded,
                failed
            }
        }, { status: 200, headers: corsHeaders })

    } catch (err: any) {
        console.error("Bulk sync endpoint error:", err)
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500, headers: corsHeaders }
        )
    }
}
