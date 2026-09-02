import { LOGIN_ERROR } from "@/app/login/login-errors";
import { signOut } from "@/auth";

export async function GET(): Promise<never> {
  return signOut({
    redirectTo: `/login?error=${LOGIN_ERROR.ACCOUNT_DISABLED}`,
  });
}
