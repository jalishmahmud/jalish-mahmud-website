import "./globals.css";

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
