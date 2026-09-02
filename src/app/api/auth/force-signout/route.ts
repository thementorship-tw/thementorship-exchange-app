import { ACCOUNT_DISABLED_ERROR } from "@/app/login/login-errors";
import { signOut } from "@/auth";

export async function GET(): Promise<never> {
  return signOut({ redirectTo: `/login?error=${ACCOUNT_DISABLED_ERROR}` });
}
