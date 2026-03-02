'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { tagSchema, type Tag } from "@/shared-schemas/tag"

export type TagTable = 'tags' | 'meal_categories' | 'dietary_tags';

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

    const { data, error } = await supabase
        .from(table)
        .upsert({
            id: tag.id || undefined,
            name: tag.name,
            updated_at: new Date().toISOString()
        })
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
