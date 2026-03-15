import { z } from "zod";
import { localizedStringSchema } from "./product";

export const brandSchema = z.object({
    id: z.string().uuid().optional(),
    name: localizedStringSchema,
    logoUrl: z.string().optional().nullable(),
    storeMarketIds: z.array(z.string().uuid()).optional(),
});

export type Brand = z.infer<typeof brandSchema>;
