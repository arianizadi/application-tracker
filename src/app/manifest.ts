import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/home",
    name: "Canopy",
    short_name: "Canopy",
    description: "A cozy, gamified internship tracker. Every application plants a tree.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f4ea",
    theme_color: "#3d6b3a",
    categories: ["productivity", "education"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
    shortcuts: [
      { name: "Add an application", short_name: "Add", url: "/applications/new" },
      { name: "Applications", url: "/applications" },
      { name: "Interview prep", url: "/prep" },
    ],
  };
}
