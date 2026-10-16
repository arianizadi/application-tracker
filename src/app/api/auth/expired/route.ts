import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { safeNext } from "@/lib/auth/safe-next";
import { readSession, SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Reached when a page found the session cookie but no valid session.
 * Clears the stale cookie (so the proxy stops treating the visitor as signed in)
 * and sends them to sign in. Never signs out a valid session.
 */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  const session = await readSession();
  if (session) return NextResponse.redirect(new URL(safeNext(next), request.url));
  (await cookies()).delete(SESSION_COOKIE);
  const login = new URL("/login", request.url);
  if (next) login.searchParams.set("next", safeNext(next));
  return NextResponse.redirect(login);
}
