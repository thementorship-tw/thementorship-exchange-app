import { cookies } from "next/headers";
import { decode, encode, type JWT } from "next-auth/jwt";

import {
  CURRENT_CONSENT_VERSIONS,
  type ConsentVersions,
} from "@/consent-versions";
import { serverEnv } from "@/env";

// CHECK:
const MAX_AGE_SECONDS = 30 * 60;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * 使用 `__Host-` 前綴，瀏覽器只接受符合以下條件的 Cookie：
 * 1. 透過 HTTPS 設定，且帶有 `Secure`
 * 2. `Path` 必須為 `/`
 * 3. 不得指定 `Domain`
 *
 * 因此 Cookie 只綁定目前的完整主機名稱，
 * 子網域無法替父網域設定或覆蓋這顆 Cookie。
 */
const COOKIE_NAME = `${IS_PRODUCTION ? "__Host-" : ""}mentorship.consent-receipt`;

export type ConsentReceipt = ConsentVersions & {
  agreedAt: Date;
};

export async function issueConsentReceipt(): Promise<void> {
  const agreedAt = new Date();

  const token = await encode({
    secret: serverEnv.authSecret,
    salt: COOKIE_NAME,
    maxAge: MAX_AGE_SECONDS,
    token: { ...CURRENT_CONSENT_VERSIONS, agreedAt: agreedAt.toISOString() },
  });

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readConsentReceipt(): Promise<ConsentReceipt | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return toConsentReceipt(
      await decode({ token, secret: serverEnv.authSecret, salt: COOKIE_NAME }),
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
function toConsentReceipt(payload: JWT | null): ConsentReceipt | null {
  if (payload === null) return null;

  const { termsVersion, privacyVersion, agreedAt } = payload;

  if (
    typeof termsVersion !== "string" ||
    typeof privacyVersion !== "string" ||
    typeof agreedAt !== "string"
  ) {
    return null;
  }

  const parsedAgreedAt = new Date(agreedAt);
  if (Number.isNaN(parsedAgreedAt.getTime())) return null;

  return { termsVersion, privacyVersion, agreedAt: parsedAgreedAt };
}
