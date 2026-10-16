import { isDatabaseConnected } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET() {
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
