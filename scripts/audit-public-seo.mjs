// Read-only audit of the actual URLs in a site's sitemap; never writes to MongoDB.
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import sanitizeHtml from "sanitize-html";
const origin = process.env.SEO_TEST_ORIGIN || "http://127.0.0.1:3100";
const canonicalOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://jalishmahmud.com";
const report = process.env.SEO_AUDIT_REPORT;
const strict = process.env.SEO_AUDIT_STRICT !== "0";
const decode = (s = "") => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]));
const text = (s) => {
  // Exclude aria-hidden animation/sizing copies when reporting accessible headings.
  const accessible = sanitizeHtml(s || "", { allowedTags: ["span", "br"], allowedAttributes: { span: ["aria-hidden"] }, exclusiveFilter: (frame) => frame.attribs["aria-hidden"] === "true" });
  return decode(sanitizeHtml(accessible.replace(/<br\s*\/?>|<\/span>/gi, " "), { allowedTags: [], allowedAttributes: {} })).replace(/\s+/g, " ").trim();
};
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
async function get(path) { return fetch(new URL(path, origin), { signal: AbortSignal.timeout(30000) }); }
const sitemap = await (await get("/sitemap.xml")).text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decode(m[1]));
assert(urls.length, "Sitemap must list public pages");
const issues = [], rows = [], titles = new Set(), descriptions = new Set(), imageUrls = new Set();
const check = (value, message) => { if (!value) issues.push(message); };
for (const url of urls) {
  const path = new URL(url).pathname;
  const response = await get(path);
  const html = await response.text();
  const head = html.split("</head>")[0];
  const meta = Object.fromEntries([...head.matchAll(/<meta\s[^>]*>/g)].map(([tag]) => { const a = attrs(tag); return [a.name || a.property, a.content]; }));
  const links = [...head.matchAll(/<link\s[^>]*>/g)].map(([tag]) => attrs(tag));
  const canonicals = links.filter((a) => a.rel === "canonical");
  const title = text(head.match(/<title>(.*?)<\/title>/s)?.[1]);
  const headings = [...html.matchAll(/<h1(?:\s[^>]*)?>(.*?)<\/h1>/gs)].map((m) => text(m[1]));
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap((m) => { const data = JSON.parse(m[1]); return data["@graph"] || [data]; });
  const indexable = response.ok && !/noindex/.test(`${meta.robots || ""} ${response.headers.get("x-robots-tag") || ""}`);
  const og = ["og:title", "og:description", "og:image", "og:url", "twitter:title", "twitter:description", "twitter:image"].every((key) => meta[key]);
  check(response.status === 200, `${path}: HTTP ${response.status}`);
  check(title && !titles.has(title), `${path}: missing/duplicate title`); titles.add(title);
  check(meta.description && !descriptions.has(meta.description), `${path}: missing/duplicate description`); descriptions.add(meta.description);
  check(headings.length === 1, `${path}: ${headings.length} H1 elements`);
  check(canonicals.length === 1 && new URL(canonicals[0].href).href === new URL(canonicalOrigin + path).href, `${path}: canonical mismatch`);
  check(indexable && og, `${path}: indexing or social metadata missing`);
  check(!meta.keywords, `${path}: unnecessary meta keywords`);
  check(meta["og:site_name"] === "Jalish Mahmud", `${path}: site-name mismatch`);
  for (const value of [canonicals[0]?.href, meta["og:url"], meta["og:image"], meta["twitter:image"]]) check(value?.startsWith("https://") && !/localhost|127\.0\.0\.1|undefined|null|data:/.test(value), `${path}: non-production metadata URL`);
  if (meta["og:image"]) imageUrls.add(meta["og:image"]);
  const websites = schemas.filter((s) => s["@type"] === "WebSite");
  if (path === "/") {
    check(websites.length === 1 && websites[0].name === "Jalish Mahmud", "Homepage needs one preferred WebSite entity");
    check(websites[0]?.alternateName?.includes("Jalish"), "Missing alternate site name");
    const person = schemas.find((s) => s["@type"] === "Person");
    check(person?.address?.addressLocality === "Dhaka" && person?.address?.addressCountry === "Bangladesh", "Public city/country missing from Person");
    check(links.some((a) => a.rel === "icon" && a.type === "image/png" && a.sizes === "192x192"), "Missing square PNG icon reference");
    check(text(html).includes("based in Dhaka, Bangladesh"), "Homepage introduction differs from the configured role/location wording");
  } else check(websites.length === 0, `${path}: competing WebSite entity`);
  if (path.split("/").filter(Boolean).length === 3 && path.startsWith("/blog/")) {
    const article = schemas.find((s) => s["@type"] === "BlogPosting");
    check(article?.author?.["@id"] === canonicalOrigin + "/#person", `${path}: disconnected author`);
    check(article?.datePublished && article?.mainEntityOfPage?.["@id"] === url, `${path}: article date/URL missing`);
  }
  rows.push([path, title, meta.description || "Missing", canonicals[0]?.href || "Missing", headings.join(" / "), indexable ? "Yes" : "No", og ? "OG + X" : "Incomplete", schemas.map((s) => s["@type"]).join(", ") || "—", "Yes"]);
}
for (const url of imageUrls) {
  const image = new URL(url);
  if (image.origin !== canonicalOrigin) continue;
  const response = await get(image.pathname + image.search);
  check(response.ok && response.headers.get("content-type")?.startsWith("image/"), `Image unavailable: ${image.pathname}`);
  check(!/noindex/.test(response.headers.get("x-robots-tag") || ""), `Image blocked from indexing: ${image.pathname}`);
  await response.arrayBuffer();
}
const output = `# Public route SEO audit\n\nGenerated ${new Date().toISOString()}. Source: ${origin}. Canonical origin: ${canonicalOrigin}. Read-only, sitemap-derived snapshot; not a ranking or Google indexing guarantee.\n\n| Route | Title | Description | Canonical | H1 | Indexable? | Open Graph | Structured Data | Sitemap |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.map((r) => `| ${r.map(cell).join(" | ")} |`).join("\n")}\n\n## Findings\n\n${issues.length ? issues.map((s) => `- ${s}`).join("\n") : "All automated checks passed."}\n`;
if (report) await writeFile(report, output);
console.log(`${rows.length} public routes audited; ${issues.length} findings.${report ? ` Report: ${report}` : ""}`);
for (const issue of issues) console.log(issue);
if (strict) assert.equal(issues.length, 0, "Review audit findings");
