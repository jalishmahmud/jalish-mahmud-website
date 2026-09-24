import { ImageResponse } from "next/og";
import header from "@/data/header.json";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#0b0f17", color: "#10b981", fontSize: 80, fontWeight: 700 }}>{header.logoMark}</div>, size);
}
