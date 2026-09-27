import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminCategories, saveCategory } from "@/lib/categories";
import { categorySchema } from "@/lib/validation";

export async function GET() {
  try { await requireAdmin(); return NextResponse.json(await getAdminCategories(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return NextResponse.json({ error: "Unable to load categories." }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 }); }
}
export async function POST(request) {
  try { await requireAdmin(); const input = categorySchema.parse(await request.json()); return NextResponse.json(await saveCategory(input)); }
  catch (error) { return NextResponse.json({ error: "Please use a category name and a lowercase, hyphenated slug." }, { status: error.message === "UNAUTHORIZED" ? 401 : 400 }); }
}
