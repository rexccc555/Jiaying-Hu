import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth-session";

export type AccountUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  planningReminderOptIn: boolean;
  productNewsOptIn: boolean;
  createdAt: Date;
  savedTrips: { id: string; locale: string; createdAt: Date; payload: string }[];
};

/** 服务端读取当前登录用户（含行程摘要）；未登录或无效会话返回 null */
export async function getAccountUser(): Promise<AccountUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session || !process.env.DATABASE_URL) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      planningReminderOptIn: true,
      productNewsOptIn: true,
      createdAt: true,
      savedTrips: {
        select: { id: true, locale: true, createdAt: true, payload: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  return user;
}
