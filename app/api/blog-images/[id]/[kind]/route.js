import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { findPublishedBlogImage } from "@/lib/repositories/blog-repository";

import { decodeBlogImage } from "@/lib/image-data";
import { storedSocialImage } from "@/lib/blog-fields";

export async function GET(request, { params }) {
  const { id, kind } = await params;
  if (!mongoose.isObjectIdOrHexString(id) || !["cover", "featured", "social", "og"].includes(kind)) return new NextResponse("Not found", { status: 404 });
  try {
    const blog = await findPublishedBlogImage(id, kind);
    const source = kind === "og" || kind === "social" ? storedSocialImage(blog || {}) : kind === "featured" ? (blog?.featured ? blog.featuredImage : "") : (blog?.coverImage ?? blog?.image);
    const image = decodeBlogImage(source);
    if (!image) return new NextResponse("Not found", { status: 404 });
    const versioned = new URL(request.url).searchParams.has("v");
    const cacheControl = versioned
      ? "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600"
      : "public, max-age=60, s-maxage=86400, stale-while-revalidate=3600";
    return new NextResponse(image.buffer, { status: 200, headers: { "Content-Type": image.mime, "Cache-Control": cacheControl } });
  } catch {
    // A temporary database outage must not look like a permanently missing image
    // to crawlers or be cached as a successful response by a proxy.
    return new NextResponse("Image temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "60" },
    });
  }
}
