import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();
    if (!identifier || !password || !(await authenticateAdmin(identifier.trim(), password))) return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
