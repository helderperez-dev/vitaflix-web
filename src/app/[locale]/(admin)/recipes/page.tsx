import { createClient } from "@/lib/supabase/server"
import { MealTableWrapper } from "@/components/meals/meal-table-wrapper"

export const dynamic = "force-dynamic"

export default async function RecipesPage() {
    const supabase = await createClient()

    const { data: meals } = await supabase
        .from("meals")
        .select("*")
        .order("name->>en", { ascending: true })

    return <MealTableWrapper initialMeals={meals || []} />
}
