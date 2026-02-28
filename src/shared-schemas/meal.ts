import { z } from "zod";
import { localizedStringSchema } from "./product";

export const mealSchema = z.object({
    id: z.string().uuid().optional(),
    name: localizedStringSchema,
    mealTypes: z.array(z.string()),
    cookTime: z.number().int().min(0).optional(),
    preparationMode: localizedStringSchema,
    satiety: z.number().min(0).max(10).optional(),
    restrictions: z.array(z.string()).optional(),
    publishOn: z.string().datetime().optional().nullable(),
});

export type Meal = z.infer<typeof mealSchema>;

export const mealOptionSchema = z.object({
    id: z.string().uuid().optional(),
    associatedMealId: z.string().uuid(),
    ingredients: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
        unit: z.string(),
    })),
    kcal: z.number().int().positive(),
    isDefault: z.boolean().default(false),
    macros: z.object({
        protein: z.number().min(0),
        fat: z.number().min(0),
        carbs: z.number().min(0),
    }).optional(),
});

export type MealOption = z.infer<typeof mealOptionSchema>;
