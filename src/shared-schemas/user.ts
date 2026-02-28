import { z } from "zod";

export const userProfileSchema = z.object({
    id: z.string().uuid().optional(),
    email: z.string().email(),
    displayName: z.string().optional().nullable(),
    genre: z.enum(["male", "female", "other"]).optional().nullable(),
    height: z.number().int().min(50).max(250).optional().nullable(),
    weight: z.number().min(20).max(300).optional().nullable(),
    birthday: z.string().optional().nullable(),
    objective: z.enum(["lose_weight", "gain_muscle", "maintain"]).optional().nullable(),
    tmb: z.number().positive().optional().nullable(),
    recommendedKcalIntake: z.number().int().positive().optional().nullable(),
    extraDataComplete: z.boolean().default(false),
    role: z.enum(["user", "admin"]).default("user"),
    locale: z.enum(["en", "es", "pt-pt", "pt-br"]).default("en"),
    preferences: z.record(z.string(), z.any()).default({}).optional().nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
