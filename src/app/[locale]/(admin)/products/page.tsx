import { createClient } from "@/lib/supabase/server"
import { ProductTableWrapper } from "@/components/products/product-table-wrapper"

export default async function ProductsPage() {
    const supabase = await createClient()

    // Get current user session
    const { data: { user: authUser } } = await supabase.auth.getUser()

    // Fetch products
    const { data: products } = await supabase
        .from("products")
        .select("*, product_tags(tag_id, tags(*)), product_brands(brand_id, brands(*))")
        .order("name->>en", { ascending: true })

    // Fetch user profile for preferences
    const { data: userProfile } = authUser ? await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single() : { data: null }

    return <ProductTableWrapper initialProducts={products || []} userProfile={userProfile} />
}

