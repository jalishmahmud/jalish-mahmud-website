import { ObjectId } from "mongodb";
import sanitizeHtml from "sanitize-html";
import fallbackPosts from "@/data/blog.json";
import { getDatabase, isDatabaseConfigured } from "./mongodb";

export function sanitizeContent(html) {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2", "h3", "pre", "code", "u", "s", "hr"],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, a: ["href", "target", "rel"], img: ["src", "alt", "title"], span: ["class"] },
    allowedSchemes: ["http", "https", "data"],
  });
}

function publicPost(post) {
  return { ...post, _id: post._id?.toString?.() || post._id, date: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : post.date, image: post.coverImage || post.image, readTime: post.readTime || `${Math.max(1, Math.ceil((post.content || "").replace(/<[^>]+>/g, " ").split(/\s+/).length / 200))} min read` };
}

export async function getPublishedBlogs() {
  if (!isDatabaseConfigured()) return fallbackPosts;
  const db = await getDatabase();
  const posts = await db.collection("blogs").find({ status: "published" }).sort({ publishedAt: -1 }).toArray();
  return posts.map(publicPost);
}

export async function getBlogBySlug(slug, includeDrafts = false) {
  if (!isDatabaseConfigured()) return fallbackPosts.find((post) => post.slug === slug) || null;
  const db = await getDatabase();
  const post = await db.collection("blogs").findOne({ slug, ...(includeDrafts ? {} : { status: "published" }) });
  return post ? publicPost(post) : null;
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
  return posts.filter((item) => item.slug !== post.slug && (item.category === post.category || item.tags?.some((tag) => post.tags?.includes(tag)))).slice(0, 3);
}

export function toPublicBlog(post) { return publicPost(post); }
