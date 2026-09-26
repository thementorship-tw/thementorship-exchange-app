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

/**
 * 預設只給本機用；其他人也在用同一個 Turso Cloud 資料庫時，亂灌假資料會互相干擾。
 * 確定要對非 file: 的資料庫（例如共用的 staging）灌測試資料時，加 --allow-remote。
 */
const allowRemote = process.argv.includes("--allow-remote");

if (!configuredDatabaseUrl.startsWith("file:") && !allowRemote) {
  throw new Error(
    "Mock profiles seed defaults to local development only. TURSO_DATABASE_URL must use a file: URL, or pass --allow-remote to intentionally seed a shared/cloud database.",
  );
}

const databaseUrl: string = configuredDatabaseUrl;

/** 假資料作者的屆次；只用來滿足 users.session 必填。 */
const MOCK_SESSION = 0;

async function main(): Promise<void> {
  const client = createClient({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
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

    // 逐筆 insert，不用一次塞全部 values 的批次寫法：Turso 的 remote HTTP
    // 連線對這種大型多列 batched INSERT 會回 401（已實測確認，本機 file:
    // 資料庫不會遇到，只有連遠端 Turso Cloud 時才會踩到）。25 筆逐筆寫的
    // 效能差異可忽略，換來能同時在本機與遠端跑。
    for (const nickname of nicknames) {
      const id = userIdByNickname.get(nickname)!;
      await db
        .insert(users)
        .values({
          id,
          sub: `mock:${id}`,
          email: `${id}@example.com`,
          session: MOCK_SESSION,
          group: groupByNickname.get(nickname)!,
          googleName: nickname,
          nickname,
          active: true,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            nickname: sql`excluded.nickname`,
            group: sql`excluded."group"`,
            active: true,
          },
        });
    }

    for (const item of items) {
      const userId = userIdByNickname.get(item.author.nickname)!;
      await db
        .insert(profiles)
        .values({
          id: item.id,
          userId,
          type: item.type,
          offersText: item.offersText,
          wantsText: item.wantsText,
          description: item.description,
          visible: true,
          createdAt: item.createdAt,
          createdBy: userId,
        })
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
    }

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
