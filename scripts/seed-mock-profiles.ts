import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import { profiles, users } from "../src/server/db/schema";
import { listProfiles } from "./mock-profile-data";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const configuredDatabaseUrl = process.env.TURSO_DATABASE_URL;

if (!configuredDatabaseUrl) {
  throw new Error("TURSO_DATABASE_URL is required. See .env.example.");
}

if (!configuredDatabaseUrl.startsWith("file:")) {
  throw new Error(
    "Mock profiles seed is for local development only. TURSO_DATABASE_URL must use a file: URL.",
  );
}

const databaseUrl: string = configuredDatabaseUrl;

/** 假資料作者的屆次；只用來滿足 users.session 必填。 */
const MOCK_SESSION = 0;

async function main(): Promise<void> {
  const client = createClient({ url: databaseUrl });
  const db = drizzle(client);

  try {
    // 用 seed 專屬假資料；createdAt 以執行當下往回推，重跑會刷新時間。
    const items = await listProfiles({ limit: Number.MAX_SAFE_INTEGER });
    const groupByNickname = new Map(
      items.map(({ author }) => [author.nickname, author.group]),
    );
    const nicknames = [...groupByNickname.keys()];
    const userIdByNickname = new Map(
      nicknames.map((nickname, index) => [nickname, `mock-user-${index + 1}`]),
    );

    await db
      .insert(users)
      .values(
        nicknames.map((nickname) => {
          const id = userIdByNickname.get(nickname)!;
          return {
            id,
            sub: `mock:${id}`,
            email: `${id}@example.com`,
            session: MOCK_SESSION,
            group: groupByNickname.get(nickname)!,
            googleName: nickname,
            nickname,
            active: true,
          };
        }),
      )
      .onConflictDoUpdate({
        target: users.id,
        set: {
          nickname: sql`excluded.nickname`,
          group: sql`excluded."group"`,
          active: true,
        },
      });

    await db
      .insert(profiles)
      .values(
        items.map((item) => {
          const userId = userIdByNickname.get(item.author.nickname)!;
          return {
            id: item.id,
            userId,
            type: item.type,
            offersText: item.offersText,
            wantsText: item.wantsText,
            description: item.description,
            visible: true,
            createdAt: item.createdAt,
            createdBy: userId,
          };
        }),
      )
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          type: sql`excluded.type`,
          offersText: sql`excluded.offers_text`,
          wantsText: sql`excluded.wants_text`,
          description: sql`excluded.description`,
          createdAt: sql`excluded.created_at`,
          visible: true,
          deletedAt: null,
        },
      });

    console.log(
      `Seeded ${items.length} mock profiles from ${nicknames.length} mock users.`,
    );
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error("Failed to seed mock profiles.", error);
  process.exitCode = 1;
});
