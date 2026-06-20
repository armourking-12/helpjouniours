import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://helpjuniors.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/", "/history", "/verify-email"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
