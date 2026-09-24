import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { parseBlogInput } from "@/lib/validation";
import { sanitizeContent } from "@/lib/blog";
import { slugify, readingTime } from "@/lib/utils";
import { getCategorySlug } from "@/lib/blog-urls";

async function uniqueSlug(db, slug, ignoreId) {
  let candidate = slugify(slug);
  let suffix = 2;
  while (await db.collection("blogs").findOne({ slug: candidate, ...(ignoreId ? { _id: { $ne: new ObjectId(ignoreId) } } : {}) })) candidate = `${slugify(slug)}-${suffix++}`;
  return candidate;
}

export async function GET() {
  try {
    await requireAdmin();
    const db = await getDatabase();
    const blogs = await db.collection("blogs").find({}).sort({ updatedAt: -1 }).toArray();
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: error.message === "UNAUTHORIZED" ? "Unauthorized" : "Unable to load blogs." }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const input = parseBlogInput(await request.json());
    const db = await getDatabase();
    const now = new Date();
    const content = sanitizeContent(input.content);
    const doc = { ...input, categorySlug: getCategorySlug(input.category), slug: await uniqueSlug(db, input.slug || input.title), content, contentHtml: content, readTime: readingTime(content), createdAt: now, updatedAt: now, publishedAt: input.status === "published" ? now : null };
    const result = await db.collection("blogs").insertOne(doc);
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message === "UNAUTHORIZED" ? "Unauthorized" : "Please check the blog fields and try again." }, { status: error.message === "UNAUTHORIZED" ? 401 : 400 });
  }
}
