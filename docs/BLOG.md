# Blog authoring and image roles

The existing Next.js/MongoDB/Tiptap blog remains in place. No image-hosting migration or category dashboard was introduced.

## Images

| Field | Recommended dimensions | Use |
| --- | --- | --- |
| `coverImage` | 1200 × 630 | Article detail, normal/category/homepage/related cards; social fallback |
| `featuredImage` | 1250 × 1320 | Only the special featured section on `/blog` |
| `socialImage` | 1200 × 630 | Open Graph, Twitter/X and article structured-data image |

JPG, PNG or WebP, maximum **1,500,000 bytes** per uploaded image. Dimensions are recommendations, not publishing restrictions. Browser preview shows dimensions, size and format for new uploads, plus an aspect-ratio warning. Server validates Base64 size and image signatures. Replace or Remove explicitly; edits without a new upload preserve existing images. Unchecking Featured retains the stored featured image but stops exposing it publicly.

Featured fallback: `featuredImage → coverImage`. Social fallback: `socialImage → coverImage → /api/og/default`. The featured image never becomes an automatic social or article-detail image. A missing cover uses the branded default placeholder; it does not use the featured image. Article/featured images render with natural height and contain behavior to show the complete image. Related cards use cover images and separate title/category links.

Cover alt text remains the compatible `imageAlt` field. `featuredImageAlt` falls back to cover alt, then the existing title-based fallback. Provide real descriptions of images rather than keyword lists.

MongoDB stores Base64 as before. Public objects replace stored images with HTTPS endpoint URLs. `/api/blog-images/[id]/cover`, `/featured`, `/social` serve published images. `/og` remains a supported legacy alias for social images. Raw Base64 and data URIs are supported; MIME must match an allowed image signature. Metadata never receives data URIs. Legacy `image`, `seo.ogImage` and `seo.socialImage` remain readable; `socialImage` is the canonical new field. Empty strings represent explicit removal and take precedence over legacy aliases. Existing routes remain valid.

Three 1.5 MB images expand to about 6 MB of Base64 JSON. Ensure nginx permits around **8m** request bodies for the authenticated `/api/blogs` and `/api/blogs/` locations; the contact endpoint should retain its separate 64k limit. Existing data is not rewritten in bulk. Unknown HTTPS image URLs remain unoptimized unless explicitly allowed by the existing ContentImage component.

## Categories

The admin dropdown loads saved records plus unique categories derived from existing blogs (draft or published). No fixed category list. Add New Category expands a keyboard-accessible inline fieldset with name, auto-generated editable slug, Cancel and Add actions. Existing names are reused case-insensitively; duplicate slugs select the existing category. Saved categories persist even before they have an article.

New MongoDB `categories` documents contain `_id`, `name`, normalized `nameKey`, `slug`, `createdAt`, `updatedAt`. Unique indexes on `nameKey` and `slug` are created on first category save. Atomic upsert plus duplicate-key retry handles concurrent creation. Ensure the database account can create indexes. Blog storage keeps compatible `category` text and `categorySlug`, with a `categoryId` string for saved records. Public routes still use categorySlug, not a join or ObjectId.

Existing string/object categories are read without a bulk migration. Their saved slugs are preserved when discovered. Selecting/saving an old category registers it in the collection as needed; old articles do not need recreation. Existing legacy case variants with already-distinct custom slugs are not destructively rewritten. Category delete/edit management is not included.

Public categories still derive from published blogs, so empty saved categories and draft-only categories do not appear publicly or in the sitemap. Homepage receives lightweight card fields from **all published posts**, fixing the former first-three-post category restriction. All is first/default; filters use category slugs and preserve crawlable article/category links. Related posts remain published-only, same-category, exclude the current post and are limited to three.

## Editor and SEO

The editor keeps Tiptap, tags, feature toggle and publication flow, grouped into Main content, Organization, Images, SEO and Publication. SEO title/description counters (60/160) are guidance; existing 180/320 safety limits remain. No meta keywords UI/tag was introduced.

- SEO title → blog title.
- Meta description → excerpt.
- Social title → SEO title → blog title.
- Social description → meta description → excerpt.
- Social image → cover → branded default.

Search/social previews update with title, description, category, slug and image changes. They are illustrative, not guaranteed platform renderings. Canonical, OG URL, author, dates and schemas remain automatic. Editing a saved article title does not regenerate its slug. Manual slug changes are still possible and require care: no historical slug-alias migration is added. Duplicate slugs on edit return 409. Preview displays the last saved content; save draft before previewing unsaved changes.

## Verification

```sh
node --test tests/blog-fields.test.mjs
npm run lint
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example npm run build
```

`scripts/check-blog-integration.mjs` is an **isolated local integration test**, not a production migration. It connects only to loopback, clears the fixed `portfolio_contact_blog_test` database, creates a test admin and fixtures, and tests authenticated save/edit, category concurrency/persistence, legacy compatibility, image endpoints/fallbacks, unfeaturing, homepage categories, drafts and sitemap. Start a dedicated temporary MongoDB on port 27029 and the app on port 3100 using that test database; never run it against a real database with that name. The script leaves fixtures for browser checks. Stop/remove the temporary database after testing.

Browser acceptance: upload distinct cover/portrait/social images, mark Featured, save and verify /blog vs detail vs OG; remove featured/social and verify fallbacks; unfeature/re-enable and verify preservation; create a category then load a new editor; verify case variants reuse it; filter homepage across more than three posts; resize 320/375/768/1024/1440; verify full images, alt text and mobile editor/previews. Check social sharing after deployment against real publicly accessible images.

## Implementation verification (2026-09-27)

Three image/merge validation tests and the isolated MongoDB/API integration check passed. Chrome verified category persistence, image uploads, saved slug stability, homepage filters, and complete featured/detail images at 375/768/1440 widths without page errors. Lint and production build passed; this is a JavaScript project with no separate TypeScript check configured. Existing Edge Runtime deprecation warnings remain in the default OG generator. Production SEO smoke tests passed on 11 fallback-data public pages, including contact.
