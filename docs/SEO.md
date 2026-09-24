# Portfolio SEO

**Read this document before adding public/blog routes or changing metadata, canonical URLs, sitemap, structured data or redirects.** It is the source of truth for future SEO development.

Preserve the homepage typewriter: it is an important part of the owner’s design. Keep professional identity and technical specialization in the server-rendered introduction and metadata while retaining the original animated heading.

## 1. SEO goals

Make Jalish Mahmud's professional identity clear, expose useful engineering/project content to crawlers, make each published article indexable, and provide consistent search/social previews. Technical SEO does not guarantee rankings. Do not keyword-stuff, fabricate qualifications or build spam links.

## 2. Current architecture and audit

- Next.js **16.3.2** in package-lock.json; App Router; JavaScript and React Server Components. package.json uses `latest`, so use `npm ci` to preserve the reviewed versions. No typecheck script exists.
- Public page routes: `/`, `/blog`, `/blog/[categorySlug]`, `/blog/[categorySlug]/[blogSlug]`. About, skills, experience, projects, education, gallery and contact are homepage content, not standalone pages.
- `/blog/[slug]/page.module.css` is a stylesheet, not an additional page route.
- MongoDB is the source of published content when `MONGODB_URI` is present. Without it, the existing `data/blog.json` fallback is served. Configure the database for production; review fallback articles before intentionally publishing them.
- Existing infrastructure retained: category URL helpers, published-only queries, article metadata fallbacks, Base64 image endpoint, default OG endpoint, social sharing, related posts, legacy redirect, dynamic sitemap and robots conventions.
- Initial gaps: minimal homepage/root metadata; no blog-index canonical/social metadata; no homepage identity schema; login lacked noindex; localhost URL fallback in production; request-time sitemap dates; repeated queries; raw JSON-LD serialization; generic animated homepage H1; no icons; empty alt text on image-only links; broken `mailto:undefined` header link.
- Navigation and section headings are server rendered. Interactive filters have real article/category anchors. No search or pagination behavior currently consumes query parameters. No existing PWA or analytics integration was found. Root `index.html`, `script.js`, `style.css` are legacy source files, not Next.js public routes; deploy the Next.js app, not those files as a second site.

## 3. Global SEO and environment

Set at **build and runtime**, then rebuild when changing it:

```env
NEXT_PUBLIC_SITE_URL=https://jalishmahmud.com
GOOGLE_SITE_VERIFICATION=
```

GitHub Actions validation supplies `NEXT_PUBLIC_SITE_URL` from a repository variable, falling back to `https://jalishmahmud.com`. `.env.example` documents settings but Next.js does not load it as an environment file. The separate EC2 build/runtime must have the same value in its existing `.env` or `.env.local`; deployment preserves those files.

Use existing `MONGODB_URI`, `MONGODB_DB`, `ADMIN_SESSION_SECRET` for the blog/admin. Do not commit credentials. The public domain was supplied by the owner. HTTP already returned a 301 to HTTPS and HTTPS returned 200 during implementation; recheck after deployment. The existing www host served a duplicate 200 during the audit. `next.config.mjs` now redirects the alternate www/non-www host to the configured origin, preserving paths; both hosts must reach this app. Prefer an equivalent redirect at nginx as well.

`lib/site-config.js` reuses the name from `data/header.json` and professional links from `utils/links.js`. `lib/utils.js:siteUrl()` requires a public HTTPS origin in production, rejecting missing values, IP/internal hosts, paths, ports and credentials. Development may use localhost. `metadataBase` lives in `app/layout.js`. Root title template is `%s | Jalish Mahmud`; homepage uses an absolute title so the name appears only once. Public pages opt into complete metadata with `buildPageMetadata`; the root does not give admin or 404 pages the homepage canonical.

The shared default social image remains `/api/og/default` (1200×630), using the existing dark/green branding. `app/icon.svg` and `app/apple-icon.js` use the existing JM mark. SVG is the favicon via Next.js icon conventions; no separate `.ico` or PWA manifest is needed. No Twitter username or portrait has been invented.

