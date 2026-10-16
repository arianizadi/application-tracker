import "server-only";

import { prisma } from "@/lib/prisma";

export async function isDatabaseConnected(): Promise<boolean> {
  try {
    const result = await prisma.$runCommandRaw({ ping: 1 });
    return result.ok === 1;
  } catch {
    return false;
  }
}
