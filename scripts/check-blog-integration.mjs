// Explicitly isolated local integration check. Never point this at production.
import assert from "node:assert/strict";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
const origin = process.env.BLOG_TEST_ORIGIN || "http://127.0.0.1:3100";
const uri = process.env.BLOG_TEST_MONGODB_URI || "mongodb://127.0.0.1:27029";
assert(["127.0.0.1", "localhost"].includes(new URL(origin).hostname));
assert(["127.0.0.1", "localhost"].includes(new URL(uri).hostname));
const client = new MongoClient(uri);
const db = client.db("portfolio_contact_blog_test");
const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
let cookie;
async function api(path, body, method = "POST") {
  const response = await fetch(origin + path, { method, headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  assert(response.ok, `${path}: ${response.status} ${JSON.stringify(data)}`);
  return data;
}
try {
  await db.dropDatabase(); // Fixed, disposable database on loopback only.
  await db.collection("admins").insertOne({ username: "acceptance-test", email: "test@example.com", role: "super-admin", passwordHash: await bcrypt.hash("local-test-password", 10) });
  const legacy = { title: "Legacy React Article", slug: "legacy-react", excerpt: "A legacy article used to check compatibility.", category: "React", content: "<p>Legacy content.</p>", status: "published", coverImage: image, seo: { ogImage: image }, publishedAt: new Date() };
  await db.collection("blogs").insertOne(legacy);
  assert.equal((await fetch(origin + "/api/categories")).status, 401);
  const login = await fetch(origin + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: "acceptance-test", password: "local-test-password" }) });
  assert(login.ok); cookie = login.headers.get("set-cookie").split(";")[0];
  assert((await api("/api/categories", null, "GET")).some((c) => c.name === "React"));
  const categories = await Promise.all(["React", "react", "REACT"].map((name) => api("/api/categories", { name, slug: "react" })));
  assert.equal(new Set(categories.map((c) => c.id)).size, 1);
  assert.equal(await db.collection("categories").countDocuments({ slug: "react" }), 1);
  const system = await api("/api/categories", { name: "System Design", slug: "system-design" });
  assert((await api("/api/categories", null, "GET")).some((c) => c.id === system.id));
  let sitemap = await (await fetch(origin + "/sitemap.xml")).text();
  assert(!sitemap.includes("/blog/system-design"));
  const post = { title: "Getting Started with React Hooks", slug: "react-hooks", excerpt: "Learn practical patterns for React Hooks in this acceptance fixture.", content: "<h2>Hooks</h2><p>Published content.</p>", category: "React", categorySlug: "react", coverImage: image, featuredImage: image, socialImage: image, imageAlt: "Cover diagram", featuredImageAlt: "Portrait diagram", featured: true, status: "published", seo: {} };
  const { id } = await api("/api/blogs", post);
  const path = "/blog/react/react-hooks";
  let html = await (await fetch(origin + path)).text();
  assert(html.match(/<img[^>]+src="[^"]+\/cover\?/));
  assert(html.match(/<meta property="og:image" content="[^"]+\/social\?/));
  assert(html.includes("Legacy React Article"));
  for (const kind of ["cover", "featured", "social", "og"]) { const r = await fetch(`${origin}/api/blog-images/${id}/${kind}`); assert.equal(r.status, 200); assert.equal(r.headers.get("content-type"), "image/png"); }
  html = await (await fetch(origin + "/blog")).text();
  assert(html.match(/<img[^>]+src="[^"]+\/featured\?/));
  await api(`/api/blogs/${id}`, { title: "Updated React Hooks Title" }, "PUT");
  let stored = await api(`/api/blogs/${id}`, null, "GET");
  assert.equal(stored.slug, post.slug); assert.equal(stored.coverImage, image); assert.equal(stored.featuredImage, image); assert.equal(stored.socialImage, image);
  await api(`/api/blogs/${id}`, { featured: false }, "PUT");
  assert.equal((await api(`/api/blogs/${id}`, null, "GET")).featuredImage, image);
  assert.equal((await fetch(`${origin}/api/blog-images/${id}/featured`)).status, 404);
  await api(`/api/blogs/${id}`, { featured: true, featuredImage: "", socialImage: "" }, "PUT");
  html = await (await fetch(origin + path)).text();
  assert(html.match(/<meta property="og:image" content="[^"]+\/cover\?/));
  const blogHtml = await (await fetch(origin + "/blog")).text();
  assert(!blogHtml.match(/<img[^>]+src="[^"]+\/featured\?/));
  await api(`/api/blogs/${id}`, { coverImage: "" }, "PUT");
  html = await (await fetch(origin + path)).text();
  assert(html.includes('property="og:image" content="https://jalishmahmud.com/api/og/default"'));
  for (const [category, slug] of [["System Design", "system-design"], ["AWS", "aws"], ["Next.js", "next-js"]]) await api("/api/blogs", { ...post, slug: `${slug}-fixture`, category, categorySlug: slug, featured: false });
  await api("/api/blogs", { ...post, slug: "unpublished-fixture", category: "Draft Only", categorySlug: "draft-only", status: "draft" });
  const home = await (await fetch(origin + "/")).text();
  for (const category of ["React", "System Design", "AWS", "Next.js"]) assert(home.includes(`>${category}</button>`));
  assert(!home.includes(">Draft Only</button>"));
  sitemap = await (await fetch(origin + "/sitemap.xml")).text();
  assert(sitemap.includes("/blog/system-design")); assert(!sitemap.includes("draft-only"));
  assert.equal((await fetch(origin + "/blog/draft-only/unpublished-fixture")).status, 404);
  const legacyHtml = await (await fetch(origin + "/blog/react/legacy-react")).text();
  assert(legacyHtml.match(/<meta property="og:image" content="[^"]+\/social\?/));
  console.log("PASS categories persist/deduplicate, legacy compatibility, image roles/fallbacks, edit preservation, published slug stability, homepage categories, drafts and sitemap.");
  console.log("Local browser fixtures are ready; use acceptance-test / local-test-password on the isolated app only.");
} finally { await client.close(); }