## 4. Page SEO matrix

| Route | Metadata | Indexing | Structured data | Sitemap |
| --- | --- | --- | --- | --- |
| `/` | Static, unique title/description, canonical, OG/X | Index | Person, ProfilePage, WebSite | Yes |
| `/privacy-policy` | Static title/description, canonical, OG/X | Index | None required | Yes |
| `/terms-and-conditions` | Static title/description, canonical, OG/X | Index | None required | Yes |
| `/blog` | Static, unique title/description, canonical, OG/X | Index | None required | Yes |
| `/blog/[categorySlug]` | Dynamic category name and description, canonical, OG/X | Index when published posts exist | BreadcrumbList | Nonempty categories |
| `/blog/[categorySlug]/[blogSlug]` | Dynamic article fields and fallbacks, canonical, article OG/X | Published only | BlogPosting, BreadcrumbList | Published only |
| Legacy `/blog/[articleSlug]` | 308 to canonical article (unless it is an actual category slug) | Redirect | — | No |
| `/admin/login` | Inherited private metadata | Noindex, nofollow | — | No |
| `/admin/dashboard` | Admin title + private metadata | Noindex, nofollow, authenticated | — | No |
| `/admin/blogs` | Admin title + private metadata | Noindex, nofollow, authenticated | — | No |
| `/admin/blogs/new` | Admin title + private metadata | Noindex, nofollow, authenticated | — | No |
| `/admin/blogs/[id]/edit` | Admin title + private metadata | Noindex, nofollow, authenticated | — | No |
| `/admin/blogs/[id]/preview` | Admin title + private metadata | Noindex, nofollow, authenticated | — | No |
| Unknown categories/articles/routes | Next.js 404 | Noindex | — | No |

Machine routes: `/sitemap.xml`, `/robots.txt`, `/icon.svg`, `/apple-icon`; public images `/api/og/default`, `/api/blog-images/[id]/[kind]`; protected management `/api/blogs`, `/api/blogs/[id]`; authentication `/api/auth/login`, `/api/auth/logout`. None is a sitemap page. API responses carry `X-Robots-Tag: noindex`; public image endpoints remain crawlable for previews.

## 5. Metadata and canonical rules

Every indexable page needs a unique title and description, query-free canonical, complete OG object and `summary_large_image` Twitter metadata. Use `buildPageMetadata()` because Next.js replaces nested metadata instead of deeply merging it. Pass titles without appending the site name; the template does that. Whitespace-only article SEO fields fall back to content fields.

Use `siteUrl`, `getBlogUrl`, `getCategoryUrl` everywhere; never construct production URLs from request Host headers. Trailing slashes redirect using Next.js defaults. Uppercase category/article variants, legacy article URLs and stale category paths redirect permanently to the current published article URL. Category slugs take precedence over legacy article slugs in the one-segment route. Unknown or unpublished slugs call `notFound()`.

`htmlLimitedBots: /.*/` waits for metadata for all clients, so content lookup can produce actual 404/308 status codes before streaming. This trades some initial response latency for predictable metadata and status handling. React request-level cache shares DB reads between metadata and page rendering; there is no persistent cache to delay publishing changes.

Current filter/query URLs display the same content, so canonicalize to the clean path. If real pagination/search is added, revisit this policy: distinct paginated content must not blindly canonicalize to page one. Do not change published slugs casually; legacy one-segment redirects depend on the current slug. A future slug-renaming feature needs a persisted alias history before old slugs can redirect safely.

## 6. Blog SEO rules

- HTML title: SEO title → article title.
- Description: SEO description → excerpt; stripped of HTML.
- OG/X title: OG title → SEO title → article title.
- OG/X description: OG description → SEO description → excerpt.
- Image: custom OG → cover → branded default. Metadata uses absolute HTTPS URLs, never Base64.
- Canonical: `/blog/[categorySlug]/[blogSlug]`.
- Author: visible Jalish Mahmud link and shared `/#person` identity in BlogPosting; full publication/modification dates when known. Invalid/missing dates are omitted rather than invented.
- `imageAlt` provides a meaningful cover description; legacy posts fall back to “Cover for [title]”. Describe the actual image when editing, not just SEO keywords.
- Article body is sanitized server-side; body H1s become H2s so the article title remains the main H1. JSON-LD escapes `<` to prevent authored strings breaking script elements.
- Existing related articles link by title within the category. Only published posts are available from public lookup and image routes.

