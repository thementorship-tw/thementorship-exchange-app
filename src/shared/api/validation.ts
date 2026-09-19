import { z } from "zod";

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
