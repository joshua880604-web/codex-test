export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { absoluteURL, siteConfig } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  const config = siteConfig();
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(config.indexable
      ? { sitemap: absoluteURL("/sitemap.xml", config) }
      : {}),
  };
}
