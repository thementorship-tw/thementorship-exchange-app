import type { z } from "zod";

import { apiError } from "@/server/api/response";

/** 把 zod issue 攤平成 { 欄位路徑: 第一個錯誤訊息 }。 */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fields;
}

export function validationError(fields: Record<string, string>): Response {
  return apiError(422, "VALIDATION_ERROR", "Request validation failed", fields);
}

type ParseResult<T> = { ok: true; data: T } | { ok: false; response: Response };

function parseWithSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  raw: unknown,
): ParseResult<z.output<TSchema>> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      response: validationError(toFieldErrors(result.error)),
    };
  }
  return { ok: true, data: result.data };
}

export async function parseJsonBody<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
): Promise<ParseResult<z.output<TSchema>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: apiError(
        400,
        "INVALID_JSON",
        "Request body must be valid JSON",
      ),
    };
  }

  return parseWithSchema(schema, body);
}

/** 驗證從 `URLSearchParams` 取出、組成物件的 query string 參數。 */
export function parseQuery<TSchema extends z.ZodType>(
  schema: TSchema,
  raw: unknown,
): ParseResult<z.output<TSchema>> {
  return parseWithSchema(schema, raw);
}
