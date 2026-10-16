import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
// Only force https where it is actually served (Vercel, or opted in); `next start` over plain http
// would otherwise upgrade same-origin redirects to https://localhost and fail.
const upgradeInsecure = !isDev && (process.env.VERCEL === "1" || process.env.FORCE_HTTPS === "1");

const cspDirectives = (frameAncestors: string) => [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `frame-ancestors ${frameAncestors}`,
  ...(upgradeInsecure ? ["upgrade-insecure-requests"] : []),
].join("; ");

const contentSecurityPolicy = cspDirectives("'none'");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  serverExternalPackages: ["unpdf"],
  experimental: {
    serverActions: {
      // Resume PDFs are capped at 4 MB in the upload action; Vercel's request limit is 4.5 MB.
      bodySizeLimit: "4.4mb",
    },
  },
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node"],
  },
  turbopack: {
    rules: {
      "*.css": {
        // Without this, `as: "*.css"` also renames `*.module.css` and strips CSS-Module semantics.
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Resume PDFs are previewed in a same-origin iframe; later entries override the same keys.
      {
        source: "/api/resumes/:id/file",
        headers: [
          { key: "Content-Security-Policy", value: cspDirectives("'self'") },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
