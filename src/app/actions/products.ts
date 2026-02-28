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
            slug: data.slug || null,
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
