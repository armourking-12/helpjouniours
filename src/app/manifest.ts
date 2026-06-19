import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HelpJuniors — AI-Powered Student Resources",
    short_name: "HelpJuniors",
    description:
      "Upload, discover, and download academic resources powered by AI. PYQs, notes, assignments, and study materials.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#6366f1",
  };
}
