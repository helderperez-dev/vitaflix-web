"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type Meal } from "@/shared-schemas/meal"
import { MealDrawer } from "./meal-drawer"
import { MealActions } from "./meal-actions"
import { useLocale } from "next-intl"

interface MealTableWrapperProps {
    initialMeals: any[]
}

export function MealTableWrapper({ initialMeals }: MealTableWrapperProps) {
    const locale = useLocale()
    const [open, setOpen] = React.useState(false)
    const [selectedMeal, setSelectedMeal] = React.useState<Meal | null>(null)

    // Map DB underscore to camelCase for the schema
    const meals: Meal[] = initialMeals.map(m => ({
        id: m.id,
        name: m.name,
        mealTypes: m.meal_types || [],
        cookTime: m.cook_time || 0,
        preparationMode: m.preparation_mode,
        satiety: m.satiety || 0,
        restrictions: m.restrictions || [],
        publishOn: m.publish_on,
    }))

    function handleAdd() {
        setSelectedMeal(null)
        setOpen(true)
    }

    function handleEdit(meal: Meal) {
        setSelectedMeal(meal)
        setOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">System Recipes</h2>
                    <p className="text-sm text-muted-foreground italic">Manage your culinary database and translations.</p>
                </div>
                <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    New Recipe
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[300px] font-semibold">Recipe Name</TableHead>
                            <TableHead className="font-semibold text-center">Cook Time (m)</TableHead>
                            <TableHead className="font-semibold">Categories</TableHead>
                            <TableHead className="font-semibold">Satiety</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {meals.map((meal) => (
                            <TableRow key={meal.id} className="hover:bg-accent/50 transition-colors">
                                <TableCell className="py-4">
                                    <span className="font-medium text-foreground">
                                        {meal.name?.[locale] || meal.name?.en || "Unnamed Recipe"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className="font-mono">
                                        {meal.cookTime} min
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                        {meal.mealTypes?.map((type) => (
                                            <Badge key={type} variant="secondary" className="px-2 py-0 h-5 text-[10px]">
                                                {type}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${(meal.satiety || 0) * 10}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium">{meal.satiety}/10</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <MealActions meal={meal} onEdit={handleEdit} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <MealDrawer
                open={open}
                onOpenChange={setOpen}
                meal={selectedMeal}
            />
        </div>
    )
}
