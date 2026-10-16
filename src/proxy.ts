import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "at_session";
const APP_PREFIXES = ["/home", "/applications", "/resumes", "/analyzer", "/stats", "/achievements", "/prep", "/settings"];
const AUTH_PAGES = ["/login", "/signup"];
/** Lets requireUser() send an expired session back to the page it was on (see src/lib/auth/dal.ts). */
const PATHNAME_HEADER = "x-pathname";

/**
 * Optimistic routing only: checks for the presence of a session cookie.
 * Real authorization happens in the data access layer (src/lib/auth/dal.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isAppRoute = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!hasSession && isAppRoute) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (hasSession && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (isAppRoute) {
    const headers = new Headers(request.headers);
    headers.set(PATHNAME_HEADER, `${pathname}${search}`);
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|manifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|webp|ico|woff2?)$).*)"],
};
