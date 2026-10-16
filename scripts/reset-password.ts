/**
 * Operator tool: set a temporary password for an account and sign it out
 * everywhere. Confirm the requester owns the account before running this.
 *
 *   bun run auth:reset-password <email>
 *
 * Prints a random temporary password; tell the user to change it in Settings.
 */
import { randomBytes } from "node:crypto";

import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/auth/password";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: bun run auth:reset-password <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    console.error("No account with that email.");
    process.exitCode = 1;
  } else {
    const temporary = randomBytes(12).toString("base64url");
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(temporary) } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);
    console.log(`Password reset and all sessions revoked.\nTemporary password: ${temporary}`);
  }
} catch (error) {
  const code = error instanceof Error && "code" in error ? String(error.code) : "unknown";
  console.error(`Password reset failed (${code}). Check DATABASE_URL and server access.`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
