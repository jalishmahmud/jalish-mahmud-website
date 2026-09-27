import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

import { decodeBlogImage } from "@/lib/image-data";
import { storedSocialImage } from "@/lib/blog-fields";

export async function GET(_request, { params }) {
  const { id, kind } = await params;
  if (!ObjectId.isValid(id) || !["cover", "featured", "social", "og"].includes(kind)) return new NextResponse("Not found", { status: 404 });
  try {
    const blog = await (await getDatabase()).collection("blogs").findOne({ _id: new ObjectId(id), status: "published" }, { projection: { coverImage: 1, image: 1, featuredImage: 1, featured: 1, socialImage: 1, seo: 1, updatedAt: 1 } });
    const source = kind === "og" || kind === "social" ? storedSocialImage(blog || {}) : kind === "featured" ? (blog?.featured ? blog.featuredImage : "") : (blog?.coverImage ?? blog?.image);
    const image = decodeBlogImage(source);
    if (!image) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(image.buffer, { status: 200, headers: { "Content-Type": image.mime, "Cache-Control": "public, max-age=60, s-maxage=86400, stale-while-revalidate=3600" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
