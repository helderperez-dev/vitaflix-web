'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { tagSchema, type Tag, type TagTable } from "@/shared-schemas/tag"


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
        logo_url: tag.logo_url,
        updated_at: new Date().toISOString()
    }

    // Auto-generate slug for roles and objectives if missing
    if ((table === 'user_roles' || table === 'wellness_objectives' || table === 'meal_plan_sizes' || table === 'measurement_units' || table === 'countries') && !tag.slug && !tag.id) {
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

    // Handle logo deletion for brands
    if (table === 'brands') {
        const { data: brand } = await supabase.from('brands').select('logo_url').eq('id', id).single()
        if (brand?.logo_url) {
            const path = brand.logo_url.split('vitaflix/').pop()
            if (path) {
                await supabase.storage.from('vitaflix').remove([path])
            }
        }
    }

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

export async function deleteTags(ids: string[], table: TagTable = 'tags') {
    const supabase = await createClient()

    // Handle logo deletion for brands in bulk
    if (table === 'brands') {
        const { data: brands } = await supabase.from('brands').select('logo_url').in('id', ids)
        const paths = brands
            ?.map(b => b.logo_url?.split('vitaflix/').pop())
            .filter((p): p is string => !!p)

        if (paths && paths.length > 0) {
            await supabase.storage.from('vitaflix').remove(paths)
        }
    }

    const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids)

    if (error) {
        console.error(`Error deleting multiple ${table}:`, error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}
