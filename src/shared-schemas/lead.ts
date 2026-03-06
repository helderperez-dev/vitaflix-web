import { z } from "zod"

export const leadSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").nullable().optional().or(z.literal('')),
    phone: z.string().nullable().optional().or(z.literal('')),
    source: z.string().nullable().optional().or(z.literal('')),
    funnel_id: z.string().uuid().nullable().optional(),
    step_id: z.string().uuid().nullable().optional(),
    metadata: z.any().nullable().optional(),
    is_archived: z.boolean().default(false),
})

export type Lead = z.infer<typeof leadSchema>
