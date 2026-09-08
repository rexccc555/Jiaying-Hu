import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function makeClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** Netlify / Serverless 下复用实例，减轻连接数压力 */
export const prisma = globalForPrisma.prisma ?? makeClient();
globalForPrisma.prisma = prisma;
