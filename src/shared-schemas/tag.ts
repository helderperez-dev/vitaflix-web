import { z } from "zod";
import { localizedStringSchema } from "./product";

export const tagSchema = z.object({
    id: z.string().uuid().optional(),
    slug: z.string().min(1).optional(),
    name: localizedStringSchema,
});

export type Tag = z.infer<typeof tagSchema>;
