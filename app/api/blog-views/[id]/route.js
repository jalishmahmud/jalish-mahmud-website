import { ObjectId } from "mongodb";
import { getDatabase, isDatabaseConfigured } from "@/lib/mongodb";

export async function POST(request, { params }) {
  const { id } = await params;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  if (!isDatabaseConfigured() || !ObjectId.isValid(id)) return new Response(null, { status: 404 });

  try {
    const result = await (await getDatabase()).collection("blogs").updateOne(
      { _id: new ObjectId(id), status: "published" },
      { $inc: { views: 1 } },
    );
    return new Response(null, { status: result.matchedCount ? 204 : 404 });
  } catch {
    return new Response(null, { status: 503 });
  }
}
