import test from "node:test";
import assert from "node:assert/strict";
import { mergeBlogInput, storedSocialImage, imagePreviewSource } from "../lib/blog-fields.js";
import { parseBlogInput } from "../lib/validation.js";
import { decodeBlogImage } from "../lib/image-data.js";
import { blogSlugState } from "../lib/blog-slugs.js";
const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const post = { title: "Original article", slug: "original-article", category: "React", excerpt: "An excerpt with enough meaningful content.", content: "<p>Content</p>", coverImage: image, featuredImage: image, seo: { ogImage: image } };
test("partial edit preserves images and slug; explicit removals override legacy aliases", () => {
  const updated = parseBlogInput(mergeBlogInput(post, { title: "Changed title", featured: false }));
  assert.equal(updated.coverImage, image); assert.equal(updated.featuredImage, image); assert.equal(updated.socialImage, image); assert.equal(updated.slug, post.slug);
  const removed = parseBlogInput(mergeBlogInput(post, { coverImage: "", socialImage: "" }));
  assert.equal(removed.coverImage, ""); assert.equal(storedSocialImage(removed), "");
  assert.equal(storedSocialImage({ seo: { socialImage: image } }), image);
});
test("old image field and raw Base64 previews remain compatible", () => {
  assert.equal(mergeBlogInput({ image }, {}).coverImage, image);
  assert.equal(decodeBlogImage(image).mime, "image/png");
  assert.equal(imagePreviewSource(image.split(",")[1]), image);
  assert.equal(decodeBlogImage(image.replace("image/png", "image/jpeg")), null);
});
test("invalid image payloads and decoded sizes over 1.5 MB are rejected", () => {
  assert.throws(() => parseBlogInput({ ...post, coverImage: "data:text/html;base64,SGVsbG8=" }));
  const oversized = Buffer.alloc(1500001); Buffer.from("89504e470d0a1a0a", "hex").copy(oversized);
  assert.throws(() => parseBlogInput({ ...post, featuredImage: `data:image/png;base64,${oversized.toString("base64")}` }));
});
test("published URLs survive renames, draft edits, republishing and reverting a slug", () => {
  let article = { slug: "first-draft", status: "draft", ...blogSlugState({}, "first-draft", "draft") };
  const save = (slug, status) => { article = { ...article, ...blogSlugState(article, slug, status), slug, status }; };
  save("original", "published");
  assert.deepEqual(article.publishedSlugs, ["original"]);
  assert(!article.urlSlugs.includes("first-draft"));
  save("renamed", "published");
  save("renamed", "draft");
  save("unpublished-edit", "draft");
  save("final", "published");
  assert.deepEqual(article.publishedSlugs, ["original", "renamed", "final"]);
  assert(!article.urlSlugs.includes("unpublished-edit"));
  save("original", "published");
  assert.deepEqual(new Set(article.urlSlugs), new Set(["original", "renamed", "final"]));
});
test("legacy published slugs are retained and submitted URL history is ignored", () => {
  const legacy = { ...post, status: "published" };
  const input = parseBlogInput(mergeBlogInput(legacy, { slug: "new-article", publishedSlugs: ["stolen-url"], urlSlugs: ["stolen-url"] }));
  assert(!("publishedSlugs" in input));
  assert(!("urlSlugs" in input));
  assert.deepEqual(blogSlugState(legacy, input.slug, input.status).urlSlugs, ["new-article", "original-article"]);
  assert.deepEqual(blogSlugState({ ...legacy, status: "draft", publishedAt: new Date() }, "edited-draft", "draft").urlSlugs, ["edited-draft", "original-article"]);
});
