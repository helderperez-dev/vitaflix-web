"use server"

import { createClient } from "@/lib/supabase/server"
import { type SearchResult } from "@/shared-schemas/search"
import { getMediaUrl } from "@/lib/utils"

type ProductSearchRow = { id: string; name: unknown; images: unknown }
type MealSearchRow = { id: string; name: unknown }
type UserSearchRow = { id: string; email: string; display_name: string | null; avatar_url: string | null; phone: string | null }
type BrandSearchRow = { id: string; name: unknown }
type TagSearchRow = { id: string; name: unknown }
type LeadSearchRow = { id: string; name: string | null; email: string | null; phone: string | null; source: string | null }
type PlanSearchRow = { id: string; name: string | null; daily_meals_count: number | null; user_id: string }

function getLocaleCandidates(locale?: string) {
    const normalized = locale?.toLowerCase().trim()
    if (!normalized) return ["en", "pt-pt", "pt-br", "pt", "es"]

    const candidates = [normalized]
    const [baseLocale] = normalized.split("-")
    if (baseLocale && baseLocale !== normalized) candidates.push(baseLocale)

    return [...new Set([...candidates, "en", "pt-pt", "pt-br", "pt", "es"])]
}

function getLocalizedName(value: unknown, fallback: string, locale?: string) {
    if (!value || typeof value !== "object") return fallback
    const record = value as Record<string, string>
    const localeCandidates = getLocaleCandidates(locale)

    for (const key of localeCandidates) {
        const localizedValue = record[key]
        if (localizedValue) return localizedValue
    }

    return Object.values(record).find(Boolean) || fallback
}

function escapeOrValue(value: string) {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/,/g, "\\,")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
}

