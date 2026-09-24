import { getPublishedBlogs, getPublishedCategories } from "@/lib/blog";
import { siteUrl } from "@/lib/utils";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";
export const dynamic = "force-dynamic";
export default async function sitemap() { const posts = await getPublishedBlogs(); const categories = await getPublishedCategories(); return [{ url: siteUrl("/"), lastModified: new Date() }, { url: siteUrl("/blog"), lastModified: new Date() }, ...categories.map((category) => ({ url: siteUrl(getCategoryUrl(category.slug)), lastModified: new Date() })), ...posts.map((post) => ({ url: siteUrl(getBlogUrl(post)), lastModified: post.updatedAt || post.date }))]; }
