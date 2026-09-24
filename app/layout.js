import "./globals.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import { siteUrl } from "@/lib/utils";

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Jalish Mahmud | Full Stack Software Engineer",
  description: "Portfolio of Jalish Mahmud, a full stack software engineer.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head />
      <body>{children}</body>
    </html>
  );
}
