import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken, type SessionUser } from "@/lib/auth-session";

/** API Route / Server 中读取当前会话用户 */
export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
