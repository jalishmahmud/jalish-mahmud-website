import "./globals.css";
import localFont from "next/font/local";
import Script from "next/script";
import { siteConfig } from "@/lib/site-config";
import { siteUrl } from "@/lib/utils";

const manrope = localFont({
  src: [
    { path: "../node_modules/@fontsource/manrope/files/manrope-latin-400-normal.woff2", weight: "400" },
    { path: "../node_modules/@fontsource/manrope/files/manrope-latin-500-normal.woff2", weight: "500" },
    { path: "../node_modules/@fontsource/manrope/files/manrope-latin-600-normal.woff2", weight: "600" },
    { path: "../node_modules/@fontsource/manrope/files/manrope-latin-700-normal.woff2", weight: "700" },
    { path: "../node_modules/@fontsource/manrope/files/manrope-latin-800-normal.woff2", weight: "800" },
  ],
  display: "swap",
  variable: "--font-manrope",
  preload: false,
});

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: siteConfig.title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  authors: [{ name: siteConfig.fullName, url: siteUrl("/") }],
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className={manrope.variable} suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var theme=localStorage.getItem('theme');if(theme==='light'||theme==='dark'){document.documentElement.dataset.theme=theme}}catch(error){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
