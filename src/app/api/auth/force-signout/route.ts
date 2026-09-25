import { LOGIN_ERROR } from "@/app/login/login-errors";
import { LOGIN_PATH, signOut } from "@/auth";
import { withBasePath } from "@/shared/base-path";

export async function GET(): Promise<never> {
  return signOut({
    // 交給 Auth.js 的網址要含 basePath
    redirectTo: withBasePath(
      `${LOGIN_PATH}?error=${LOGIN_ERROR.ACCOUNT_DISABLED}`,
    ),
  });
}
