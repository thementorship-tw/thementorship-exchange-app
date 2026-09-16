import { z } from "zod";

export type ValidationResult<T> =
  { ok: true; value: T } | { ok: false; fields: Record<string, string> };

/**
 * 字數上限以 JS string length（UTF-16 code unit）計算，不特別處理 Unicode
 * code point。少數 emoji 會被算成 2，屬於可接受的誤差，換取這個 schema 能
 * 直接被 zod-openapi 讀出 minLength/maxLength，不用另外維護一份文件 schema。
 */
export function requiredText(maxLength: number) {
  return z
    .string({ error: "Required" })
    .trim()
    .min(1, "Required")
    .max(maxLength, `Must be ${maxLength} characters or fewer`);
}

/** Query string 值一律是 `string | undefined`，讓 `.optional()` 直接處理缺值。 */
export function positiveIntegerString() {
  return z.string().regex(/^\d+$/, "Must be a positive integer").optional();
}

function fieldsFromError(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    const key = typeof field === "string" ? field : "body";
    fields[key] ??= issue.message;
  }

  return fields;
}

export function validationResult<T>(
  result: z.ZodSafeParseResult<T>,
): ValidationResult<T> {
  return result.success
    ? { ok: true, value: result.data }
    : { ok: false, fields: fieldsFromError(result.error) };
}
