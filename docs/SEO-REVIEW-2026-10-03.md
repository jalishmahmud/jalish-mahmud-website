# Personal brand and technical blog SEO review — 2026-10-03

The site has a sound technical foundation. No immediate public-page indexing blocker was found. This does **not** establish that Google has indexed every page, that this is the best possible implementation, or that it will rank first for “software developer.” Google explicitly says there is no configuration that automatically produces first place. See the [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

## Scope and evidence

- Reviewed the Next.js App Router metadata, shared brand data, server-rendered public pages, blog/admin publishing flow, redirects, sitemap, robots, structured data, image delivery, internal navigation and responsive homepage behavior.
- Crawled all **13 live sitemap URLs**: five main/legal pages, two categories and six articles. Every listed URL returned 200. See [live route snapshot](SEO-LIVE-AUDIT.md).
- Checked canonical URLs, unique titles/descriptions, headings, OG/X metadata, schema identity, image responses, linked internal pages, missing-page status, admin noindex and origin redirects.
- Examined the live homepage in Chrome at 375, 768 and 1440 pixels for approximately 30 seconds each, including the typing cycle. These are unthrottled lab samples, not Lighthouse scores or real-user Core Web Vitals.
- Ran a read-only aggregate of published document sizes in the configured database; no production records were modified.
- No access to Search Console reports, Google's selected canonicals, indexing coverage, manual actions, backlink data, query rankings or field LCP/INP/CLS. Article code examples were not individually executed or fact-checked in this implementation audit.

## What is working

| Area | Evidence |
| --- | --- |
| Public crawlability | All 13 live sitemap pages return 200, without noindex. Robots references the canonical sitemap and permits public pages/images. |
| Canonical origin | HTTP redirects to HTTPS with 301; www redirects to the preferred non-www origin with 308. Sitemap, canonical, OG URL and article URLs agree. |
| Missing/private pages | Sample missing page and article return actual 404. Admin login has `X-Robots-Tag: noindex, nofollow`; private-route checks are in the regression suite. |
| Metadata | All 13 live pages have unique titles and descriptions, one H1 and complete OG/X metadata. |
| Brand identity | Shared name, role, actual social URLs and author identity; homepage Person/ProfilePage/WebSite, category breadcrumbs, and article BlogPosting/BreadcrumbList. The workspace adds the visible Dhaka introduction and consistent Person city/country. |
| Blog publishing | Draft exclusion, canonical category/article paths, server-rendered article content, author link, publication dates, reading time, category links and related articles. |
| CMS SEO fields | Title, excerpt, slug, category, content, cover/alt text and SEO/social overrides are sufficient. No extra keyword field is needed to make an article eligible for search. |
| Image delivery | Sampled seven live cover/featured URLs all return images; sizes are approximately 107–151 kB. All rendered images have alt attributes. No inline Base64 images were found in the 13 current live pages. |
| Internal discovery | All sampled main-content same-origin links resolve successfully. Homepage leads to the blog, category pages and article pages. |

Alt attribute presence alone does not establish that every description is useful. Valid JSON-LD alone does not establish rich-result eligibility. Use Google's live testing tools after deployment.

## Prioritized findings

### 1. Deploy the current workspace improvements

**High priority; deployment remains outstanding.** The live homepage title at audit time was `Jalish Mahmud | Full Stack Engineer, AWS & System Design`; the current selected workspace title includes `Software`. The live site also lacks the workspace's alternate site name, Person locality, explicit role/location introduction and 192×192 PNG favicon reference. Blog/category descriptions differ too.

The live report's 17 automated findings are **not 17 indexing failures**. Thirteen flag unused meta keywords; four detect differences from the selected brand implementation. Meta keywords are ignored by Google, so removing them is cleanup, not a ranking boost. The location-introduction check does not mean Dhaka is absent everywhere on the live homepage. Alternate site names, locality and a PNG companion are useful choices for this site, not universal indexing requirements. [Google on meta keywords](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag).

### 2. Stop the mobile homepage from jumping during typing

**Fixed locally; deployment and field verification remain.** At 375×900, the live H1 repeatedly changed between approximately 73 and 109 pixels. Large layout shifts correlated with the typed phrases wrapping/unwrapping. The 30-second lab sample's maximum CLS session was **0.234**. The tablet/desktop samples were approximately 0.004/0.003, with stable heading heights.

The fix preserves the phrases, colors and typing speeds and reserves enough responsive space for the longest wrapped phrase. It also respects reduced-motion preferences and provides one stable screen-reader phrase. Invisible copies are used only to measure/reserve the existing animation's layout.

The final local production-build sample at 375×900 kept the heading at **109.42 pixels** and measured a maximum CLS session of **0.047**, with the repeated phrase-wrapping shifts removed. One initial font-related shift elsewhere remains; this is not a claim of zero page movement. The earlier live sample and the local sample use different serving environments and are diagnostic observations, not a controlled field-performance comparison. Delaying font requests by 800 ms also preserved heading height at 320, 375 and 480 pixels. Compare field measurements only after deployment: [Google's Core Web Vitals guidance](https://developers.google.com/search/docs/appearance/core-web-vitals).

### 3. Keep previously published article URLs working

**Fixed locally.** Previously, editing a slug discarded the old URL, producing 404 for existing Google results or backlinks. Admin writes now retain published slug history and reserve those URLs; old published aliases resolve to the current canonical route with a permanent redirect. Draft-only slugs are not publicized. Historical URLs lost before this feature need an explicit mapping if known.

### 4. Correct article-image schema and failure responses

**Fixed locally.** BlogPosting now prefers the representative article cover, falls back to an actual social image, and omits the generic logo if no article image exists. The default sharing image remains available to OG/X. [Google's Article image recommendations](https://developers.google.com/search/docs/appearance/structured-data/article).

Temporary database failures on public image routes now return **503**, `Cache-Control: no-store` and `Retry-After: 60`, rather than a misleading 404. Missing/unpublished images retain 404. This allows crawlers to distinguish a temporary service issue from missing content. [Google's HTTP status guidance](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes).

### 5. Add stronger evidence to the personal brand and articles

**High editorial priority; requires truthful source material.** The homepage's `100% Scalable Systems` is not a defined metric. Confirm the accuracy of `6+ Yrs Full Stack Experience` against the actual scope/timeline of your work. Employer galleries use Unsplash photos under names such as “Team Moments” and “Office Event”; confirm these are appropriate, replace them with genuine approved photos, or clearly identify illustrative images. No replacement achievements or photos were invented during this audit.

The three project summaries would benefit from substantive original case studies: the problem, your contribution, design decisions, trade-offs, authorized code/screenshots and measurable outcomes where available. A missing public project URL need not be fabricated; explain work you can legitimately discuss.

None of the six live articles contained linked external technical references; the external main-content links were sharing actions. Add relevant official documentation/research next to technical claims and link related articles where the text discusses those concepts. This is a usefulness/credibility recommendation, not a mandatory outbound-link quota or an asserted Google penalty. Validate code, disclose versions, include real examples/results, and remove repetitive sections where they do not help the reader. [Google's helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

### 6. Plan for blog growth without premature redesign

**Medium priority; not an observed indexing failure.** `getPublishedBlogs()` retrieves all published documents including full content and Base64 cover/social fields; related articles, categories and sitemap reuse it. React request caching does not eliminate the work across separate requests. The current six published documents total **2,034,327 BSON bytes**, with the largest **475,315 bytes**. This is a storage-size measurement, not measured network transfer or latency.

Use narrow card/metadata queries, explicit related-post limits and image URL/presence metadata as the archive grows. Consider archive pagination with crawlable links once necessary. Preserve complete sitemap discovery and the three-post homepage preview. The current 13 HTML responses ranged from about 22 to 139 kB uncompressed, so there is no evidence of an existing multi-megabyte HTML problem.

The editor permits Base64 inline images even though none are in the current live articles. Before using many inline uploads, add public asset URLs, real dimensions and appropriate loading behavior. Uploaded covers are currently modest in size, but the allowed maximum is 1.5 MB; responsive compression remains a useful improvement.

### 7. Accessibility follow-ups

**Medium UX priority; not a standalone ranking diagnosis.** White small-button text on the existing green accent calculates to roughly 2.54:1 in dark mode and 3.77:1 in light mode. Adjust relevant foreground/background combinations while preserving the visual theme. Desktop experience details use parent `:focus` rather than `:focus-within`, and their gallery modal lacks full focus trapping/restoration. These mechanisms warrant a separate keyboard/contrast pass; contact widget accessibility is implemented separately. Unrelated components were not redesigned in this audit.

## Search visibility strategy

The homepage should establish who you are and what you do; articles should answer specific technical questions. Suggested query themes below are hypotheses based on the actual portfolio, not measured search volume or guaranteed ranking opportunities:

| Intent | Appropriate content |
| --- | --- |
| Jalish Mahmud / Jalish Mahmud software engineer | Homepage and consistent real LinkedIn/GitHub profiles linking to it. |
| Full stack software engineer in Dhaka/Bangladesh | Existing truthful role/location, work examples and contact details. |
| React/Next.js engineer with AWS deployment experience | Demonstrated projects, original deployment case studies and relevant skills. |
| Specific technical problem, API comparison or system-design trade-off | An article that directly answers the question with tested examples, diagrams when useful and reliable sources. |

Do not add keyword-stuffed titles, hidden search text, repeated location pages, purchased backlinks or invented testimonials. Earn useful references through open-source contributions, real project demonstrations and sharing articles where they solve a relevant problem. Avoid changing the homepage title repeatedly to chase broad keywords. “Software developer” has broad intent and substantial competition; a technical implementation cannot ensure top placement.

## After deployment

1. Re-run the live route audit and verify the selected title, identity text, favicon, renamed-article redirects and mobile layout.
2. In the verified Search Console property, submit/retain `https://jalishmahmud.com/sitemap.xml` under **Indexing → Sitemaps**. Inspect the homepage and important articles, test live URLs and request indexing after substantial updates.
3. Check Google's selected canonical, Page indexing, manual actions and rich-result validation. Fix actual reported problems before adding more metadata.
4. Review **Performance → Search results** by query, page, country and device. Separate name searches from non-brand technical queries; compare impressions, clicks, CTR and average position over comparable periods.
5. Review real-user Core Web Vitals/PageSpeed Insights. A local Chrome sample does not measure field INP or prove that every visitor has good performance.

## Verification and changes

- `npm run lint`: passed.
- `npm run build`: passed on Next.js 16.3.2 with Node 24.19.0. This JavaScript project has no separate type-check command.
- All **13 actual published public URLs** passed the local production-build metadata/identity/image audit with **zero automated findings**. [Final local snapshot](SEO-AUDIT.md).
- The **11-page fallback regression suite** passed, covering metadata, canonicals, robots, sitemap, redirects, true 404s, private-route noindex and generated images. The database-unavailable image response was confirmed as 503/no-store/Retry-After rather than 404.
- **Five blog unit tests** passed. The expanded isolated MongoDB/API integration passed for published aliases, collisions/concurrent updates, legacy compatibility, unpublish/republish, drafts, sitemap entries, image availability and Article-image schema fallbacks.
- Chrome verified stable heading heights at 375/768/1440, no horizontal overflow at 320/375/768/1440, preserved typing, the accessible complete heading, reduced-motion behavior, and the three-article homepage limit. Delayed-font tests passed at 320/375/480.
- `git diff --check`: passed. No packages or environment variables were added. No production application deployment or production database write was performed. All temporary local test servers were stopped.

Audit changes are in the two blog API write routes, `lib/blog-slugs.js`, `lib/blog.js`, the public image route, article schema generation, the typewriter component/CSS, the existing SEO/blog regression scripts and their documentation. Existing brand/title changes were preserved. The new index is created lazily on the first authenticated save after deployment and needs database index-creation permission; no production migration was run.

The live audit remains a snapshot of the older deployment. “Zero automated findings” means the checks in the script passed; it does not override the editorial, accessibility, scaling or measurement follow-ups above and does not establish a Google ranking.
