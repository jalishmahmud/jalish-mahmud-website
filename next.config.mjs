/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  // Resolve metadata before streaming so redirects and 404s keep real HTTP status codes.
  htmlLimitedBots: /.*/,
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] },
  async redirects() {
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    if (!configured) return [];
    const canonical = new URL(configured);
    const alternate = canonical.hostname.startsWith("www.") ? canonical.hostname.slice(4) : `www.${canonical.hostname}`;
    return [{ source: "/:path*", has: [{ type: "host", value: alternate }], destination: `${canonical.origin}/:path*`, permanent: true }];
  },
  async headers() {
    return [
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};
export default nextConfig;