The editor exposes SEO title/description, social title/description, custom social-image upload and cover alt text. Uploaded Base64 remains stored in MongoDB and exposed through the existing `/api/blog-images/[id]/cover` or `/og` endpoint. Custom remote images must be publicly reachable HTTPS images. HTTP-only image fields fall back; re-upload those images. Image replacement gets a version query from updatedAt. The existing endpoint uses CDN caching, so configure purge/expiry if immediately removing a previously published image is necessary.

## 7. Category SEO

Categories derive from published MongoDB articles; no hardcoded list. Each nonempty category has `[Category] Articles | Jalish Mahmud`, a topic-specific description and its own canonical/social URL. Category breadcrumbs include Home → Blog → Category. Empty/unknown categories return 404, not soft 404 pages.

## 8. Structured data

Homepage: Person with actual name, job title, supported technologies and existing GitHub/LinkedIn profiles; ProfilePage with the Person as mainEntity; WebSite with site name and URL. No invented image, employer, review, rating or search action.

Articles: BlogPosting with headline, description, public image, author URL/identity, real dates, category/tags when present and mainEntityOfPage. Categories and articles: BreadcrumbList with absolute URLs plus visible semantic breadcrumb navigation. No project schema is invented for external products that the portfolio does not own.

Validate using [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org Validator](https://validator.schema.org/). Test homepage, one article and one category. A valid schema does not guarantee a rich result; not every schema type has a Google enhancement.

## 9. Sitemap

`app/sitemap.js` is dynamically generated from one published-post read. Includes `/`, `/blog`, `/privacy-policy`, `/terms-and-conditions`, nonempty categories and canonical published articles. Article `lastModified` uses updatedAt → publishedAt → original fallback date. Static/category dates are omitted because no reliable revision date exists. No fake priorities or change frequencies. No API, admin, preview, draft, redirect, query or fragment URLs. New published content is eligible automatically; database errors are not silently converted into an incomplete sitemap.

## 10. Robots and security

`app/robots.js` allows public crawling and advertises the absolute sitemap URL. It blocks management/auth API crawling but deliberately lets crawlers access admin responses to read noindex. Blocking `/admin` in robots would prevent Google seeing noindex. Admin layout plus response headers provide noindex/nofollow; existing session checks and API authorization protect data. Robots is never authentication. Public image endpoints are not disallowed. Do not add blanket `/api/` or image crawl blocks.

## 11. Google Search Console

1. Open [Search Console](https://search.google.com/search-console).
2. Add `jalishmahmud.com` as a **Domain property**, preferably verify using the supplied DNS TXT record. It covers protocols/subdomains; no code token is necessary.
3. Alternatively add the URL-prefix property `https://jalishmahmud.com/`, choose HTML meta verification and set only the token in `GOOGLE_SITE_VERIFICATION`; rebuild/deploy and verify.
4. Confirm the deployed homepage and public articles are accessible without login and HTTPS/host redirects settle at the canonical origin.
5. Open `/sitemap.xml` after deployment and confirm production DB content is present before submitting `https://jalishmahmud.com/sitemap.xml`.
6. Use URL Inspection → Test live URL for homepage, `/blog`, an important article and category. Check crawl/index eligibility, user-declared and Google-selected canonical, and rendered content.
7. Request indexing for important launches/updates when appropriate; requests do not guarantee indexing.
8. Monitor Page Indexing, Search Performance (including name queries), sitemap status and structured-data/enhancement reports. Correct invalid schema and crawling errors.

Search Console = search queries, search performance, indexing and crawling. Google Analytics = visitor behavior and traffic analytics. Analytics is optional and not required for rankings; none was added.

## 12. Adding a new page

- [ ] Unique title and meta description; title does not repeat the site name
- [ ] Correct clean HTTPS canonical
- [ ] One meaningful server-rendered H1; logical H2/H3 structure
- [ ] OG title, description, public image and page URL
- [ ] Twitter metadata
- [ ] Explicit index/noindex decision; private access remains authenticated
- [ ] Sitemap inclusion when appropriate
- [ ] Accurate structured data if applicable, safely serialized
- [ ] Descriptive image alt text (empty only for decorative images)
- [ ] Crawlable internal links and descriptive anchors
- [ ] Mobile navigation, tap targets, overflow and readability checked
- [ ] Performance, image dimensions/loading and client bundle reviewed

## 13. Adding a new blog

- [ ] Descriptive article title and readable stable lowercase slug
- [ ] Correct category with a nonempty readable slug
- [ ] Excerpt/SEO description; optional SEO title without author suffix
- [ ] Cover and optional custom OG image work publicly
- [ ] Accurate cover/inline image alt text
- [ ] Hierarchical headings below the article H1
- [ ] Useful internal links and category-related posts
- [ ] Code blocks/tables render and scroll on mobile
- [ ] Correct canonical and visible author
- [ ] Article and breadcrumb schema validate
- [ ] Published article appears in sitemap; drafts do not
- [ ] Social preview fetches the image without login

## 14. SEO testing

Use a supported Node version (Node 24 used for this implementation; shell Node 16 cannot build Next 16). Install lockfile dependencies with `npm ci`.

```sh
npm run lint
NEXT_PUBLIC_SITE_URL=https://jalishmahmud.com npm run build
NEXT_PUBLIC_SITE_URL=https://jalishmahmud.com npm start
# In another terminal, against a local instance with MONGODB_URI unset:
node scripts/check-seo.mjs
```

The smoke check uses the existing fallback dataset and asserts all eight public pages, unique titles, canonical/OG/X metadata in server HTML, headings, JSON-LD, sitemap coverage, permanent redirects, true 404s, admin headers/auth redirects, and image MIME responses. Set `SEO_TEST_ORIGIN` for another local port. It does not mutate any database. There is no configured typecheck command; this is a JavaScript project.

For the actual database, separately verify one published article, a draft, custom OG/cover image responses, category additions and publication changes. Use `curl -I` and View Source to inspect real responses. Verify no localhost, undefined, null or IP URLs in SEO fields. Check sharing on LinkedIn/Facebook/X after deployment; their caches can delay updated previews.

At mobile widths (320, 375, 768) inspect navbar, hero, cards, breadcrumb wrapping, article images, long links/code/tables. Run Lighthouse/PageSpeed Insights and inspect real Core Web Vitals after sufficient traffic. Source review or a local build is not a field-performance measurement.

### Recorded verification (2026-09-24)

- `npm run lint`: passed, zero errors/warnings after public image migration and gallery callback correction.
- `NEXT_PUBLIC_SITE_URL=https://jalishmahmud.com npm run build`: passed on Node 24.19.0, Next 16.3.2. The retained default OG route emits Next.js's existing Edge Runtime deprecation warning; this does not fail the build.
- Production response smoke test: eight fallback-data pages passed; sitemap/robots, query canonical, legacy/case/category/host redirects, 404s, all six admin paths and generated social/icon responses passed.
- Production origin guard: correct HTTPS domain accepted; 11 missing/HTTP/IP/internal/path/query configurations rejected.
- Installed Chrome headless: homepage, blog index, category and article tested at 320, 375, 768 and 1440px; no horizontal overflow or page/hydration errors; mobile menu interaction passed. Narrow-screen skills/projects grid minima and header overflow were corrected.
- No live MongoDB credentials were available. Database publication/draft/custom-upload behavior needs a deployed integration check; no claims of live DB testing, Google indexing, Rich Results acceptance or measured Core Web Vitals are made.
- Build and browser validation are local. These changes have not been deployed and Search Console has not been configured.

## 15. Performance and maintenance

Public editor isolation is preserved: RichTextEditor remains a dynamic admin-only import. Homepage client cards receive only display fields, not every article body, raw upload or SEO object. React cache prevents repeated lookup work during rendering. Public cards/gallery/cover images use next/image with stable dimensions; Unsplash is explicitly allowed for optimization, other user-provided sources use unoptimized URLs without opening a broad optimizer allowlist. Below-fold images lazy-load; featured/article covers load eagerly. Keep images reasonably sized when publishing.

Manrope is preserved and self-hosted through next/font/local using installed Latin WOFF2 files, font swapping and adjusted fallback metrics. Preload is disabled to avoid preloading five weights on every page. The original hero typewriter is preserved. The adjacent server-rendered introduction contains the name, role and technical specialization, independently of animation. Article content and tables/code have overflow rules. No third-party analytics or new animation library was added.

External link audit: KriyaKarak, Mapage and GitHub returned 200. Leclair (`https://leclair.co.jp`) failed TLS hostname verification; its link is disabled (null URL in `data/projects.json`) while its project description remains. Confirm the correct live address before restoring it. LinkedIn returned bot-blocking status 999; manually verify it without treating this as a confirmed broken profile.

Monthly and after launches: review Search Console, broken links, mobile layout, actual image responses, sitemap freshness, metadata duplicates and schema errors. Check source claims: the current hero says 5+ years while a stat says 6+ years; confirm the intended wording before changing it. Expand project descriptions with verifiable responsibilities, challenges, technology and outcomes; do not invent metrics. Publish useful, substantive technical articles and keep them updated. Link back from existing GitHub/LinkedIn profiles yourself; earn relevant editorial links through useful work, not link schemes.

## SEO implementation history

- 2026-09-24: audited existing App Router SEO and retained working blog routes/image/sharing infrastructure.
- Centralized identity/metadata and enforced canonical production origin; added homepage profile/site schema, shared author identity and safely serialized breadcrumbs/articles.
- Completed public metadata, private noindex, canonical redirects, date-correct dynamic sitemap and verification support.
- Improved H1, image/author labels, broken contact link, public data payloads, fonts and mobile article overflow; added branded icons without redesigning the site. Fixed narrow-screen card grids and navbar overflow, and added alternate-host redirects.
- Added repository documentation and repeatable production-response checks. Removed the preexisting `docs/` ignore rule so this document is trackable.

- Owner follow-up: restored the original homepage typewriter, phrases, colors and timing; kept the professional identity in the visible introduction. Future SEO changes must preserve this feature.

## References

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Google profile page structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Google article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

## Privacy and website terms

`/privacy-policy` and `/terms-and-conditions` are server-rendered pages with shared styling in `app/(legal)`, global footer links, unique metadata and sitemap entries. The SEO smoke check now covers ten fallback-data pages. These pages explain site practices and content use; they are not prerequisites for Search Console submission or a guaranteed ranking improvement.

The privacy text reflects the reviewed code: email contact, no public accounts/comments/payments/newsletter, no built-in analytics or ads, an in-memory theme choice, a seven-day administrator session cookie, external images and click-triggered sharing links. Hosting logs, email retention, infrastructure-injected services, provider locations and applicable legal requirements cannot be verified from this repository. Before deployment, the owner should check that the notice matches those practices and obtain legal review where necessary. In particular, establish actual retention periods/criteria, provider details and any jurisdiction-specific lawful-basis or rights disclosures rather than treating this text as a compliance certification. Do not claim that the site collects no data.

Review the privacy notice before adding analytics, ads, embeds, forms, newsletters, comments, payments or visitor accounts. The terms do not invent a software licence, arbitration requirement or governing jurisdiction. No cookie-consent banner has been added solely for SEO.

Sources: [Google Search Essentials](https://developers.google.com/search/docs/essentials), [privacy information checklist](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/checklists/) (UK guidance used as a reference, not a determination that UK law applies).
