import { z } from "zod";
import "zod-openapi";

import {
  CONTACT_LOG_CONTACT_INFO_MAX_LENGTH,
  CONTACT_LOG_DEFAULT_PAGE_SIZE,
  CONTACT_LOG_MAX_PAGE_SIZE,
  CONTACT_LOG_MOTIVATION_MAX_LENGTH,
  CONTACT_LOG_OFFERED_RESOURCE_MAX_LENGTH,
  CONTACT_LOG_WANTED_ITEM_MAX_LENGTH,
} from "@/shared/api/contact-logs/constants";
import { PROFILE_TYPES } from "@/shared/profile-types";

type ValidationResult<T> =
  { ok: true; value: T } | { ok: false; fields: Record<string, string> };

/**
 * Response shape. There is no runtime response validation to reuse
 * (responses are built via serializeContactLog, not parsed), but this stays
 * the single source of truth for both the OpenAPI doc and
 * `ContactLogResponse` in types.ts, so the two can't drift apart.
 */
export const contactLogUserSchema = z
  .object({
    id: z.string(),
    nickname: z.string(),
    avatarUrl: z.string().nullable(),
  })
  .meta({ id: "ContactLogUser" });

export const contactLogProfileSnapshotSchema = z
  .object({
    type: z.enum(PROFILE_TYPES),
    offersText: z.string(),
    wantsText: z.string(),
    description: z.string().nullable(),
  })
  .meta({ id: "ContactLogProfileSnapshot" });

export const contactLogResponseSchema = z
  .object({
    id: z.string(),
    profileId: z.string(),
    direction: z.enum(["sent", "received"]),
    fromUser: contactLogUserSchema,
    toUser: contactLogUserSchema,
    offeredResource: z.string(),
    wantedItem: z.string(),
    motivation: z.string(),
    contactInfo: z.string(),
    profile: contactLogProfileSnapshotSchema,
    readAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
  })
  .meta({ id: "ContactLog" });

/**
 * 字數上限以 JS string length（UTF-16 code unit）計算，不特別處理 Unicode
 * code point。少數 emoji 會被算成 2，屬於可接受的誤差，換取這個 schema能
 * 直接被 zod-openapi 讀出 minLength/maxLength，不用另外維護一份文件 schema。
 */
function requiredText(maxLength: number) {
  return z
    .string({ error: "Required" })
    .trim()
    .min(1, "Required")
    .max(maxLength, `Must be ${maxLength} characters or fewer`);
}

export const createContactLogSchema = z.object({
  profileId: z
    .string({ error: "Required" })
    .trim()
    .min(1, "Required")
    .uuid("Must be a valid UUID")
    .meta({
      description: "Target profile ID",
      example: "123e4567-e89b-42d3-a456-426614174000",
    }),
  offeredResource: requiredText(CONTACT_LOG_OFFERED_RESOURCE_MAX_LENGTH).meta({
    example: "我可以提供前端開發經驗",
  }),
  wantedItem: requiredText(CONTACT_LOG_WANTED_ITEM_MAX_LENGTH).meta({
    example: "想了解產品管理",
  }),
  motivation: requiredText(CONTACT_LOG_MOTIVATION_MAX_LENGTH).meta({
    example: "目前正在規劃職涯轉換",
  }),
  contactInfo: requiredText(CONTACT_LOG_CONTACT_INFO_MAX_LENGTH).meta({
    example: "line: example",
  }),
});

export type CreateContactLogValues = z.output<typeof createContactLogSchema>;

/** query string 值一律是 `string | undefined`，讓 `.optional()` 直接處理缺值。 */
function positiveIntegerString() {
  return z.string().regex(/^\d+$/, "Must be a positive integer").optional();
}

/** 只回傳／標記 createdAt 在過去 N 天內的紀錄；不帶則不限制。GET 列表與批次已讀共用。 */
function withinDaysSchema() {
  return positiveIntegerString()
    .meta({
      description: "只回傳／標記 createdAt 在過去 N 天內的紀錄；不帶則不限制",
    })
    .transform((value) => (value === undefined ? undefined : Number(value)))
    .pipe(
      z.number().int().positive("Must be a positive integer").safe().optional(),
    );
}

export const contactLogListQuerySchema = z
  .object({
    role: z
      .enum(["sent", "received"], {
        error: "Must be sent or received",
      })
      .meta({
        description: "取得目前登入者發出（sent）或收到（received）的紀錄",
      }),
    page: positiveIntegerString()
      .meta({ description: "正整數，預設 1" })
      .transform((value) => Number(value ?? 1))
      .pipe(z.number().int().positive("Must be a positive integer").safe()),
    pageSize: positiveIntegerString()
      .meta({
        description: `正整數，預設 ${CONTACT_LOG_DEFAULT_PAGE_SIZE}，最大 ${CONTACT_LOG_MAX_PAGE_SIZE}`,
      })
      .transform((value) => Number(value ?? CONTACT_LOG_DEFAULT_PAGE_SIZE))
      .pipe(
        z
          .number()
          .int()
          .positive("Must be a positive integer")
          .max(
            CONTACT_LOG_MAX_PAGE_SIZE,
            `Must be ${CONTACT_LOG_MAX_PAGE_SIZE} or fewer`,
          )
          .safe(),
      ),
    unread: z
      .enum(["true", "false"], { error: "Must be true or false" })
      .optional()
      .meta({ description: "只能搭配 role=received 使用" })
      .transform((value) => value === "true"),
    withinDays: withinDaysSchema(),
  })
  .superRefine((value, context) => {
    if (value.role === "sent" && value.unread) {
      context.addIssue({
        code: "custom",
        path: ["unread"],
        message: "Can only be used with role=received",
      });
    }
  })
  .transform(({ role, page, pageSize, unread, withinDays }) => ({
    direction: role,
    page,
    pageSize,
    unreadOnly: unread,
    withinDays,
  }));

export type ContactLogListQuery = z.output<typeof contactLogListQuerySchema>;

function fieldsFromError(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    const key = typeof field === "string" ? field : "body";
    fields[key] ??= issue.message;
  }

  return fields;
}

function validationResult<T>(
  result: z.ZodSafeParseResult<T>,
): ValidationResult<T> {
  return result.success
    ? { ok: true, value: result.data }
    : { ok: false, fields: fieldsFromError(result.error) };
}

export function validateCreateContactLog(
  input: unknown,
): ValidationResult<CreateContactLogValues> {
  return validationResult(createContactLogSchema.safeParse(input));
}

export function validateContactLogListQuery(
  searchParams: URLSearchParams,
): ValidationResult<ContactLogListQuery> {
  return validationResult(
    contactLogListQuerySchema.safeParse({
      role: searchParams.get("role") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      unread: searchParams.get("unread") ?? undefined,
      withinDays: searchParams.get("withinDays") ?? undefined,
    }),
  );
}

export const markAllContactLogsReadQuerySchema = z.object({
  withinDays: withinDaysSchema(),
});

export type MarkAllContactLogsReadQuery = z.output<
  typeof markAllContactLogsReadQuerySchema
>;

export function validateMarkAllContactLogsReadQuery(
  searchParams: URLSearchParams,
): ValidationResult<MarkAllContactLogsReadQuery> {
  return validationResult(
    markAllContactLogsReadQuerySchema.safeParse({
      withinDays: searchParams.get("withinDays") ?? undefined,
    }),
  );
}
