import "server-only";

import { prisma } from "@/lib/prisma";

export async function isDatabaseConnected(): Promise<boolean> {
  try {
    const result = await prisma.$runCommandRaw({ ping: 1 });
    return result.ok === 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    const connectionString = process.env.DATABASE_URL;
    const safeMessage = (connectionString
      ? message.replaceAll(connectionString, "[redacted MongoDB URL]")
      : message
    ).replace(/mongodb(?:\+srv)?:\/\/[^\s"'`]+/gi, "[redacted MongoDB URL]");

    console.error("MongoDB health check failed:", safeMessage);
    return false;
  }
}
