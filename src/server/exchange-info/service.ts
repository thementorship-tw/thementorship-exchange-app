import {
  createExchangeInfo,
  listPublishedExchangeInfoTypes,
} from "@/server/exchange-info/exchange-info.repository";
import type { CreateExchangeInfoInput } from "@/shared/api/exchange-info/schemas";
import { PROFILE_TYPES, type ProfileType } from "@/shared/profile-types";

export class DuplicateProfileTypeError extends Error {
  constructor() {
    super("The user already has a profile of this type");
    this.name = "DuplicateProfileTypeError";
  }
}

function isUniqueConstraintViolation(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const code = (error as Error & { code?: string }).code;
  return (
    (code === "SQLITE_CONSTRAINT" || code === "SQLITE_CONSTRAINT_UNIQUE") &&
    error.message.includes("profiles.user_id, profiles.type")
  );
}

/**
 * Drizzle 的 .insert() 把真正的 SQLite 錯誤包在 error.cause 裡，頂層 error
 * 只是 "Failed query: insert into ..." 的包裝訊息，SQLITE_CONSTRAINT 代碼
 * 跟欄位名稱都在 cause 裡，不能只看頂層（已用 tsx 直接對本機 libsql driver
 * 觸發過這個 constraint 驗證過這個結構）。同時保留檢查頂層，涵蓋未來若有
 * 程式碼改成直接呼叫 client.execute() 而沒有經過 Drizzle 包裝的情況。
 */
function isDuplicateProfileTypeError(error: unknown): boolean {
  return (
    isUniqueConstraintViolation(error) ||
    (error instanceof Error && isUniqueConstraintViolation(error.cause))
  );
}

export async function publishExchangeInfo(
  userId: string,
  input: CreateExchangeInfoInput,
) {
  try {
    return await createExchangeInfo(userId, input);
  } catch (error) {
    if (isDuplicateProfileTypeError(error)) {
      throw new DuplicateProfileTypeError();
    }
    throw error;
  }
}

export async function getExchangeInfoAvailability(userId: string): Promise<{
  publishedTypes: ProfileType[];
  availableTypes: ProfileType[];
}> {
  const published = new Set(await listPublishedExchangeInfoTypes(userId));

  return {
    publishedTypes: PROFILE_TYPES.filter((type) => published.has(type)),
    availableTypes: PROFILE_TYPES.filter((type) => !published.has(type)),
  };
}
