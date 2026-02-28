import { z } from "zod";

export const localizedStringSchema = z.record(z.string(), z.string()).refine(data => {
  const keys = Object.keys(data);
  return keys.length > 0 && keys.some(k => data[k] && data[k].trim().length > 0);
}, {
  message: "At least one language must be provided with content",
});

export const productImageSchema = z.object({
  url: z.string(),
  isDefault: z.boolean().default(false),
});

export type ProductImage = z.infer<typeof productImageSchema>;

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: localizedStringSchema,
  kcal: z.number().int().positive("Calories must be a positive integer"),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  slug: z.string().transform(v => v === "" ? null : v).pipe(
    z.string().regex(/^[a-z0-9-]+$/, "Must be lowercase slug without special chars").nullable()
  ).optional(),
  tagIds: z.array(z.string().uuid()).default([]),
  brandIds: z.array(z.string().uuid()).default([]),
  images: z.array(productImageSchema).default([]),
  isPublic: z.boolean().default(false),
});

export type Product = z.infer<typeof productSchema>;
export type LocalizedString = z.infer<typeof localizedStringSchema>;
