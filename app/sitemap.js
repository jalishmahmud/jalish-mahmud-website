import { getPublishedBlogs } from "@/lib/blog";
import { siteUrl } from "@/lib/utils";
import { isoDate } from "@/lib/seo";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const posts = await getPublishedBlogs();
  const categories = [...new Set(posts.map((post) => post.categorySlug))];
  return [
    { url: siteUrl("/") },
    { url: siteUrl("/blog") },
    { url: siteUrl("/privacy-policy") },
    { url: siteUrl("/terms-and-conditions") },
    ...categories.map((slug) => ({ url: siteUrl(getCategoryUrl(slug)) })),
    ...posts.map((post) => ({ url: siteUrl(getBlogUrl(post)), lastModified: isoDate(post.updatedAt || post.publishedAt || post.date) })),
  ];
}
