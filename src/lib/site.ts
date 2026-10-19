export const siteName = "Financial Calculators";
export const directoryPath = "/financial-calculator.html";
export type SiteConfig = { origin?: string; indexable: boolean };
export function siteConfig(
  env: Record<string, string | undefined> = process.env,
): SiteConfig {
  const raw = env.SITE_URL?.trim();
  let origin: string | undefined;
  if (raw) {
    const url = new URL(raw);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/" ||
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    )
      throw new Error(
        "SITE_URL must be a public HTTPS origin, without a path, credentials, query or fragment.",
      );
    origin = url.origin;
  }
  if (env.SITE_INDEXABLE === "true" && !origin)
    throw new Error("Set SITE_URL before enabling SITE_INDEXABLE.");
  return {
    origin,
    indexable:
      !!origin && env.SITE_INDEXABLE === "true" && env.VERCEL_ENV !== "preview",
  };
}
export function absoluteURL(path: string, config = siteConfig()) {
  return config.origin ? new URL(path, config.origin).href : undefined;
}
export function serializeSchema(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
