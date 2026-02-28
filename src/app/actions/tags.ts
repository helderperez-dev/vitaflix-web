'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { tagSchema, type Tag } from "@/shared-schemas/tag"

export async function getTags() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tags:', error)
        return []
    }

    return data as Tag[]
}

export async function upsertTag(tag: Tag) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tags')
        .upsert({
            id: tag.id || undefined,
            name: tag.name,
            updated_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving tag:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { data: data as Tag }
}

export async function deleteTag(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting tag:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}
