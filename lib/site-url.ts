const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteOrigin = configuredSiteUrl
  ? new URL(configuredSiteUrl).origin
  : "http://localhost:3000";

export function getSiteOrigin() {
  return siteOrigin;
}

export function getAbsoluteSiteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${siteOrigin}/`).toString();
}
