import "./globals.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/800.css";

export const metadata = {
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
