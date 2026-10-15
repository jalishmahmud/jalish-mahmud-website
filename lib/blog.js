import { cache } from "react";
import { createHash } from "node:crypto";
import { revalidateTag, unstable_cache } from "next/cache";
import sanitizeHtml from "sanitize-html";
import fallbackPosts from "@/data/blog.json";
import { isDatabaseConfigured } from "./db/mongoose";
import { findPublishedBlogSummaries, findBlogBySlug, findAdminBlogSummaries, findBlogById } from "./repositories/blog-repository";
import { siteUrl } from "./utils";
import { decodeBlogImage } from "./image-data";
import { storedSocialImage } from "./blog-fields";
import { getCategoryName, getCategorySlug } from "./blog-urls";

export function sanitizeContent(html) {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2", "h3", "pre", "code", "u", "s", "hr"],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, a: ["href", "target", "rel"], img: ["src", "alt", "title"], span: ["class"] },
    transformTags: { h1: "h2", a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
    allowedSchemes: ["http", "https", "data"],
  });
}

function publicImage(value, id, kind, version) {
  if (!value) return "";
  if (/^https:\/\//i.test(value)) return value;
  if (decodeBlogImage(value)) return id ? `${siteUrl(`/api/blog-images/${id}/${kind}`)}?v=${version}` : "";
  if (value.startsWith("/")) return new URL(value, siteUrl()).href;
  if (/^http:\/\//i.test(value)) return "";
  if (!id) return "";
  return `${siteUrl(`/api/blog-images/${id}/${kind}`)}?v=${version}`;
}

function publicPost(post) {
  const id = post._id?.toString?.() || post._id || "";
  const version = post.updatedAt ? new Date(post.updatedAt).getTime() : "";
  const coverImage = publicImage(post.coverImage ?? post.image, id, "cover", version) || siteUrl("/api/og/default");
  const featuredImage = post.featured ? publicImage(post.featuredImage, id, "featured", version) : "";
  const socialImage = publicImage(storedSocialImage(post), id, "social", version);
  const seo = { ...post.seo, ogImage: socialImage, socialImage };
  const category = getCategoryName(post.category);
  const content = Array.isArray(post.content) ? post.content.join(" ") : post.content || post.contentHtml || "";
  const readTime = post.readTime && /^\d+(?:\.\d+)?$/.test(String(post.readTime).trim())
    ? `${post.readTime} min to read` : String(post.readTime || "").replace(/\bmin read\b/g, "min to read");
  return { ...post, _id: id, category, categorySlug: post.categorySlug || getCategorySlug(post.category), seo,
    coverImage, featuredImage, socialImage, image: coverImage,
    date: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : post.date,
    readTime: readTime || `${Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, " ").split(/\s+/).length / 200))} min to read` };

}

const loadPublishedBlogs = unstable_cache(async () => {
  const posts = await findPublishedBlogSummaries();
  return posts.map(publicPost);
}, ["published-blogs", createHash("sha256").update(`${process.env.MONGODB_URI || ""}|${process.env.MONGODB_DB || ""}`).digest("hex")], { tags: ["published-blogs"], revalidate: 60 });

export const getPublishedBlogs = cache(async function getPublishedBlogs() {
  return isDatabaseConfigured() ? loadPublishedBlogs() : fallbackPosts.map(publicPost);
});

export function invalidatePublishedBlogs() {
  revalidateTag("published-blogs", { expire: 0 });
}

export const getBlogBySlug = cache(async function getBlogBySlug(slug, includeDrafts = false) {
  if (!isDatabaseConfigured()) {
    const post = fallbackPosts.find((item) => item.slug === slug);
    return post ? publicPost(post) : null;
  }
  const post = await findBlogBySlug(slug, includeDrafts);
  return post ? publicPost(post) : null;
});

export async function getPublishedBlogsByCategory(categorySlug) {
  const posts = await getPublishedBlogs();
  return posts.filter((post) => post.categorySlug === categorySlug);
}

export async function getPublishedCategories() {
  const posts = await getPublishedBlogs();
  return [...new Map(posts.map((post) => [post.categorySlug, { name: post.category, slug: post.categorySlug }])).values()];
}

export async function getPublishedBlogByCategoryAndSlug(categorySlug, blogSlug) {
  const post = await getBlogBySlug(blogSlug);
  return post?.categorySlug === categorySlug ? post : null;
}

export async function getAdminBlogs() {
  return findAdminBlogSummaries();
}

export async function getBlogById(id) {
  return findBlogById(id);
}

export async function getRelatedBlogs(post) {
  const posts = await getPublishedBlogs();
  return posts.filter((item) => item.slug !== post.slug && item.categorySlug === post.categorySlug).slice(0, 3);
}

export function toPublicBlog(post) { return publicPost(post); }
