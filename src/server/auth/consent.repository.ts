import type { Database } from "@/server/db";
import { consentLogs } from "@/server/db/schema";
import type { ConsentVersions } from "@/shared/consent-versions";

/** 只要有 `insert` 就能寫入，因此 `getDb()` 與 transaction 都適用。 */
type ConsentWriter = Pick<Database, "insert">;

export type ConsentInput = ConsentVersions & {
  userId: string;
  agreedAt: Date;
};

export function insertConsentLog(db: ConsentWriter, input: ConsentInput) {
  return db
    .insert(consentLogs)
    .values({
      userId: input.userId,
      termsVersion: input.termsVersion,
      privacyVersion: input.privacyVersion,
      agreedAt: input.agreedAt,
    })
    .onConflictDoNothing();
}
