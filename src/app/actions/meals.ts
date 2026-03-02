'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { mealSchema, type Meal, mealOptionSchema, type MealOption } from "@/shared-schemas/meal"

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
            images: data.images,
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

    // Sync Meal Options
    // Note: In a production app, we should probably do a diff to preserve IDs if needed, 
    // but for now, we'll follow the pattern of the other many-to-many links.
    // However, meal_options is a primary table, so we use upsert logic if IDs are present.
    if (data.options && data.options.length > 0) {
        const optionsToUpsert = data.options.map(opt => ({
            id: opt.id || undefined,
            associated_meal_id: mealId,
            ingredients: opt.ingredients,
            kcal: opt.kcal,
            is_default: opt.isDefault,
            macros: opt.macros,
            substitution_notes: opt.substitutionNotes,
            images: opt.images,
            updated_at: new Date().toISOString()
        }))

        // Remove options that are no longer in the list
        const currentOptionIds = data.options.filter(o => o.id).map(o => o.id)
        if (currentOptionIds.length > 0) {
            await supabase.from("meal_options").delete().eq("associated_meal_id", mealId).not("id", "in", `(${currentOptionIds.join(',')})`)
        } else {
            await supabase.from("meal_options").delete().eq("associated_meal_id", mealId)
        }

        await supabase.from("meal_options").upsert(optionsToUpsert)
    } else {
        await supabase.from("meal_options").delete().eq("associated_meal_id", mealId)
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

export async function getMealOptions(mealId: string) {
    const supabase = await createClient()

    const { data: options, error } = await supabase
        .from('meal_options')
        .select('*')
        .eq('associated_meal_id', mealId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching meal options:', error)
        return []
    }

    return options.map(opt => ({
        id: opt.id,
        associatedMealId: opt.associated_meal_id,
        ingredients: opt.ingredients || [],
        kcal: opt.kcal,
        isDefault: opt.is_default,
        macros: opt.macros,
        substitutionNotes: opt.substitution_notes,
        images: opt.images || [],
    })) as MealOption[]
}

export async function upsertMealOption(data: MealOption) {
    const supabase = await createClient()

    const result = mealOptionSchema.safeParse(data)
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const { error } = await supabase
        .from('meal_options')
        .upsert({
            id: data.id || undefined,
            associated_meal_id: data.associatedMealId,
            ingredients: data.ingredients,
            kcal: data.kcal,
            is_default: data.isDefault,
            macros: data.macros,
            substitution_notes: data.substitutionNotes,
            images: data.images,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error upserting meal option:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function deleteMealOption(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('meal_options')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting meal option:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}
