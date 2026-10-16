import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const ping = await prisma.$runCommandRaw({ ping: 1 });
  if (ping.ok !== 1) {
    throw new Error("MongoDB ping failed");
  }

  const topology = await prisma.$runCommandRaw({ hello: 1 });
  const count = await prisma.application.count();

  console.log("MongoDB: connected");
  console.log(`Application collection: readable (${count} records)`);
  console.log(
    `Replica set: ${typeof topology.setName === "string" ? "available" : "not detected; Prisma transactions require a replica set"}`,
  );
} catch (error) {
  const code =
    error instanceof Error && "code" in error ? String(error.code) : "unknown";
  console.error(`Database check failed (${code}). Check DATABASE_URL and server access.`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
