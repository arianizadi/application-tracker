import { connection } from "next/server";

import { isDatabaseConnected } from "@/lib/database";

export async function GET() {
  await connection();
  const connected = await isDatabaseConnected();

  return Response.json(
    {
      status: connected ? "ok" : "error",
      database: connected ? "connected" : "unavailable",
    },
    {
      status: connected ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
