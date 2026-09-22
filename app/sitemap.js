import { getPublishedBlogs } from "@/lib/blog";
import { siteUrl } from "@/lib/utils";
export const dynamic = "force-dynamic";
export default async function sitemap() { const posts = await getPublishedBlogs(); return [{ url: siteUrl("/"), lastModified: new Date() }, { url: siteUrl("/blog"), lastModified: new Date() }, ...posts.map((post) => ({ url: siteUrl(`/blog/${post.slug}`), lastModified: post.updatedAt || post.date }))]; }
