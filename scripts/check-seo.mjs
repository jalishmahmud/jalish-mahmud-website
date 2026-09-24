import http from "node:http";
import https from "node:https";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Run against next start with an isolated fallback dataset, never against admin writes.
const origin = process.env.SEO_TEST_ORIGIN || "http://localhost:3000";
const canonicalOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://jalishmahmud.com";
const posts = JSON.parse(await readFile(new URL("../data/blog.json", import.meta.url), "utf8"));
const slugify = (s) => s.toLowerCase().replace(/[^\w\s-]/g, " ").trim().replace(/[\s_-]+/g, "-");
const postPath = (p) => `/blog/${slugify(p.category)}/${p.slug}`;
const categories = [...new Set(posts.map((p) => `/blog/${slugify(p.category)}`))];
const paths = ["/", "/blog", "/privacy-policy", "/terms-and-conditions", ...categories, ...posts.map(postPath)];
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]));
const metas = (html) => Object.fromEntries([...html.matchAll(/<meta\s[^>]*>/g)].map(([tag]) => { const a = attrs(tag); return [a.name || a.property, a.content]; }));
const titles = new Set();
const imageUrls = new Set();
for (const path of paths) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  const head = html.split("</head>")[0];
  const meta = metas(head);
  const title = head.match(/<title>(.*?)<\/title>/)?.[1];
  assert(title && !titles.has(title), `Unique title: ${path}`);
  assert.equal((title.match(/Jalish Mahmud/g) || []).length, 1, `Name once: ${path}`);
  titles.add(title);
  for (const key of ["description", "og:title", "og:description", "og:image", "og:url", "twitter:title", "twitter:description", "twitter:image"]) assert(meta[key], `${path}: ${key}`);
  assert.equal(meta["twitter:card"], "summary_large_image");
  assert.equal(new URL(meta["og:url"]).href, new URL(canonicalOrigin + path).href);
  const canonical = [...head.matchAll(/<link\s[^>]*>/g)].map(([tag]) => attrs(tag)).filter((a) => a.rel === "canonical");
  assert.equal(canonical.length, 1);
  assert.equal(new URL(canonical[0].href).href, new URL(canonicalOrigin + path).href);
  assert(!/noindex/.test(meta.robots));
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `One H1: ${path}`);
  assert(!/mailto:undefined/.test(html));
  for (const key of ["og:url", "og:image", "twitter:image"]) {
    assert(meta[key].startsWith("https://"));
    assert(!/localhost|127\.0\.0\.1|undefined|null|data:/.test(meta[key]));
  }
  imageUrls.add(meta["og:image"]);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  if (path === "/") assert(schemas[0]["@graph"].some((s) => s["@type"] === "Person"));
  if (categories.includes(path)) assert(schemas.some((s) => s["@type"] === "BreadcrumbList"));
  if (posts.some((p) => postPath(p) === path)) {
    assert.equal(meta["og:type"], "article");
    assert(schemas.some((s) => s["@type"] === "BlogPosting" && s.author.name === "Jalish Mahmud" && s.datePublished));
  }
  for (const [tag] of html.matchAll(/<img\s[^>]*>/g)) assert("alt" in attrs(tag), `Image alt: ${path}`);
  console.log(`PASS metadata, headings and schema: ${path}`);
}
const alternateHost = new URL(canonicalOrigin).hostname.startsWith("www.") ? new URL(canonicalOrigin).hostname.slice(4) : `www.${new URL(canonicalOrigin).hostname}`;
// Native HTTP allows overriding Host; fetch may normalize it to the connection origin.
const hostRedirect = await new Promise((resolve, reject) => {
  const transport = origin.startsWith("https:") ? https : http;
  transport.get(origin + "/blog", { headers: { Host: alternateHost } }, (response) => {
    response.resume();
    resolve({ status: response.statusCode, location: response.headers.location });
  }).on("error", reject);
});
assert.equal(hostRedirect.status, 308);
assert.equal(hostRedirect.location, canonicalOrigin + "/blog");
const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
for (const path of paths) assert(sitemap.includes(`<loc>${canonicalOrigin}${path}</loc>`));
assert.equal((sitemap.match(/<loc>/g) || []).length, paths.length);
assert(!/admin|\/api\/|localhost/.test(sitemap));
const robots = await (await fetch(origin + "/robots.txt")).text();
assert(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
assert(!robots.includes("Disallow: /admin"));
for (const path of ["/blog/not-a-real-post-987", "/blog/next-js/not-a-real-post-987", "/not-a-real-route-987"]) {
  assert.equal((await fetch(origin + path)).status, 404, path);
}
for (const post of posts) {
  for (const path of [`/blog/${post.slug}`, `/blog/${post.slug.toUpperCase()}`, postPath(post).toUpperCase().replace("/BLOG", "/blog"), `/blog/old-category/${post.slug}`]) {
    const response = await fetch(origin + path, { redirect: "manual" });
    assert.equal(response.status, 308, path);
    assert.equal(new URL(response.headers.get("location"), origin).pathname, postPath(post));
  }
}
assert.equal((await fetch(origin + "/blog/", { redirect: "manual" })).status, 308);
const queryHtml = await (await fetch(origin + "/blog?search=react&page=2")).text();
assert(queryHtml.includes(`rel="canonical" href="${canonicalOrigin}/blog"`));
for (const path of ["/admin/login", "/admin/dashboard", "/admin/blogs", "/admin/blogs/new", "/admin/blogs/000000000000000000000001/edit", "/admin/blogs/000000000000000000000001/preview"]) {
  const response = await fetch(origin + path, { redirect: "manual" });
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow", path);
  if (path === "/admin/login") assert(metas(await response.text()).robots.includes("noindex"));
  else { assert.equal(response.status, 307); assert(response.headers.get("location").endsWith("/admin/login")); }
}
for (const path of ["/api/og/default", "/apple-icon", "/icon.svg"]) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  assert(response.headers.get("content-type").startsWith("image/"));
  assert((await response.arrayBuffer()).byteLength > 100);
}
assert.equal((await fetch(origin + "/api/blog-images/not-an-id/cover")).status, 404);
console.log(`PASS sitemap, robots, permanent redirects, 404s, private routes and generated images. ${paths.length} public pages checked.`);
