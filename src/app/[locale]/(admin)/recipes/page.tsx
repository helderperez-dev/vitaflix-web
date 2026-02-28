import { createClient } from "@/lib/supabase/server"
import { MealTableWrapper } from "@/components/meals/meal-table-wrapper"

export const dynamic = "force-dynamic"

export default async function RecipesPage() {
    const supabase = await createClient()

    const { data: meals } = await supabase
        .from("meals")
        .select("*")
        .order("name->>en", { ascending: true })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <MealTableWrapper initialMeals={meals || []} />
        </div>
    )
}
