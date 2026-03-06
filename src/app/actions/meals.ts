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
            meal_types: data.mealTypes,
            restrictions: data.restrictions,
            is_public: data.isPublic,
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
    const { error: catDeleteError } = await supabase.from("meal_category_links").delete().eq("meal_id", mealId)
    if (catDeleteError) return { error: `Categories error: ${catDeleteError.message}` }

    if (data.mealTypes && data.mealTypes.length > 0) {
        const categoryLinks = data.mealTypes.map(categoryId => ({
            meal_id: mealId,
            category_id: categoryId
        }))
        const { error: catInsertError } = await supabase.from("meal_category_links").insert(categoryLinks)
        if (catInsertError) return { error: `Categories error: ${catInsertError.message}` }
    }

    // Sync dietary tags (restrictions)
    const { error: tagDeleteError } = await supabase.from("meal_dietary_tags").delete().eq("meal_id", mealId)
    if (tagDeleteError) return { error: `Restrictions error: ${tagDeleteError.message}` }

    if (data.restrictions && data.restrictions.length > 0) {
        const restrictionLinks = data.restrictions.map(dietaryTagId => ({
            meal_id: mealId,
            dietary_tag_id: dietaryTagId
        }))
        const { error: tagInsertError } = await supabase.from("meal_dietary_tags").insert(restrictionLinks)
        if (tagInsertError) return { error: `Restrictions error: ${tagInsertError.message}` }
    }

    // Sync Meal Options
    if (data.options && data.options.length > 0) {
        // Remove options that are no longer in the list
        const currentOptionIds = data.options.filter(o => o.id).map(o => o.id)
        if (currentOptionIds.length > 0) {
            const { error: delOptError } = await supabase
                .from("meal_options")
                .delete()
                .eq("associated_meal_id", mealId)
                .not("id", "in", `(${currentOptionIds.join(',')})`)
            if (delOptError) return { error: `Options delete error: ${delOptError.message}` }
        } else {
            await supabase.from("meal_options").delete().eq("associated_meal_id", mealId)
        }

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

        const { error: optUpsertError } = await supabase.from("meal_options").upsert(optionsToUpsert)
        if (optUpsertError) return { error: `Options upsert error: ${optUpsertError.message}` }
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

export async function bulkUpdateMealStatus(ids: string[], isPublic: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("meals")
        .update({ is_public: isPublic, updated_at: new Date().toISOString() })
        .in("id", ids)

    if (error) {
        console.error('Error updating meals status:', error)
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

export async function getMealCategories() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('meal_categories')
        .select('*')
        .order('name->>en', { ascending: true })

    if (error) {
        console.error('Error fetching meal categories:', error)
        return []
    }

    return data
}

export async function getMealsByCategory(categoryId: string) {
    const supabase = await createClient()

    // Use a direct join: get meals that have a link to this category
    const { data, error } = await supabase
        .from('meal_category_links')
        .select(`
            meal:meals(
                id, 
                name, 
                images, 
                cook_time,
                options:meal_options(*)
            )
        `)
        .eq('category_id', categoryId)

    if (error) {
        console.error('Error fetching meals by category:', error)
        return []
    }

    // Unwrap the nested meal object
    return (data || [])
        .map((row: any) => row.meal)
        .filter(Boolean)
}
export async function getMealsByIds(ids: string[]) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('meals')
        .select('id, name, images, cook_time, options:meal_options(*)')
        .in('id', ids)

    if (error) {
        console.error('Error fetching meals by ids:', error)
        return []
    }

    return data || []
}

export async function getMealOptionsByIds(ids: string[]) {
    const supabase = await createClient()

    const { data: options, error } = await supabase
        .from('meal_options')
        .select('*, meal:meals(id, name, images, cook_time, options:meal_options(*))')
        .in('id', ids)

    if (error) {
        console.error('Error fetching meal options by ids:', error)
        return []
    }

    return (options || []).map(opt => ({
        ...opt,
        associatedMealId: opt.associated_meal_id,
        isDefault: opt.is_default || false,
        meal: opt.meal
    }))
}
