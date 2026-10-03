import { cache } from "react";
import { ObjectId } from "mongodb";
import sanitizeHtml from "sanitize-html";
import fallbackPosts from "@/data/blog.json";
import { getDatabase, isDatabaseConfigured } from "./mongodb";
import { siteUrl } from "./utils";
import { decodeBlogImage } from "./image-data";
import { storedSocialImage } from "./blog-fields";
import { getCategoryName, getCategorySlug } from "./blog-urls";
import { blogSlugFilter } from "./blog-slugs";

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
  const content = Array.isArray(post.content) ? post.content.join(" ") : post.content || "";
  const readTime = post.readTime && /^\d+(?:\.\d+)?$/.test(String(post.readTime).trim())
    ? `${post.readTime} min to read` : String(post.readTime || "").replace(/\bmin read\b/g, "min to read");
  return { ...post, _id: id, category, categorySlug: post.categorySlug || getCategorySlug(post.category), seo,
    coverImage, featuredImage, socialImage, image: coverImage,
    date: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : post.date,
    readTime: readTime || `${Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, " ").split(/\s+/).length / 200))} min to read` };

}

export const getPublishedBlogs = cache(async function getPublishedBlogs() {
  if (!isDatabaseConfigured()) return fallbackPosts.map(publicPost);
  const db = await getDatabase();
  const posts = await db.collection("blogs").find({ status: "published" }).sort({ publishedAt: -1 }).toArray();
  return posts.map(publicPost);
});

export const getBlogBySlug = cache(async function getBlogBySlug(slug, includeDrafts = false) {
  if (!isDatabaseConfigured()) {
    const post = fallbackPosts.find((item) => item.slug === slug);
    return post ? publicPost(post) : null;
  }
  const db = await getDatabase();
  const post = await db.collection("blogs").findOne({ ...blogSlugFilter(slug), ...(includeDrafts ? {} : { status: "published" }) });
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
  const db = await getDatabase();
  return db.collection("blogs").find({}).sort({ updatedAt: -1 }).toArray();
}

export async function getBlogById(id) {
  const db = await getDatabase();
  if (!ObjectId.isValid(id)) return null;
  return db.collection("blogs").findOne({ _id: new ObjectId(id) });
}

export async function getRelatedBlogs(post) {
  const posts = await getPublishedBlogs();
  return posts.filter((item) => item.slug !== post.slug && item.categorySlug === post.categorySlug).slice(0, 3);
}

export function toPublicBlog(post) { return publicPost(post); }
