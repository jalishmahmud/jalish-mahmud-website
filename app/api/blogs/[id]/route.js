import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/auth";
import { deleteBlogById, findBlogById, findBlogSlugCollision, updateBlog } from "@/lib/repositories/blog-repository";
import { parseBlogInput } from "@/lib/validation";
import { invalidatePublishedBlogs, sanitizeContent } from "@/lib/blog";
import { slugify, readingTime } from "@/lib/utils";
import { saveCategory } from "@/lib/categories";
import { mergeBlogInput } from "@/lib/blog-fields";
import { blogSlugState, isBlogSlugCollision } from "@/lib/blog-slugs";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!mongoose.isObjectIdOrHexString(id)) return NextResponse.json({ error: "Invalid blog." }, { status: 400 });
    const blog = await findBlogById(id);
    return blog ? NextResponse.json(blog) : NextResponse.json({ error: "Blog not found." }, { status: 404 });
  } catch { return NextResponse.json({ error: "Unable to load blog." }, { status: 500 }); }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!mongoose.isObjectIdOrHexString(id)) return NextResponse.json({ error: "Invalid blog." }, { status: 400 });
    const body = await request.json();
    const existing = await findBlogById(id);
    if (!existing) return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    const input = parseBlogInput(mergeBlogInput(existing, body));
    if (await findBlogSlugCollision(input.slug, existing._id)) return NextResponse.json({ error: "This article slug is already in use." }, { status: 409 });
    const category = await saveCategory({ name: input.category, slug: input.categorySlug || slugify(input.category) });
    const content = sanitizeContent(input.content);
    const now = new Date();
    const update = { ...input, ...blogSlugState(existing, input.slug, input.status), category: category.name, categorySlug: category.slug, categoryId: category.id, content, contentHtml: content, readTime: readingTime(content), updatedAt: now, publishedAt: existing.publishedAt || (input.status === "published" ? now : null) };
    // A concurrent edit must not overwrite a newly published URL's history.
    const saved = await updateBlog({ _id: existing._id, slug: existing.slug, status: existing.status, updatedAt: existing.updatedAt ?? { $exists: false } }, update);
    if (!saved.matchedCount) return NextResponse.json({ error: "This article changed while saving. Reload it and try again." }, { status: 409 });
    invalidatePublishedBlogs();
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isBlogSlugCollision(error)) return NextResponse.json({ error: "This article slug is already in use." }, { status: 409 });
    return NextResponse.json({ error: error.message === "UNAUTHORIZED" ? "Unauthorized" : "Please check the blog fields and try again." }, { status: error.message === "UNAUTHORIZED" ? 401 : 400 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!mongoose.isObjectIdOrHexString(id)) return NextResponse.json({ error: "Invalid blog." }, { status: 400 });
    const result = await deleteBlogById(id);
    if (result.deletedCount) invalidatePublishedBlogs();
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error.message === "UNAUTHORIZED" ? "Unauthorized" : "Unable to delete blog." }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 }); }
}
