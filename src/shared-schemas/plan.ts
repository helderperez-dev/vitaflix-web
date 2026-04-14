import { z } from "zod";

export const mealDayConfigSchema = z.object({
    id: z.string().uuid().optional(),
    dailyMealsCount: z.number().int().min(1).max(10),
    slotIndex: z.number().int().min(0),
    categoryId: z.string().uuid(),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, "Plans.errorInvalidTime").optional(),
});

export type MealDayConfig = z.infer<typeof mealDayConfigSchema>;

export const mealPlanSchema = z.object({
    id: z.string().uuid().optional(),
    userId: z.string().uuid(),
    countryId: z.string().uuid().optional().nullable(),
    name: z.string().min(1, "Plans.errorNameRequired"),
    dailyMealsCount: z.number().int().min(1).max(10),
    selectedMeals: z.record(z.string(), z.string().uuid()).default({}), // slotIndex -> mealOptionId
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export type MealPlan = z.infer<typeof mealPlanSchema>;
