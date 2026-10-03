import { ImageResponse } from "next/og";
import header from "@/data/header.json";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

// Raster companion to the existing JM SVG; same brand, stable public URL.
export default function Icon() {
  return new ImageResponse(
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#0b0f17", color: "#10b981", borderRadius: 36, fontSize: 87, fontWeight: 700 }}>{header.logoMark}</div>,
    size,
  );
}
