import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

function decodeImage(value) {
  if (typeof value !== "string" || !value) return null;
  const dataUri = value.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([a-z0-9+/=\s]+)$/i);
  const mime = dataUri?.[1]?.toLowerCase() || "";
  const encoded = (dataUri?.[2] || value).replace(/\s/g, "");
  if (!/^[a-z0-9+/]+={0,2}$/i.test(encoded) || encoded.length < 16) return null;
  const buffer = Buffer.from(encoded, "base64");
  if (!buffer.length) return null;
  let detected = mime === "image/jpg" ? "image/jpeg" : mime;
  if (!detected && buffer.subarray(0, 4).toString("hex") === "89504e47") detected = "image/png";
  if (!detected && buffer.subarray(0, 2).toString("hex") === "ffd8") detected = "image/jpeg";
  if (!detected && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") detected = "image/webp";
  if (!["image/jpeg", "image/png", "image/webp"].includes(detected)) return null;
  return { buffer, mime: detected };
}

export async function GET(_request, { params }) {
  const { id, kind } = await params;
  if (!ObjectId.isValid(id) || !["cover", "og"].includes(kind)) return new NextResponse("Not found", { status: 404 });
  try {
    const blog = await (await getDatabase()).collection("blogs").findOne({ _id: new ObjectId(id), status: "published" }, { projection: { coverImage: 1, seo: 1, updatedAt: 1 } });
    const source = kind === "og" ? blog?.seo?.ogImage : blog?.coverImage;
    const image = decodeImage(source);
    if (!image) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(image.buffer, { status: 200, headers: { "Content-Type": image.mime, "Cache-Control": "public, max-age=60, s-maxage=86400, stale-while-revalidate=3600" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
