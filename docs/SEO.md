# Portfolio SEO

This is the source of truth for public metadata, identity, canonical URLs and indexing. Preserve the portfolio theme, homepage typewriter and three-post homepage preview.

## Personal Brand SEO

The canonical identity and preferred Google site name are **Jalish Mahmud**. The canonical origin is **https://jalishmahmud.com**, with homepage URL **https://jalishmahmud.com/**. Site name and page title are separate: the former identifies the website; the latter describes an individual page.

`lib/site-config.js` reuses the header brand, existing GitHub/LinkedIn URLs and public location from `data/hero.json`. Homepage branding, `og:site_name`, Person, WebSite, visible authorship and article author data use the same identity.

The homepage contains exactly one WebSite entity with name `Jalish Mahmud`, alternateName `["Jalish", "jalishmahmud.com"]`, canonical URL and a publisher reference to `/#person`. It shares a graph with Person and ProfilePage. Other pages do not repeat WebSite markup. Person uses the existing role **Full Stack Software Engineer**, actual social links, a concise supported expertise list, and public city/country **Dhaka, Bangladesh**. No private street address, invented portrait, business listing or unverified qualification is added. Articles reference the same `/#person` identity and visibly link the author's name to the homepage.

The live-site audit before this work found that WebSite already named Jalish Mahmud, while the deployed page title was older than the workspace. Therefore the exact reason Google chose the domain as its site name cannot be established from source alone. Adding consistent alternatives strengthens the preference; Google chooses the final site name and needs time to recrawl/reprocess it.

## Architecture and public routes

Next.js 16.3.2 App Router, JavaScript, CSS Modules, server-rendered public content and client components for interactions. No separate TypeScript-check script is configured. Use `npm ci` to preserve package-lock versions.

Public routes are `/`, `/blog`, `/contact`, `/privacy-policy`, `/terms-and-conditions`, published category pages and published article pages. Skills, experience, projects and education are homepage sections, not separate routes. `/blog/[slug]/page.module.css` is a stylesheet, not a route. Existing legacy article URLs redirect to the canonical category/article hierarchy.

MongoDB supplies published posts when configured; `data/blog.json` is the development/fallback dataset otherwise. Never deploy fallback fixtures accidentally. Empty and draft-only categories are not publicized. Admin/login/preview pages require the existing authentication where applicable, have noindex/nofollow, and are excluded from the sitemap. Robots directives do not replace authentication.

## Title and description strategy

The currently selected homepage title is **Jalish Mahmud | Full Stack Software Engineer, AWS & System Design**. Keep this deliberate owner-selected title unless requested otherwise. The homepage description is:

> Jalish Mahmud is a Full Stack Software Engineer based in Dhaka, Bangladesh, building React and Next.js applications, APIs and AWS deployment workflows.

React/Next.js specialization is also visible in the server-rendered introduction and skills. The animated heading is preserved; name, role and location do not depend on animation. Cloud experience is described as software engineering and AWS deployment, not a fabricated Cloud Engineer job title.

The root title template appends `| Jalish Mahmud` to child titles. The homepage uses an absolute title to avoid duplicating the name. `/blog` uses **Software Engineering Blog | Jalish Mahmud**. Contact and legal pages retain distinct titles and descriptions. Meta keywords have been removed; do not add them back. Article tags remain content organization/article metadata.

## Topic strategy

- Brand: Jalish Mahmud; Jalish as an alternate name.
- Role: Software Engineer / Full Stack Software Engineer.
- Supported core work: React, Next.js, JavaScript, TypeScript, APIs and full stack application development.
- Supporting work: AWS EC2, deployment, CI/CD and GitHub Actions; AI integration where existing work supports it.
- Location: the already-public Dhaka, Bangladesh.
- Technical articles: answer specific React, Next.js, AWS, system-design or other engineering questions with useful examples and actual expertise.

Do not repeat every target phrase on every page, invent achievements, add hidden keywords, make doorway location pages, or claim to be the best engineer. Homepage establishes identity; articles address technical intent; published categories organize those articles.

## Blog and category SEO

See [BLOG.md](BLOG.md) for authoring and field details. Blog title supplies H1 and BlogPosting headline. SEO title/description override title/excerpt for metadata. Social overrides fall back to SEO text, then article text. Social image falls back to cover, then the default OG image. Featured image is only for the special `/blog` layout. Base64 images are exposed through public HTTPS image endpoints, never data URIs in metadata. Alt descriptions belong to the actual image, not a keyword list.

