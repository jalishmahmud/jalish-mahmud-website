import mongoose from "mongoose";
import Blog from "../../models/Blog.js";
import { connectToDatabase } from "../db/mongoose.js";
import { blogSlugFilter, blogSlugState, isBlogSlugCollision } from "../blog-slugs.js";

let indexPromise;

async function readyBlogModel() {
  await connectToDatabase();
  return Blog;
}

async function writableBlogModel() {
  const model = await readyBlogModel();
  // Existing indexes keep the same names and definitions; no data migration.
  if (!indexPromise) indexPromise = model.createIndexes().catch((error) => {
    indexPromise = undefined;
    throw error;
  });
  await indexPromise;
  return model;
}

// Preserve external URLs, but return only a marker for images stored as base64.
function summaryImage(field) {
  const value = { $ifNull: [`$${field}`, ""] };
  const prefix = { $substrBytes: [value, 0, 12] };
  const externalUrl = { $regexMatch: { input: prefix, regex: "^https?://", options: "i" } };
  const localUrl = { $and: [
    { $regexMatch: { input: prefix, regex: "^/" } },
    { $not: [{ $regexMatch: { input: prefix, regex: "^/9j/" } }] },
  ] };
  return { $cond: [
    { $eq: [{ $ifNull: [`$${field}`, null] }, null] }, null,
    { $cond: [
      { $or: [externalUrl, localUrl] }, value,
      { $cond: [{ $eq: [value, ""] }, "", "stored-image"] },
    ] },
  ] };
}

export async function findPublishedBlogSummaries() {
  const model = await readyBlogModel();
  return model.aggregate([
    { $match: { status: "published" } },
    { $sort: { publishedAt: -1 } },
    { $project: {
      title: 1, slug: 1, excerpt: 1, category: 1, categorySlug: 1,
      imageAlt: 1, featuredImageAlt: 1, featured: 1, readTime: 1,
      date: 1, publishedAt: 1, updatedAt: 1, views: 1,
      coverImage: summaryImage("coverImage"),
      image: summaryImage("image"),
      featuredImage: summaryImage("featuredImage"),
    } },
  ]).exec();
}

export async function findBlogBySlug(slug, includeDrafts = false) {
  const model = await readyBlogModel();
  const posts = await model.aggregate([
    { $match: { ...blogSlugFilter(slug), ...(includeDrafts ? {} : { status: "published" }) } },
    { $limit: 1 },
    { $set: {
      // New documents store the same HTML in both fields. Keep the fallback
      // content field only for legacy documents without contentHtml.
      content: { $cond: [
        { $gt: [{ $strLenBytes: { $ifNull: ["$contentHtml", ""] } }, 0] },
        "$$REMOVE", "$content",
      ] },
      coverImage: summaryImage("coverImage"),
      image: summaryImage("image"),
      featuredImage: summaryImage("featuredImage"),
      socialImage: summaryImage("socialImage"),
      seo: { $mergeObjects: [
        { $ifNull: ["$seo", {}] },
        { ogImage: summaryImage("seo.ogImage"), socialImage: summaryImage("seo.socialImage") },
      ] },
    } },
  ]).exec();
  return posts[0] || null;
}

export async function findAdminBlogSummaries() {
  const model = await readyBlogModel();
  return model.find({}).select("title slug category categorySlug status views updatedAt").sort({ updatedAt: -1 }).lean().exec();
}

export async function findAllBlogs() {
  const model = await readyBlogModel();
  return model.find({}).sort({ updatedAt: -1 }).lean().exec();
}

export async function findBlogById(id) {
  if (!mongoose.isObjectIdOrHexString(id)) return null;
  const model = await readyBlogModel();
  return model.findById(id).lean().exec();
}

export async function findPublishedBlogImage(id, kind) {
  const model = await readyBlogModel();
  const fields = kind === "cover" ? "coverImage image"
    : kind === "featured" ? "featured featuredImage" : "socialImage seo";
  return model.findOne({ _id: id, status: "published" }).select(fields).lean().exec();
}

export async function incrementBlogViews(id) {
  const model = await readyBlogModel();
  return model.updateOne({ _id: id, status: "published" }, { $inc: { views: 1 } }).exec();
}

export async function findBlogSlugCollision(slug, excludingId) {
  const model = await readyBlogModel();
  return model.exists({ ...blogSlugFilter(slug), ...(excludingId ? { _id: { $ne: excludingId } } : {}) });
}

export async function insertBlogWithUniqueSlug(doc) {
  const model = await writableBlogModel();
  for (let suffix = 1; ; suffix += 1) {
    const ending = suffix === 1 ? "" : `-${suffix}`;
    const slug = `${doc.slug.slice(0, 180 - ending.length).replace(/-+$/, "")}${ending}`;
    if (await model.exists(blogSlugFilter(slug))) continue;
    try {
      return await model.create({ ...doc, slug, ...blogSlugState({}, slug, doc.status) });
    } catch (error) {
      if (!isBlogSlugCollision(error)) throw error;
      // A concurrent request claimed this URL after the existence check.
    }
  }
}

export async function updateBlog(filter, update) {
  const model = await writableBlogModel();
  return model.updateOne(filter, { $set: update }).exec();
}

export async function deleteBlogById(id) {
  const model = await readyBlogModel();
  return model.deleteOne({ _id: id }).exec();
}
