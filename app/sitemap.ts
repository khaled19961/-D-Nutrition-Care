import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const routes = ["/", "/categories", "/offers", "/more", "/cart", "/nutritionists", "/programs", "/articles", "/about", "/booking", "/brands", "/branches", "/bundles", "/health-weight", "/stacks", "/beauty", "/store"];
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7
  }));
}
