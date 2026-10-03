import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { parseBlogInput } from "@/lib/validation";
import { sanitizeContent } from "@/lib/blog";
import { slugify, readingTime } from "@/lib/utils";
import { saveCategory } from "@/lib/categories";
import { mergeBlogInput } from "@/lib/blog-fields";
import { insertBlogWithUniqueSlug, writableBlogs } from "@/lib/blog-slugs";

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
    const input = parseBlogInput(mergeBlogInput({}, await request.json()));
    const db = await getDatabase();
    const category = await saveCategory({ name: input.category, slug: input.categorySlug || slugify(input.category) });
    const now = new Date();
    const content = sanitizeContent(input.content);
    const doc = { ...input, category: category.name, categorySlug: category.slug, categoryId: category.id, content, contentHtml: content, readTime: readingTime(content), createdAt: now, updatedAt: now, publishedAt: input.status === "published" ? now : null };
    const result = await insertBlogWithUniqueSlug(await writableBlogs(db), doc);
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message === "UNAUTHORIZED" ? "Unauthorized" : "Please check the blog fields and try again." }, { status: error.message === "UNAUTHORIZED" ? 401 : 400 });
  }
}
