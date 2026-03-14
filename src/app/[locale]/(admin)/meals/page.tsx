import { createClient } from "@/lib/supabase/server"
import { MealTableWrapper } from "@/components/meals/meal-table-wrapper"

export const dynamic = "force-dynamic"

export default async function MealsPage() {
    const supabase = await createClient()

    // Get current user session
    const { data: { user: authUser } } = await supabase.auth.getUser()

    // Fetch meals
    const { data: rawMeals } = await supabase
        .from("meals")
        .select(`
            id, name, cook_time, is_public, preparation_mode, satiety, publish_on, updated_at, created_at, images,
            meal_category_links(category_id),
            meal_dietary_tags(dietary_tag_id),
            meal_countries(country_id, countries(*)),
            meal_options(id)
        `)
        .order("name->>en", { ascending: true })

    const meals = rawMeals?.map(m => ({
        ...m,
        meal_types: m.meal_category_links?.map((link: { category_id: string }) => link.category_id) || [],
        restrictions: m.meal_dietary_tags?.map((link: { dietary_tag_id: string }) => link.dietary_tag_id) || [],
        country_ids: m.meal_countries?.map((link: { country_id: string }) => link.country_id) || []
    })) || []

    // Fetch user profile for preferences
    const { data: userProfile } = authUser ? await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single() : { data: null }

    return <MealTableWrapper initialMeals={meals || []} userProfile={userProfile} />
}
