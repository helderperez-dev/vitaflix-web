'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { mealSchema, type Meal } from "@/shared-schemas/meal"

export async function upsertMeal(data: Meal) {
    const supabase = await createClient()

    // Validate with zod
    const result = mealSchema.safeParse(data)
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const { data: mealData, error } = await supabase
        .from('meals')
        .upsert({
            id: data.id || undefined,
            name: data.name,
            cook_time: data.cookTime,
            preparation_mode: data.preparationMode,
            satiety: data.satiety,
            publish_on: data.publishOn,
            updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

    if (error) {
        console.error('Error upserting meal:', error)
        return { error: error.message }
    }

    const mealId = mealData.id

    // Sync categories (mealTypes)
    await supabase.from("meal_category_links").delete().eq("meal_id", mealId)
    if (data.mealTypes && data.mealTypes.length > 0) {
        const categoryLinks = data.mealTypes.map(categoryId => ({
            meal_id: mealId,
            category_id: categoryId
        }))
        await supabase.from("meal_category_links").insert(categoryLinks)
    }

    // Sync dietary tags (restrictions)
    await supabase.from("meal_dietary_tags").delete().eq("meal_id", mealId)
    if (data.restrictions && data.restrictions.length > 0) {
        const restrictionLinks = data.restrictions.map(dietaryTagId => ({
            meal_id: mealId,
            dietary_tag_id: dietaryTagId
        }))
        await supabase.from("meal_dietary_tags").insert(restrictionLinks)
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function deleteMeal(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting meal:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function bulkDeleteMeals(ids: string[]) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("meals")
        .delete()
        .in("id", ids)

    if (error) {
        console.error('Error deleting meals:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}
