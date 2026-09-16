import { z } from "zod";

import {
  validationResult,
  type ValidationResult,
} from "@/shared/api/validation";

export const pushSubscriptionSchema = z.object({
  fcmToken: z.string({ error: "Required" }).trim().min(1, "Required"),
});

export type PushSubscriptionValues = z.output<typeof pushSubscriptionSchema>;

export function validateRegisterPushSubscription(
  input: unknown,
): ValidationResult<PushSubscriptionValues> {
  return validationResult(pushSubscriptionSchema.safeParse(input));
}

export function validateDeactivatePushSubscription(
  input: unknown,
): ValidationResult<PushSubscriptionValues> {
  return validationResult(pushSubscriptionSchema.safeParse(input));
}
