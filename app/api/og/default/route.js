import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { siteConfig } from "@/lib/site-config";
import { brandAssets } from "@/lib/brand-assets";

export const runtime = "nodejs";

const wordmark = readFile(path.join(process.cwd(), "public", brandAssets.ogWordmark.slice(1)))
  .then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`);

export async function GET() {
  const wordmarkSrc = await wordmark;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", background: "#0b0f17", color: "#fff", fontFamily: "sans-serif" }}>
      {/* ImageResponse needs a raster source for the outlined SVG wordmark. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={wordmarkSrc} alt={siteConfig.fullName} width={650} height={199} style={{ objectFit: "contain" }} />
      <div style={{ display: "flex", width: 290, height: 4, marginTop: -14, marginLeft: 300, borderRadius: 4, background: "#10b981" }} />
      <div style={{ display: "flex", marginTop: 30, fontSize: 64, fontWeight: 800 }}>{siteConfig.jobTitle}</div>
      <div style={{ display: "flex", marginTop: 28, color: "#94a3b8", fontSize: 30 }}>Engineering notes, tutorials, and ideas.</div>
    </div>,
    { width: 1200, height: 630 },
  );
}