export async function globalSearch(query: string, locale?: string): Promise<SearchResult[]> {
    const trimmedQuery = query.trim()
    if (!trimmedQuery || trimmedQuery.length < 2) return []

    const supabase = await createClient()
    const results: SearchResult[] = []
    const escapedQuery = escapeOrValue(trimmedQuery)
    const searchTerm = `%${escapedQuery}%`

    try {
        const [
            productsRes,
            mealsRes,
            usersRes,
            brandsRes,
            tagsRes,
            leadsRes,
            plansRes,
        ] = await Promise.allSettled([
            supabase
                .from("products")
                .select("id, name, images")
                .or(`name->>en.ilike.${searchTerm},name->>pt-pt.ilike.${searchTerm},name->>pt-br.ilike.${searchTerm},name->>pt.ilike.${searchTerm},name->>es.ilike.${searchTerm}`)
                .limit(6),
            supabase
                .from("meals")
                .select("id, name")
                .or(`name->>en.ilike.${searchTerm},name->>pt-pt.ilike.${searchTerm},name->>pt-br.ilike.${searchTerm},name->>pt.ilike.${searchTerm},name->>es.ilike.${searchTerm}`)
                .limit(6),
            supabase
                .from("users")
                .select("id, email, display_name, avatar_url, phone")
                .or(`email.ilike.${searchTerm},display_name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
                .limit(6),
            supabase
                .from("brands")
                .select("id, name")
                .or(`name->>en.ilike.${searchTerm},name->>pt-pt.ilike.${searchTerm},name->>pt-br.ilike.${searchTerm},name->>pt.ilike.${searchTerm},name->>es.ilike.${searchTerm}`)
                .limit(5),
            supabase
                .from("tags")
                .select("id, name")
                .or(`name->>en.ilike.${searchTerm},name->>pt-pt.ilike.${searchTerm},name->>pt-br.ilike.${searchTerm},name->>pt.ilike.${searchTerm},name->>es.ilike.${searchTerm}`)
                .limit(5),
            supabase
                .from("leads")
                .select("id, name, email, phone, source")
                .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`)
                .eq("is_archived", false)
                .limit(6),
            supabase
                .from("meal_plans")
                .select("id, name, daily_meals_count, user_id")
                .ilike("name", searchTerm)
                .limit(6),
        ])

        const getData = <T>(res: PromiseSettledResult<{ data: T[] | null; error: unknown } | { data: T[]; error: unknown }>) => {
            if (res.status === "rejected") return []
            if (res.value.error) return []
            return res.value.data || []
        }

        const products = getData<ProductSearchRow>(productsRes)
        const meals = getData<MealSearchRow>(mealsRes)
        const users = getData<UserSearchRow>(usersRes)
        const brands = getData<BrandSearchRow>(brandsRes)
        const tags = getData<TagSearchRow>(tagsRes)
        const leads = getData<LeadSearchRow>(leadsRes)
        const plans = getData<PlanSearchRow>(plansRes)

        const planOwnerIds = Array.from(new Set(plans.map((plan) => plan.user_id).filter(Boolean)))
        const planOwnersById = new Map<string, { display_name: string | null; email: string }>()
        if (planOwnerIds.length > 0) {
            const { data: owners, error: ownersError } = await supabase
                .from("users")
                .select("id, display_name, email")
                .in("id", planOwnerIds)

            if (!ownersError && owners) {
                owners.forEach((owner) => {
                    planOwnersById.set(owner.id, { display_name: owner.display_name, email: owner.email })
                })
            }
        }

        products.forEach((p) => {
            const name = getLocalizedName(p.name, "Unknown Product", locale)
            const images = Array.isArray(p.images) ? p.images as { url?: string; isDefault?: boolean }[] : []
            const defaultImg = images.find((img) => img.isDefault) || images[0]
            results.push({
                id: p.id,
                type: "product",
                title: name,
                subtitle: "Product",
                url: `/products?search=${encodeURIComponent(name)}`,
                imageUrl: getMediaUrl(defaultImg?.url),
            })
        })

        meals.forEach((m) => {
            const name = getLocalizedName(m.name, "Unknown Meal", locale)
            results.push({
                id: m.id,
                type: "meal",
                title: name,
                subtitle: "Meal",
                url: `/meals?search=${encodeURIComponent(name)}`,
            })
        })

        users.forEach((u) => {
            const title = u.display_name || u.email
            results.push({
                id: u.id,
                type: "user",
                title,
                subtitle: u.display_name ? u.email : (u.phone || "User"),
                url: `/users?search=${encodeURIComponent(title)}`,
                imageUrl: getMediaUrl(u.avatar_url),
            })
        })

        brands.forEach((b) => {
            const name = getLocalizedName(b.name, "Unknown Brand", locale)
            results.push({
                id: b.id,
                type: "brand",
                title: name,
                subtitle: "Brand",
                url: `/products?search=${encodeURIComponent(name)}`,
            })
        })

        tags.forEach((tag) => {
            const name = getLocalizedName(tag.name, "Unknown Tag", locale)
            results.push({
                id: tag.id,
                type: "tag",
                title: name,
                subtitle: "Tag",
                url: `/products?search=${encodeURIComponent(name)}`,
            })
        })

        leads.forEach((l) => {
            const title = l.name || l.email || "Unknown Lead"
            const leadSearchTerm = l.email || l.phone || title
            results.push({
                id: l.id,
                type: "lead",
                title,
                subtitle: l.name ? (l.email || undefined) : (l.phone || l.source || "Lead"),
                url: `/leads?search=${encodeURIComponent(leadSearchTerm)}`,
            })
        })

        plans.forEach((p) => {
            const owner = planOwnersById.get(p.user_id)
            const planName = p.name || "Unnamed Plan"
            const userSearchTerm = owner?.display_name || owner?.email || planName
            results.push({
                id: p.id,
                type: "plan",
                title: planName,
                subtitle: p.daily_meals_count ? `${p.daily_meals_count} meals/day` : "Meal Plan",
                url: `/users?search=${encodeURIComponent(userSearchTerm)}`,
            })
        })
    } catch (e) {
        console.error("Global search error:", e)
    }

    return results
}
