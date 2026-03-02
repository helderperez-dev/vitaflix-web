"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { productSchema, type Product } from "@/shared-schemas/product"

export async function upsertProduct(data: Product) {
    const supabase = await createClient()

    // Validate with zod
    const result = productSchema.safeParse(data)
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const { data: productData, error } = await supabase
        .from("products")
        .upsert({
            id: data.id || undefined,
            name: data.name,
            kcal: data.kcal,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            is_public: data.isPublic,
            images: data.images || []
        })
        .select('id')
        .single()

    if (error) {
        return { error: error.message }
    }

    const productId = productData.id

    // Manage tags (Syncing many-to-many)
    await supabase.from("product_tags").delete().eq("product_id", productId)
    if (data.tagIds && data.tagIds.length > 0) {
        const tagLinks = data.tagIds.map(tagId => ({
            product_id: productId,
            tag_id: tagId
        }))
        await supabase.from("product_tags").insert(tagLinks)
    }

    // Manage brands (Syncing many-to-many)
    await supabase.from("product_brands").delete().eq("product_id", productId)
    if (data.brandIds && data.brandIds.length > 0) {
        const brandLinks = data.brandIds.map(brandId => ({
            product_id: productId,
            brand_id: brandId
        }))
        await supabase.from("product_brands").insert(brandLinks)
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()

    // Clean up product's image folder in storage
    const { data: files } = await supabase.storage.from("vitaflix").list(id)
    if (files && files.length > 0) {
        const paths = files.map(file => `${id}/${file.name}`)
        await supabase.storage.from("vitaflix").remove(paths)
    }

    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function bulkUpdateProductStatus(ids: string[], isPublic: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("products")
        .update({ is_public: isPublic })
        .in("id", ids)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function bulkDeleteProducts(ids: string[]) {
    const supabase = await createClient()

    // Storage cleanup for all products
    for (const id of ids) {
        const { data: files } = await supabase.storage.from("vitaflix").list(id)
        if (files && files.length > 0) {
            const paths = files.map(file => `${id}/${file.name}`)
            await supabase.storage.from("vitaflix").remove(paths)
        }
    }

    const { error } = await supabase
        .from("products")
        .delete()
        .in("id", ids)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}
export async function getProducts(query?: string) {
    const supabase = await createClient()

    let q = supabase.from("products").select("*").order("created_at", { ascending: false })

    if (query) {
        // Since name is JSONB, we might need a more complex search if searching translations,
        // but for a simple product selector, we can start with a basic check or just fetch all
        // if the list is small, or use a RPC/full-text search if needed.
        // For now, let's just fetch all and filter in client or use a simple ILIKE on a text field if available.
        // Actually, name->>'pt' or name->>'en' could be used.
        q = q.or(`name->>en.ilike.%${query}%,name->>pt.ilike.%${query}%`)
    }

    const { data, error } = await q.limit(20)

    if (error) {
        console.error("Error fetching products:", error)
        return []
    }

    return data || []
}

export async function getProductsByIds(ids: string[]) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", ids)

    if (error) {
        console.error("Error fetching products by ids:", error)
        return []
    }

    return data || []
}
