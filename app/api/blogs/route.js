import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { findAllBlogs, insertBlogWithUniqueSlug } from "@/lib/repositories/blog-repository";
import { parseBlogInput } from "@/lib/validation";
import { invalidatePublishedBlogs, sanitizeContent } from "@/lib/blog";
import { slugify, readingTime } from "@/lib/utils";
import { saveCategory } from "@/lib/categories";
import { mergeBlogInput } from "@/lib/blog-fields";

export async function GET() {
  try {
    await requireAdmin();
    const blogs = await findAllBlogs();
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: error.message === "UNAUTHORIZED" ? "Unauthorized" : "Unable to load blogs." }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const input = parseBlogInput(mergeBlogInput({}, await request.json()));
    const category = await saveCategory({ name: input.category, slug: input.categorySlug || slugify(input.category) });
    const now = new Date();
    const content = sanitizeContent(input.content);
    const doc = { ...input, category: category.name, categorySlug: category.slug, categoryId: category.id, content, contentHtml: content, readTime: readingTime(content), createdAt: now, updatedAt: now, publishedAt: input.status === "published" ? now : null };
    const result = await insertBlogWithUniqueSlug(doc);
    invalidatePublishedBlogs();
    return NextResponse.json({ id: result._id.toString() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message === "UNAUTHORIZED" ? "Unauthorized" : "Please check the blog fields and try again." }, { status: error.message === "UNAUTHORIZED" ? 401 : 400 });
  }
}
