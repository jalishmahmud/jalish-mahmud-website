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
const articleSchema = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((match) => JSON.parse(match[1])).find((schema) => schema["@type"] === "BlogPosting");
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
  const post = { title: "Getting Started with React Hooks", slug: "react-hooks", excerpt: "Learn practical patterns for React Hooks in this acceptance fixture.", content: "<h2>Hooks</h2><p>Published content.</p>", category: "React", categorySlug: "react", coverImage: image, featuredImage: image, socialImage: image, socialImageAlt: "Social architecture diagram", imageAlt: "Cover diagram", featuredImageAlt: "Portrait diagram", featured: true, status: "published", seo: { title: "React Hooks SEO Title", description: "A custom search description for this React Hooks article.", ogTitle: "React Hooks Social Title", ogDescription: "A separate sharing description for the React Hooks article." } };
  const { id } = await api("/api/blogs", post);
  const path = "/blog/react/react-hooks";
  let html = await (await fetch(origin + path)).text();
  assert(html.match(/<img[^>]+src="[^"]+\/cover\?/));
  assert(html.match(/<meta property="og:image" content="[^"]+\/social\?/));
  assert(html.includes("Legacy React Article"));
  assert(html.includes("<title>React Hooks SEO Title | Jalish Mahmud</title>"));
  assert(html.includes('name="description" content="A custom search description for this React Hooks article."'));
  assert(html.includes('property="og:title" content="React Hooks Social Title"'));
  assert(html.includes('name="twitter:description" content="A separate sharing description for the React Hooks article."'));
  assert(html.includes('rel="canonical" href="https://jalishmahmud.com/blog/react/react-hooks"'));
  assert(html.includes('"headline":"Getting Started with React Hooks"'));
  assert(articleSchema(html).image[0].includes(`/api/blog-images/${id}/cover?`), "Article schema prefers the cover while OG uses the social image");
  assert(/<a\b(?=[^>]*href="\/")(?=[^>]*rel="author")[^>]*>/.test(html));

  assert(html.includes('property="og:image:alt" content="Social architecture diagram"'));
  assert(html.includes('name="twitter:image:alt" content="Social architecture diagram"'));
  for (const kind of ["cover", "featured", "social", "og"]) { const r = await fetch(`${origin}/api/blog-images/${id}/${kind}`); assert.equal(r.status, 200); assert.equal(r.headers.get("content-type"), "image/png"); assert(!/noindex/.test(r.headers.get("x-robots-tag") || "")); }
  html = await (await fetch(origin + "/blog")).text();
  assert(html.match(/<img[^>]+src="[^"]+\/featured\?/));
  await api(`/api/blogs/${id}`, { title: "Updated React Hooks Title" }, "PUT");
  let stored = await api(`/api/blogs/${id}`, null, "GET");
  assert.equal(stored.socialImageAlt, post.socialImageAlt); assert.equal(stored.slug, post.slug); assert.equal(stored.coverImage, image); assert.equal(stored.featuredImage, image); assert.equal(stored.socialImage, image);
  await api(`/api/blogs/${id}`, { featured: false }, "PUT");
  assert.equal((await api(`/api/blogs/${id}`, null, "GET")).featuredImage, image);
  assert.equal((await fetch(`${origin}/api/blog-images/${id}/featured`)).status, 404);
  await api(`/api/blogs/${id}`, { featured: true, featuredImage: "", socialImage: "" }, "PUT");
  html = await (await fetch(origin + path)).text();
  assert(html.match(/<meta property="og:image" content="[^"]+\/cover\?/));
  assert(html.includes('property="og:image:alt" content="Cover diagram"'));
  const blogHtml = await (await fetch(origin + "/blog")).text();
  assert(!blogHtml.match(/<img[^>]+src="[^"]+\/featured\?/));
  await api(`/api/blogs/${id}`, { coverImage: "" }, "PUT");
  html = await (await fetch(origin + path)).text();
  assert(html.includes('property="og:image" content="https://jalishmahmud.com/api/og/default"'));
  assert(!("image" in articleSchema(html)), "Generic branded OG fallback is not an article schema image");
  assert.equal((await fetch(`${origin}/api/blog-images/${id}/cover`)).status, 404);
  assert.equal((await fetch(`${origin}/api/blog-images/000000000000000000000001/cover`)).status, 404);
  for (const [category, slug] of [["System Design", "system-design"], ["AWS", "aws"], ["Next.js", "next-js"]]) await api("/api/blogs", { ...post, slug: `${slug}-fixture`, category, categorySlug: slug, featured: false });
  const draft = await api("/api/blogs", { ...post, slug: "unpublished-fixture", category: "Draft Only", categorySlug: "draft-only", status: "draft" });
  assert.equal((await fetch(`${origin}/api/blog-images/${draft.id}/cover`)).status, 404);
  const home = await (await fetch(origin + "/")).text();
  for (const category of ["React", "System Design", "AWS", "Next.js"]) assert(home.includes(`>${category}</button>`));
  assert(!home.includes(">Draft Only</button>"));
  sitemap = await (await fetch(origin + "/sitemap.xml")).text();
  assert(sitemap.includes("/blog/system-design")); assert(!sitemap.includes("draft-only"));
  assert.equal((await fetch(origin + "/blog/draft-only/unpublished-fixture")).status, 404);
  const legacyHtml = await (await fetch(origin + "/blog/react/legacy-react")).text();
  assert(legacyHtml.match(/<meta property="og:image" content="[^"]+\/social\?/));
  // Preserve published URLs across multiple renames and a period as a draft.
  const renamedPath = "/blog/react/react-hooks-renamed";
  await api(`/api/blogs/${id}`, { slug: "react-hooks-renamed", publishedSlugs: ["injected-slug"], urlSlugs: ["injected-slug"] }, "PUT");
  async function expectRedirect(from, to) {
    const response = await fetch(origin + from, { redirect: "manual" });
    assert.equal(response.status, 308, from);
    assert.equal(new URL(response.headers.get("location"), origin).pathname, to);
  }
  await expectRedirect(path, renamedPath);
  await expectRedirect("/blog/react-hooks", renamedPath);
  await expectRedirect("/blog/old-category/REACT-HOOKS", renamedPath);
  assert.equal((await fetch(origin + "/blog/react/injected-slug")).status, 404);
  const collision = await fetch(`${origin}/api/blogs/${draft.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ slug: "react-hooks" }) });
  assert.equal(collision.status, 409, "An alias cannot be claimed by another article");
  const copied = await api("/api/blogs", { ...post, slug: "react-hooks" });
  assert.equal((await api(`/api/blogs/${copied.id}`, null, "GET")).slug, "react-hooks-2", "Creation skips reserved aliases");
  await api(`/api/blogs/${id}`, { status: "draft" }, "PUT");
  for (const alias of [path, renamedPath, "/blog/react-hooks"]) assert.equal((await fetch(origin + alias, { redirect: "manual" })).status, 404, "Draft aliases must not resolve");
  await api(`/api/blogs/${id}`, { slug: "never-published" }, "PUT");
  await api(`/api/blogs/${id}`, { slug: "react-hooks-final", status: "published" }, "PUT");
  for (const alias of [path, renamedPath]) await expectRedirect(alias, "/blog/react/react-hooks-final");
  assert.equal((await fetch(origin + "/blog/react/never-published")).status, 404);
  await api(`/api/blogs/${id}`, { slug: "react-hooks" }, "PUT");
  await expectRedirect(renamedPath, path);
  await expectRedirect("/blog/react/react-hooks-final", path);
  // An existing published document acquires history when first edited, without migration.
  await api(`/api/blogs/${legacy._id}`, { slug: "legacy-react-renamed" }, "PUT");
  await expectRedirect("/blog/react/legacy-react", "/blog/react/legacy-react-renamed");
  // Concurrent creates and edits cannot claim the same current or historical URL.
  const concurrent = await Promise.all([1, 2, 3].map(() => api("/api/blogs", { ...post, slug: "concurrent-slug" })));
  const concurrentPosts = await Promise.all(concurrent.map(({ id: blogId }) => api(`/api/blogs/${blogId}`, null, "GET")));
  assert.equal(new Set(concurrentPosts.map((item) => item.slug)).size, 3);
  const edits = await Promise.all(concurrent.slice(0, 2).map(({ id: blogId }) => fetch(`${origin}/api/blogs/${blogId}`, { method: "PUT", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ slug: "concurrent-target" }) })));
  assert.deepEqual(edits.map((response) => response.status).sort(), [200, 409]);
  const sharedId = concurrent[2].id;
  const sharedSlugs = ["same-article-first", "same-article-second"];
  const sharedEdits = await Promise.all(sharedSlugs.map((slug) => fetch(`${origin}/api/blogs/${sharedId}`, { method: "PUT", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ slug }) })));
  assert(sharedEdits.some((response) => response.status === 200));
  assert(sharedEdits.every((response) => [200, 409].includes(response.status)));
  const savedShared = await api(`/api/blogs/${sharedId}`, null, "GET");
  for (const [index, response] of sharedEdits.entries()) {
    if (response.status === 200) assert(savedShared.publishedSlugs.includes(sharedSlugs[index]), "No successful concurrent edit may lose its published URL");
  }
  assert(savedShared.publishedSlugs.includes(concurrentPosts[2].slug));
  sitemap = await (await fetch(origin + "/sitemap.xml")).text();
  for (const alias of [renamedPath, "/blog/react/react-hooks-final", "/blog/react/legacy-react"]) assert(!sitemap.includes(`<loc>https://jalishmahmud.com${alias}</loc>`), "Sitemap excludes historical URLs");
  console.log("PASS categories, legacy compatibility, image/schema fallbacks, published slug redirects, alias collision/concurrency protection, draft exclusion and canonical sitemap URLs.");
  console.log("Local browser fixtures are ready; use acceptance-test / local-test-password on the isolated app only.");
} finally { await client.close(); }
