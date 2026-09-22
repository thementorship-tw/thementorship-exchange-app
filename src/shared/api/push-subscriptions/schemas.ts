import { z } from "zod";

export const pushSubscriptionSchema = z.object({
  fcmToken: z.string({ error: "Required" }).trim().min(1, "Required"),
});

export type PushSubscriptionValues = z.output<typeof pushSubscriptionSchema>;
