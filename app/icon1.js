import { readFile } from "node:fs/promises";
import path from "node:path";
import { brandAssets } from "@/lib/brand-assets";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

// Keep the established /icon1 URL while serving the exact concept 2 artwork.
export default async function Icon() {
  const file = path.join(process.cwd(), "public", brandAssets.iconPng.classic.slice(1));
  return new Response(await readFile(file), { headers: { "Content-Type": contentType } });
}
