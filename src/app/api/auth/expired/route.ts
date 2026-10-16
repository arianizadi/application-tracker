import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/session";
import { readSession } from "@/lib/auth/session";

/**
 * Reached when a page found the session cookie but no valid session.
 * Clears the stale cookie (so the proxy stops treating the visitor as signed in)
 * and sends them to sign in. Never signs out a valid session.
 */
export async function GET(request: NextRequest) {
  const session = await readSession();
  if (session) return NextResponse.redirect(new URL("/home", request.url));
  (await cookies()).delete(SESSION_COOKIE);
  return NextResponse.redirect(new URL("/login", request.url));
}
