import { z } from "zod";
import { localizedStringSchema } from "./product";

export const tagSchema = z.object({
    id: z.string().uuid().optional(),
    slug: z.string().min(1).optional(),
    name: localizedStringSchema,
    logo_url: z.string().url().optional().nullable(),
});

export type Tag = z.infer<typeof tagSchema>;

export type TagTable = 'tags' | 'meal_categories' | 'dietary_tags' | 'user_roles' | 'wellness_objectives' | 'meal_plan_sizes' | 'product_groups' | 'brands';
