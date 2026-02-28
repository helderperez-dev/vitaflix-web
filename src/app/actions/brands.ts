'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { brandSchema, type Brand } from "@/shared-schemas/brand"

export async function getBrands() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching brands:', error)
        return []
    }

    // Map DB snake_case to schema camelCase
    return (data || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        logoUrl: b.logo_url,
    })) as Brand[]
}

export async function upsertBrand(brand: Brand) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('brands')
        .upsert({
            id: brand.id || undefined,
            name: brand.name,
            logo_url: brand.logoUrl || null,
            updated_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving brand:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { data: { id: data.id, name: data.name, logoUrl: data.logo_url } as Brand }
}

export async function deleteBrand(id: string) {
    const supabase = await createClient()

    // First let's find the brand to get its logo path to delete from storage
    const { data: brand } = await supabase.from('brands').select('id, logo_url').eq('id', id).single()

    if (brand?.logo_url) {
        const path = brand.logo_url.split('vitaflix/').pop()
        if (path) {
            await supabase.storage.from('vitaflix').remove([path])
        }
    }

    const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting brand:', error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

