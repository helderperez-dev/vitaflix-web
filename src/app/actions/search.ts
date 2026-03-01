"use server"

import { createClient } from "@/lib/supabase/server"

export type SearchResult = {
    id: string;
    type: 'product' | 'recipe' | 'user' | 'brand' | 'tag';
    title: string;
    subtitle?: string;
    url: string;
    imageUrl?: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const supabase = await createClient()
    const results: SearchResult[] = [];
    const searchTerm = `%${query.trim()}%`

    try {
        const [productsRes, mealsRes, usersRes, brandsRes, tagsRes] = await Promise.all([
            supabase.from('products').select('id, name, images').or(`name->>en.ilike.${searchTerm},name->>pt.ilike.${searchTerm}`).limit(5),
            supabase.from('meals').select('id, name').or(`name->>en.ilike.${searchTerm},name->>pt.ilike.${searchTerm}`).limit(5),
            supabase.from('users').select('id, email, full_name').or(`email.ilike.${searchTerm},full_name.ilike.${searchTerm}`).limit(5),
            supabase.from('brands').select('id, name').or(`name->>en.ilike.${searchTerm},name->>pt.ilike.${searchTerm}`).limit(3),
            supabase.from('tags').select('id, name').or(`name->>en.ilike.${searchTerm},name->>pt.ilike.${searchTerm}`).limit(3),
        ])

        if (productsRes.data) {
            productsRes.data.forEach((p: any) => {
                const name = p.name?.en || Object.values(p.name || {})[0] || 'Unknown Product'
                const defaultImg = p.images?.find((img: any) => img.isDefault) || p.images?.[0]
                results.push({
                    id: p.id,
                    type: 'product',
                    title: name,
                    subtitle: 'Product',
                    url: `/products?search=${encodeURIComponent(query)}`,
                    imageUrl: defaultImg?.url,
                })
            })
        }

        if (mealsRes.data) {
            mealsRes.data.forEach((m: any) => {
                const name = m.name?.en || Object.values(m.name || {})[0] || 'Unknown Recipe'
                results.push({
                    id: m.id,
                    type: 'recipe',
                    title: name,
                    subtitle: 'Recipe',
                    url: `/recipes?search=${encodeURIComponent(query)}`
                })
            })
        }

        if (usersRes.data) {
            usersRes.data.forEach((u: any) => {
                results.push({
                    id: u.id,
                    type: 'user',
                    title: u.full_name || u.email,
                    subtitle: u.full_name ? u.email : 'User',
                    url: `/users?search=${encodeURIComponent(query)}`
                })
            })
        }

        if (brandsRes.data) {
            brandsRes.data.forEach((b: any) => {
                const name = b.name?.en || Object.values(b.name || {})[0] || 'Unknown Brand'
                results.push({
                    id: b.id,
                    type: 'brand',
                    title: name,
                    subtitle: 'Brand',
                    url: `/products?brand=${b.id}`
                })
            })
        }

        if (tagsRes.data) {
            tagsRes.data.forEach((t: any) => {
                const name = t.name?.en || Object.values(t.name || {})[0] || 'Unknown Tag'
                results.push({
                    id: t.id,
                    type: 'tag',
                    title: name,
                    subtitle: 'Tag',
                    url: `/products?tag=${t.id}`
                })
            })
        }
    } catch (e) {
        console.error("Global search error:", e)
    }

    return results;
}
