import { z } from "zod";
import { localizedStringSchema, productImageSchema } from "./product";

export const mealOptionSchema = z.object({
    id: z.string().uuid().optional(),
    associatedMealId: z.string(),
    ingredients: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
        unit: z.string(),
        substitutions: z.array(z.object({
            productId: z.string().uuid(),
            quantity: z.number().positive(),
            unit: z.string(),
        })).default([]),
    })).default([]),
    kcal: z.coerce.number().int().min(0, "Products.errorKcalPositive"),
    isDefault: z.boolean().default(false),
    macros: z.object({
        protein: z.coerce.number().min(0, "Products.errorMacrosPositive"),
        fat: z.coerce.number().min(0, "Products.errorMacrosPositive"),
        carbs: z.coerce.number().min(0, "Products.errorMacrosPositive"),
    }).optional().default({ protein: 0, fat: 0, carbs: 0 }),
    substitutionNotes: z.record(z.string(), z.string()).optional().nullable(),
    images: z.array(productImageSchema).default([]),
});

export type MealOption = z.infer<typeof mealOptionSchema>;

export const mealSchema = z.object({
    id: z.string().uuid().optional(),
    name: localizedStringSchema,
    mealTypes: z.array(z.string().uuid()).min(1, "Meals.atLeastOneCategory"),
    cookTime: z.number().int().min(0, "Products.errorKcalPositive").optional(),
    preparationMode: z.array(localizedStringSchema).default([]),
    satiety: z.number().min(0).max(10).optional(),
    restrictions: z.array(z.string().uuid()).optional(),
    publishOn: z.string().datetime().optional().nullable(),
    images: z.array(productImageSchema).default([]),
    options: z.array(mealOptionSchema).default([]),
});

export type Meal = z.infer<typeof mealSchema>;
