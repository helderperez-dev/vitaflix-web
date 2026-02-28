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

    const { error } = await supabase
        .from('meals')
        .upsert({
            id: data.id || undefined,
            name: data.name,
            meal_types: data.mealTypes,
            cook_time: data.cookTime,
            preparation_mode: data.preparationMode,
            satiety: data.satiety,
            restrictions: data.restrictions,
            publish_on: data.publishOn,
            updated_at: new Date().toISOString()
        })
        .select()

    if (error) {
        console.error('Error upserting meal:', error)
        return { error: error.message }
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
