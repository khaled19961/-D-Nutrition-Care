import type { MetadataRoute } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/categories", "/offers", "/more", "/nutritionists", "/programs", "/articles", "/about", "/booking", "/brands", "/branches", "/bundles", "/health-weight", "/stacks", "/beauty", "/store"];
  return routes.map((route) => ({
    url: getAbsoluteSiteUrl(route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7
  }));
}
