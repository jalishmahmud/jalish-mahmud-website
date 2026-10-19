import { readFile } from "node:fs/promises";
import path from "node:path";
import { brandAssets } from "@/lib/brand-assets";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const file = path.join(process.cwd(), "public", brandAssets.appleIcon.classic.slice(1));
  return new Response(await readFile(file), { headers: { "Content-Type": contentType } });
}
