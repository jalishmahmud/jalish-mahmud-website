import { siteUrl } from "@/lib/utils";
export default function robots() { return { rules: { userAgent: "*", allow: ["/", "/blog"], disallow: ["/admin/"] }, sitemap: `${siteUrl("/sitemap.xml")}` }; }
