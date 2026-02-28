import { z } from "zod";

export const subscriptionSchema = z.object({
    id: z.string().uuid().optional(),
    userId: z.string().uuid(),
    stripeSubscriptionId: z.string().optional().nullable(),
    paypalSubscriptionId: z.string().optional().nullable(),
    status: z.enum(["active", "canceled", "incomplete", "past_due", "trialing"]),
    currentPeriodStart: z.string().datetime().optional(),
    currentPeriodEnd: z.string().datetime().optional(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;
