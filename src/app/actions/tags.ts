'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { tagSchema, type Tag } from "@/shared-schemas/tag"

export type TagTable = 'tags' | 'meal_categories' | 'dietary_tags' | 'user_roles' | 'wellness_objectives' | 'meal_plan_sizes';

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')           // Replace spaces with _
        .replace(/[^\w-]+/g, '')       // Remove all non-word chars
        .replace(/--+/g, '_');          // Replace multiple - with single _
}

export async function getTags(table: TagTable = 'tags') {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error(`Error fetching ${table}:`, error)
        return []
    }

    return data as Tag[]
}

export async function upsertTag(tag: Tag, table: TagTable = 'tags') {
    const supabase = await createClient()

    const upsertData: any = {
        id: tag.id || undefined,
        name: tag.name,
        updated_at: new Date().toISOString()
    }

    // Auto-generate slug for roles and objectives if missing
    if ((table === 'user_roles' || table === 'wellness_objectives' || table === 'meal_plan_sizes') && !tag.slug && !tag.id) {
        const engName = tag.name?.en || Object.values(tag.name || {})[0] as string;
        if (engName) {
            if (table === 'meal_plan_sizes') {
                const match = engName.match(/\d+/);
                upsertData.slug = match ? match[0] : slugify(engName);
            } else {
                upsertData.slug = slugify(engName);
            }
        }
    } else if (tag.slug) {
        upsertData.slug = tag.slug;
    }

    const { data, error } = await supabase
        .from(table)
        .upsert(upsertData)
        .select()
        .single()

    if (error) {
        console.error(`Error saving ${table}:`, error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { data: data as Tag }
}

export async function deleteTag(id: string, table: TagTable = 'tags') {
    const supabase = await createClient()

    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

    if (error) {
        console.error(`Error deleting ${table}:`, error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}
