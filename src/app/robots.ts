import type { MetadataRoute } from "next";

/** Public pages are crawlable; the signed-in app and APIs are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/faq", "/login", "/signup"],
      disallow: [
        "/api/",
        "/home",
        "/applications",
        "/resumes",
        "/analyzer",
        "/prep",
        "/stats",
        "/achievements",
        "/settings",
      ],
    },
  };
}
