'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { userProfileSchema, type UserProfile } from "@/shared-schemas/user"
import { triggerAppEvent } from "./notifications"

export async function upsertUser(data: UserProfile) {
    const supabase = await createClient()

    // Validate with zod
    const result = userProfileSchema.safeParse(data)
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }
    const validData = result.data

    // If locale is not provided, use system default
    let finalLocale = validData.locale
    if (!finalLocale) {
        const { data: settingData } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'default_locale')
            .single()
        finalLocale = (settingData?.value as any) || 'en'
    }

    const { error } = await supabase
        .from('users')
        .upsert({
            id: validData.id || undefined,
            email: validData.email,
            display_name: validData.displayName,
            avatar_url: validData.avatarUrl || null,
            genre: validData.genre,
            height: validData.height,
            weight: validData.weight,
            birthday: validData.birthday,
            objective: validData.objective,
            tmb: validData.tmb,
            recommended_kcal_intake: validData.recommendedKcalIntake,
            extra_data_complete: validData.extraDataComplete,
            role: validData.role,
            locale: finalLocale,
            phone: validData.phone,
            push_token: validData.pushToken,
            country_id: validData.countryId || null,
            preferences: validData.preferences || {},
            updated_at: new Date().toISOString()
        })
        .select()

    if (error) {
        console.error('Error upserting user:', error)
        return { error: error.message }
    }

    // Fire triggers for new users
    const isNewUser = !validData.id
    if (isNewUser) {
        // Try to get the newly created user id by email
        const { data: newUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', validData.email)
            .single()
        if (newUser?.id) {
            await triggerAppEvent('user_signed_up', { userId: newUser.id })
        }
    } else if (validData.extraDataComplete && validData.id) {
        // Fire profile_complete trigger when onboarding finishes
        await triggerAppEvent('profile_complete', {
            userId: validData.id,
            data: {
                recommended_kcal: String(validData.recommendedKcalIntake || '')
            }
        })
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function deleteUser(id: string) {
    const supabase = await createClient()

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

export async function bulkDeleteUsers(ids: string[]) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('users')
        .delete()
        .in('id', ids)

    if (error) {
        console.error('Error deleting users:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function requestPasswordReset(email: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
        console.error('Error requesting password reset:', error)
        return { error: error.message }
    }

    return { success: true }
}

export async function adminUpdatePassword(userId: string, newPassword: string) {
    const admin = createAdminClient()

    const { error } = await admin.auth.admin.updateUserById(userId, {
        password: newPassword
    })

    if (error) {
        console.error('Error updating user password:', error)
        return { error: error.message }
    }

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

export async function getUserRelatedData(userId: string) {
    const supabase = await createClient()

    const [
        { data: subscriptions },
        { data: mealPlans },
        { data: shoppingLists },
        { data: notifications }
    ] = await Promise.all([
        supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('meal_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('shopping_lists').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
    ])

    // If there are subscriptions, fetch their transactions
    let transactions: any[] = []
    if (subscriptions && subscriptions.length > 0) {
        const subIds = subscriptions.map(s => s.id)
        const { data: transData } = await supabase
            .from('transactions')
            .select('*')
            .in('subscription_id', subIds)
            .order('created_at', { ascending: false })
            .limit(20)
        transactions = transData || []
    }

    return {
        subscriptions: subscriptions || [],
        mealPlans: mealPlans || [],
        shoppingLists: shoppingLists || [],
        notifications: notifications || [],
        transactions
    }
}
