import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/about",
    "/resources",
    "/courses",
    "/universities",
    "/blog",
    "/leaderboard",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
  ];

  return staticPages.map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
