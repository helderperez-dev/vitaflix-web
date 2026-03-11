"use server"

import { createClient } from "@/lib/supabase/server"

import { type SearchResult } from "@/shared-schemas/search";

export async function globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const supabase = await createClient()
    const results: SearchResult[] = [];
    const searchTerm = `%${query.trim()}%`

    try {
        const [productsRes, mealsRes, usersRes, brandsRes, tagsRes, leadsRes, plansRes] = await Promise.all([
            supabase.from('products').select('id, name, images').or(`name->en.ilike.${searchTerm},name->pt.ilike.${searchTerm}`).limit(5),
            supabase.from('meals').select('id, name').or(`name->en.ilike.${searchTerm},name->pt.ilike.${searchTerm}`).limit(5),
            supabase.from('users').select('id, email, display_name, avatar_url, phone').or(`email.ilike.${searchTerm},display_name.ilike.${searchTerm},phone.ilike.${searchTerm}`).limit(5),
            supabase.from('brands').select('id, name').or(`name->en.ilike.${searchTerm},name->pt.ilike.${searchTerm}`).limit(3),
            supabase.from('tags').select('id, name').or(`name->en.ilike.${searchTerm},name->pt.ilike.${searchTerm}`).limit(3),
            supabase.from('leads').select('id, name, email, phone, source').or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`).eq('is_archived', false).limit(5),
            supabase.from('meal_plans').select('id, name, daily_meals_count').ilike('name', searchTerm).limit(5),
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
                const name = m.name?.en || Object.values(m.name || {})[0] || 'Unknown Meal'
                results.push({
                    id: m.id,
                    type: 'meal',
                    title: name,
                    subtitle: 'Meal',
                    url: `/meals?search=${encodeURIComponent(query)}`
                })
            })
        }

        if (usersRes.data) {
            usersRes.data.forEach((u: any) => {
                results.push({
                    id: u.id,
                    type: 'user',
                    title: u.display_name || u.email,
                    subtitle: u.display_name ? u.email : (u.phone || 'User'),
                    url: `/users?search=${encodeURIComponent(query)}`,
                    imageUrl: u.avatar_url || undefined,
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

        if (leadsRes.data) {
            leadsRes.data.forEach((l: any) => {
                results.push({
                    id: l.id,
                    type: 'lead',
                    title: l.name || l.email || 'Unknown Lead',
                    subtitle: l.name ? l.email : (l.phone || l.source || 'Lead'),
                    url: `/leads?search=${encodeURIComponent(query)}`,
                })
            })
        }

        if (plansRes.data) {
            plansRes.data.forEach((p: any) => {
                results.push({
                    id: p.id,
                    type: 'plan',
                    title: p.name || 'Unnamed Plan',
                    subtitle: p.daily_meals_count ? `${p.daily_meals_count} meals/day` : 'Meal Plan',
                    url: `/users?search=${encodeURIComponent(query)}`,
                })
            })
        }

    } catch (e) {
        console.error("Global search error:", e)
    }

    return results;
}