BlogPosting includes headline, description, a representative article image when supplied, first-publication/modification dates, author and canonical mainEntityOfPage. It prefers the article cover over the social image and omits the generic site logo from Article image markup; OG/Twitter retain their default sharing image. Visible breadcrumbs match BreadcrumbList. Canonical, OG, sharing, sitemap and internal URLs all use `/blog/[categorySlug]/[blogSlug]`.

`lib/category-seo.js` supplies short topic-specific introductions for recognized categories and a natural fallback for new categories. The same description is visible and used in metadata. This configuration does not create categories or invent posts. Public category discovery still requires published articles. Related articles stay in the same category, exclude the current post, and are limited to three.

Create a blog in the existing editor: choose a saved category or add one, write original content with H2/H3 headings and relevant links, provide an excerpt and representative cover/alt text, optionally customize SEO/social fields, then publish. Author and dates are automatic. Keep slugs stable when possible. New admin saves retain published slug history, so earlier published URLs redirect to the current canonical URL after a rename. Unknown slugs changed before this feature cannot be recovered automatically; see [BLOG.md](BLOG.md). A new category is stored persistently but enters the public sitemap only after a published article uses it.

## Favicon and social images

`app/icon.svg` retains the existing JM brand. `app/icon1.js` generates a square **192×192 PNG** companion at `/icon1`; Next.js emits its icon link and dimensions. `app/apple-icon.js` continues providing a 180×180 PNG. Keep these paths stable. No new artwork is required: the current square green JM mark on a dark background fits the use case. If replacing it later, provide a square PNG at least 192×192, with legible artwork at small sizes; do not stretch a rectangular logo.

Homepage and icons must be publicly crawlable by Googlebot and Googlebot-Image. An icon does not guarantee a Google favicon, and changing an Organization/Person logo is not a substitute for an icon link. `/api/og/default` supplies the branded 1200×630 default sharing image and now uses the supported Node.js runtime.

## Canonicals, sitemap, robots and verification

`NEXT_PUBLIC_SITE_URL=https://jalishmahmud.com` is required at build and runtime. `metadataBase` and `siteUrl()` centralize the origin. Production URLs reject localhost, private origins, credentials and invalid path/query configuration. The root forms with/without a trailing slash serialize to the same URL; the audit normalizes URLs before comparing them.

Next.js redirects the alternate www hostname to the preferred origin. HTTP-to-HTTPS enforcement belongs to the existing reverse proxy/CDN; verify it after deployment rather than inferring it from metadata. Do not trust arbitrary forwarded headers for redirects.

`app/sitemap.js` dynamically lists all real indexable pages, published categories and published posts. Article lastModified uses stored dates rather than the current request time. No new sitemap implementation or extra public pages were needed for this work.

`app/robots.js` allows public pages and image/icon assets and references the canonical sitemap. Admin pages remain crawlable so Google can see noindex; private data remains protected by authentication. API JSON responses use noindex; public blog-image and OG endpoints explicitly override that restriction. Do not blanket-block `/api/` and thereby hide article images.

Optional HTML verification uses `GOOGLE_SITE_VERIFICATION`; DNS-verified Domain properties do not require this token. Never store SMTP or database credentials in NEXT_PUBLIC variables or documentation.

## Internal links, semantics and performance

The homepage links to projects, the blog and contact. Article cards link to articles and categories; articles link to their author, category and related posts. Existing skill labels, job duties and project descriptions are real HTML, not image-only content. Public pages retain one main H1 and semantic sections/articles.

Homepage client props now contain at most three cards per category, retaining all published category tabs and the three-visible-post limit. This reduces future growth in hydrated data while preserving filters. Above-the-fold featured/article images request high fetch priority. Fonts stay self-hosted with display swap; image dimensions and responsive layouts remain in place. The rich-text editor/admin packages remain in admin routes, and the contact form is lazy-loaded when the floating panel opens.

The typewriter reserves the maximum phrase height at the current viewport width, preserving the animation without moving downstream content. Reduced-motion preferences show one static phrase; screen readers get one complete phrase without continual typing updates.

No field Core Web Vitals improvement is claimed. The latest [whole-site review](SEO-REVIEW-2026-10-03.md) distinguishes browser lab measurements from real-user data. Uploaded images can still be large; keep them appropriately compressed and check LCP/CLS/INP using PageSpeed Insights and Search Console after deployment. Do not redesign the site or remove the typewriter to chase a score. Public image infrastructure failures return 503/no-store with Retry-After, while missing/unpublished assets return 404.

