import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", background: "#0b0f17", color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", color: "#10b981", fontSize: 28, fontWeight: 700 }}>{siteConfig.name}</div>
      <div style={{ display: "flex", marginTop: 24, fontSize: 64, fontWeight: 800 }}>{siteConfig.jobTitle}</div>
      <div style={{ display: "flex", marginTop: 28, color: "#94a3b8", fontSize: 30 }}>Engineering notes, tutorials, and ideas.</div>
    </div>,
    { width: 1200, height: 630 },
  );
}
