import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { parseBlogInput } from "@/lib/validation";
import { sanitizeContent } from "@/lib/blog";
import { slugify, readingTime } from "@/lib/utils";
import { getCategorySlug } from "@/lib/blog-urls";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid blog." }, { status: 400 });
    const blog = await (await getDatabase()).collection("blogs").findOne({ _id: new ObjectId(id) });
    return blog ? NextResponse.json(blog) : NextResponse.json({ error: "Blog not found." }, { status: 404 });
  } catch { return NextResponse.json({ error: "Unable to load blog." }, { status: 500 }); }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid blog." }, { status: 400 });
    const input = parseBlogInput(await request.json());
    const db = await getDatabase();
    const existing = await db.collection("blogs").findOne({ _id: new ObjectId(id) });
    if (!existing) return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    const content = sanitizeContent(input.content);
    const now = new Date();
    const update = { ...input, categorySlug: getCategorySlug(input.category), slug: slugify(input.slug || input.title), content, contentHtml: content, readTime: readingTime(content), updatedAt: now, publishedAt: existing.publishedAt || (input.status === "published" ? now : null) };
    await db.collection("blogs").updateOne({ _id: new ObjectId(id) }, { $set: update });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error.message === "UNAUTHORIZED" ? "Unauthorized" : "Please check the blog fields and try again." }, { status: error.message === "UNAUTHORIZED" ? 401 : 400 }); }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid blog." }, { status: 400 });
    await (await getDatabase()).collection("blogs").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error.message === "UNAUTHORIZED" ? "Unauthorized" : "Unable to delete blog." }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 }); }
}