## Search Console steps after deployment

1. Keep the existing verified `jalishmahmud.com` property. For a new setup, prefer a Domain property and verify using the DNS TXT record.
2. In **Indexing → Sitemaps**, submit `https://jalishmahmud.com/sitemap.xml` (or `sitemap.xml` if the property prefixes the URL).
3. Use URL Inspection on `https://jalishmahmud.com/`, test the live URL, and request indexing.
4. Inspect `/blog`, `/contact`, the real published category pages and your important articles listed in [SEO-AUDIT.md](SEO-AUDIT.md).
5. Confirm `/icon1` is public and the homepage HTML contains its icon link. Request homepage indexing for site-name/favicon changes; Google refreshes these on its own schedule.
6. Monitor Page indexing, search queries/impressions, and Core Web Vitals. Repeated requests do not guarantee faster recrawling.

Google controls titles, snippets, site names, favicons and rankings. None is guaranteed to update immediately or display exactly as requested.

## Validation and maintenance

Run:

```sh
npm run lint
NEXT_PUBLIC_SITE_URL=https://jalishmahmud.com npm run build
# Run next start on port 3100, then inspect the actual configured published data:
SEO_TEST_ORIGIN=http://127.0.0.1:3100 SEO_AUDIT_REPORT=docs/SEO-AUDIT.md node scripts/audit-public-seo.mjs
# For repeatable regression tests, start a separate server with MONGODB_URI empty:
SEO_TEST_ORIGIN=http://127.0.0.1:3101 node scripts/check-seo.mjs
```

The audit uses public GET requests only, enumerates real sitemap URLs, and writes a table with title, description, canonical, H1, indexability, social metadata, structured data and sitemap status. It checks duplicate/missing metadata, identity consistency, image availability and production-safe URLs. No MongoDB records are modified. Audit dates describe the snapshot, not Google's indexed state.

Use [Rich Results Test](https://search.google.com/test/rich-results) for published Article/ProfilePage/Breadcrumb markup and [Schema Markup Validator](https://validator.schema.org/) for the complete graph, especially WebSite site-name markup that may not appear as a Rich Results Test feature. Local JSON validation is not a substitute for Google's live crawl. Use URL Inspection to verify what Google can retrieve.

When adding a public page: use `buildPageMetadata`, a unique title/description, one H1 and useful HTML content; add its actual URL to the sitemap and relevant navigation; test it. Never index drafts/admin previews, expose Base64 in social metadata, fabricate schema facts, add meta keywords, or generate empty SEO categories.

## References

- [Google site names](https://developers.google.com/search/docs/appearance/site-names)
- [Google favicon requirements](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Google article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google profile pages](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Google recrawl requests](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js icon conventions](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons)

## Verification completed 2026-10-03

- Lint and the production build passed. No separate TypeScript check is configured; the Next.js build completed its configured checks. The previous Edge Runtime warning is resolved by moving the default OG generator to Node.js.
- The final production-build audit covered all **13 actual published public URLs** from the configured database, with zero automated findings. [SEO-AUDIT.md](SEO-AUDIT.md) contains every route and all requested audit columns. A separate fallback regression suite passed for 11 public pages, sitemap, robots, canonicals, redirects, noindex/private routes and generated images.
- Chrome verified homepage/blog/category/article/contact layouts at 375, 768 and 1440 pixels, one H1 per page, working typewriter/theme/mobile navigation, the three-post homepage limit, no page errors, and no Tiptap/ProseMirror/Nodemailer code in the loaded homepage scripts. The PNG favicon decoded to exactly 192×192. These are local checks, not field Core Web Vitals measurements.
- Live public HEAD requests confirmed HTTP → HTTPS (301) and www → preferred non-www (308). No production application files, account settings or database records were modified. Deploy this change before requesting Google reindexing.
- The audit initially flagged the homepage's serialized root URL without a trailing slash. This was a comparison bug, corrected by normalizing URLs; the two root forms are equivalent.

The subsequent [whole-site review](SEO-REVIEW-2026-10-03.md) compares this local implementation with the older live deployment, adds measured mobile layout evidence, and records fixes for published-slug redirects, Article image selection and temporary image failures. It also identifies the remaining editorial, accessibility and archive-scaling work. Passing the automated route audit is not a claim that all SEO work is complete.
