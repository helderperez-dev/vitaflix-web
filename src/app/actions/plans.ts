'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { mealPlanSchema, type MealPlan, mealDayConfigSchema, type MealDayConfig } from "@/shared-schemas/plan"

export async function createMealPlan(data: Partial<MealPlan>) {
    const supabase = await createClient()

    const result = mealPlanSchema.parse(data)

    const { data: plan, error } = await supabase
        .from('meal_plans')
        .insert({
            user_id: result.userId,
            country_id: result.countryId || null,
            name: result.name,
            daily_meals_count: result.dailyMealsCount,
            selected_meals: result.selectedMeals || {}
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating meal plan:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { data: plan, success: true }
}

export async function updateMealPlan(id: string, data: Partial<MealPlan>) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('meal_plans')
        .update({
            name: data.name,
            country_id: data.countryId || null,
            daily_meals_count: data.dailyMealsCount,
            selected_meals: data.selectedMeals,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating meal plan:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function deleteMealPlan(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting meal plan:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function getMealDayConfigs(count?: number) {
    const supabase = await createClient()

    let query = supabase.from('meal_day_configurations').select('*, category:meal_categories(*)')

    if (count) {
        query = query.eq('daily_meals_count', count)
    }

    const { data, error } = await query.order('daily_meals_count', { ascending: true }).order('slot_index', { ascending: true })

    if (error) {
        console.error('Error fetching meal day configs:', error)
        return []
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        dailyMealsCount: row.daily_meals_count,
        slotIndex: row.slot_index,
        categoryId: row.category_id,
        category: row.category,
    }))
}

export async function upsertMealDayConfig(configs: MealDayConfig[]) {
    const supabase = await createClient()

    // Validate all
    for (const config of configs) {
        mealDayConfigSchema.parse(config)
    }

    const toUpsert = configs.map(c => ({
        id: c.id || crypto.randomUUID(),
        daily_meals_count: c.dailyMealsCount,
        slot_index: c.slotIndex,
        category_id: c.categoryId,
        updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
        .from('meal_day_configurations')
        .upsert(toUpsert)

    if (error) {
        console.error('Error upserting meal day configs:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}
