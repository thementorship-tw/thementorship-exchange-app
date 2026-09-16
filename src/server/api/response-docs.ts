import { z } from "zod";
import "zod-openapi";

export const apiErrorResponseDoc = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      fields: z.record(z.string(), z.string()).optional(),
    }),
  })
  .meta({ id: "ApiErrorResponse" });
