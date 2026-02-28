'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { userProfileSchema, type UserProfile } from "@/shared-schemas/user"

export async function upsertUser(data: UserProfile) {
    const supabase = await createClient()

    // Validate with zod
    const result = userProfileSchema.safeParse(data)
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    // If locale is not provided, use system default
    let finalLocale = data.locale;
    if (!finalLocale) {
        const { data: settingData } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'default_locale')
            .single();
        finalLocale = (settingData?.value as any) || 'en';
    }

    const { error } = await supabase
        .from('users')
        .upsert({
            id: data.id || undefined,
            email: data.email,
            display_name: data.displayName,
            genre: data.genre,
            height: data.height,
            weight: data.weight,
            birthday: data.birthday,
            objective: data.objective,
            tmb: data.tmb,
            recommended_kcal_intake: data.recommendedKcalIntake,
            extra_data_complete: data.extraDataComplete,
            role: data.role,
            locale: finalLocale,
            preferences: data.preferences || {},
            updated_at: new Date().toISOString()
        })
        .select()

    if (error) {
        console.error('Error upserting user:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function deleteUser(id: string) {
    const supabase = await createClient()

    // In a real app, you might also want to delete from auth.users via admin API
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting user:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function updateUserLocale(userId: string, locale: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('users')
        .update({ locale })
        .eq('id', userId)

    if (error) {
        console.error('Error updating user locale:', error)
        return { error: error.message }
    }

    return { success: true }
}

export async function updateUserPreferences(userId: string, preferences: any) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('users')
        .update({ preferences })
        .eq('id', userId)

    if (error) {
        console.error('Error updating user preferences:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}
