'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { tagSchema, type Tag, type TagTable } from "@/shared-schemas/tag"
import { sanitizeBrandLocalizedNames } from "@/lib/brand-market"


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
    if (table === 'brands') {
        const { data, error } = await supabase
            .from('brands')
            .select('id,name,logo_url,created_at,updated_at,brand_store_markets(store_market_id,store_markets(id,slug,name))')
            .order('created_at', { ascending: false })

        if (error) {
            console.error(`Error fetching ${table}:`, error)
            return []
        }

        return (data || []).map((brand: any) => {
            const links = brand.brand_store_markets || []
            const linkedMarkets = links
                .map((link: any) => link.store_markets)
                .filter(Boolean)

            return {
                id: brand.id,
                name: brand.name,
                logo_url: brand.logo_url,
                store_market_ids: links.map((link: any) => link.store_market_id).filter(Boolean),
                store_markets: linkedMarkets,
                created_at: brand.created_at,
                updated_at: brand.updated_at,
            } as Tag
        })
    }

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
    if (table === 'brands') {
        const brandPayload = {
            id: tag.id || undefined,
            name: sanitizeBrandLocalizedNames(tag.name as Record<string, string>),
            logo_url: tag.logo_url,
            updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('brands')
            .upsert(brandPayload)
            .select()
            .single()

        if (error) {
            console.error(`Error saving ${table}:`, error)
            return { error: error.message }
        }

        const brandId = data.id as string
        await supabase
            .from('brand_store_markets')
            .delete()
            .eq('brand_id', brandId)

        const storeMarketIds = tag.store_market_ids || []
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
        return { data: data as Tag }
    }

    const upsertData: any = {
        id: tag.id || undefined,
        name: tag.name,
        logo_url: tag.logo_url,
        updated_at: new Date().toISOString()
    }

    // Auto-generate slug for roles and objectives if missing
    if ((table === 'user_roles' || table === 'wellness_objectives' || table === 'meal_plan_sizes' || table === 'measurement_units' || table === 'countries' || table === 'store_markets') && !tag.slug && !tag.id) {
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
