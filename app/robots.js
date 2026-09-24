import { siteUrl } from "@/lib/utils";

export default function robots() {
  // Let crawlers read admin noindex metadata. Authentication protects private data.
  // Public image endpoints must remain crawlable for social and search previews.
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/auth/", "/api/blogs"] }, sitemap: siteUrl("/sitemap.xml") };
}
