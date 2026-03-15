'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { brandSchema, type Brand } from "@/shared-schemas/brand"
import { sanitizeBrandLocalizedNames } from "@/lib/brand-market"

export async function getBrands() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('brands')
        .select('id,name,logo_url,brand_store_markets(store_market_id)')
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
        storeMarketIds: (b.brand_store_markets || []).map((link: any) => link.store_market_id).filter(Boolean),
    })) as Brand[]
}

export async function upsertBrand(brand: Brand) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('brands')
        .upsert({
            id: brand.id || undefined,
            name: sanitizeBrandLocalizedNames(brand.name as Record<string, string>),
            logo_url: brand.logoUrl || null,
            updated_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving brand:', error)
        return { error: error.message }
    }

    const brandId = data.id as string
    await supabase
        .from('brand_store_markets')
        .delete()
        .eq('brand_id', brandId)

    const storeMarketIds = brand.storeMarketIds || []
    if (storeMarketIds.length > 0) {
        const rows = storeMarketIds.map((storeMarketId) => ({
            brand_id: brandId,
            store_market_id: storeMarketId,
        }))
        const { error: linkError } = await supabase
            .from('brand_store_markets')
            .insert(rows)
        if (linkError) {
            console.error('Error saving brand store market links:', linkError)
            return { error: linkError.message }
        }
    }

    revalidatePath("/", "layout")
    return {
        data: {
            id: data.id,
            name: data.name,
            logoUrl: data.logo_url,
            storeMarketIds,
        } as Brand
    }
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
