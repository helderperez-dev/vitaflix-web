"use server"

import { syncContactWithBrevo } from "@/lib/brevo"

/**
 * Syncs a lead from the Caloric Calculator to Brevo List ID 6.
 * Does not persist to Supabase as requested.
 * 
 * @param name The contact's full name.
 * @param email The contact's email address.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function syncCalculatorLeadAction(name: string, email: string) {
    if (!name || !email) {
        return { success: false, error: "Name and email are required." }
    }

    try {
        const listId = 6 // Target List ID as requested
        const success = await syncContactWithBrevo(email, name, [listId])
        
        if (!success) {
            return { success: false, error: "Failed to sync with Brevo." }
        }

        return { success: true }
    } catch (error) {
        console.error("Error in syncCalculatorLeadAction:", error)
        return { success: false, error: "An unexpected error occurred." }
    }
}
