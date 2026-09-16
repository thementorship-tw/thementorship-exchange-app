import { z } from "zod";
import "zod-openapi";

import { contactLogResponseSchema } from "@/shared/api/contact-logs/schemas";

/**
 * Envelope/wrapper schemas for the OpenAPI document only. route.ts builds
 * these shapes directly via `Response.json({ data: ... })`, so there is no
 * TS type or runtime validation to reuse for the envelopes themselves. The
 * entity schema (ContactLog) lives in schemas.ts, not here, so it can't
 * drift from ContactLogResponse in types.ts. Request schemas are NOT
 * duplicated here either — createContactLogSchema and
 * contactLogListQuerySchema from schemas.ts are used directly in
 * server/api/openapi.ts, since they render correctly for OpenAPI without
 * needing a separate doc-only copy.
 */

export const contactLogListResponseDoc = z
  .object({
    data: z.array(contactLogResponseSchema),
    pagination: z
      .object({
        page: z.number().int(),
        pageSize: z.number().int(),
        totalItems: z.number().int(),
        totalPages: z.number().int(),
      })
      .meta({ id: "ContactLogPagination" }),
  })
  .meta({ id: "ContactLogListResponse" });

export const createContactLogResponseDoc = z
  .object({ data: contactLogResponseSchema })
  .meta({ id: "CreateContactLogResponse" });

export const markContactLogReadResponseDoc = z
  .object({
    data: z.object({
      id: z.string(),
      readAt: z.iso.datetime(),
    }),
  })
  .meta({ id: "MarkContactLogReadResponse" });

export const markAllContactLogsReadResponseDoc = z
  .object({
    data: z.object({
      updatedCount: z.number().int(),
      readAt: z.iso.datetime(),
    }),
  })
  .meta({ id: "MarkAllContactLogsReadResponse" });
