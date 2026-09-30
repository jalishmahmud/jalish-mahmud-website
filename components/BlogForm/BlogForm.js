"use client";
import ContentImage from "@/components/ContentImage/ContentImage";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify, siteUrl } from "@/lib/utils";
import { getCategoryName, getCategorySlug, getBlogUrl } from "@/lib/blog-urls";
import { storedSocialImage, imagePreviewSource } from "@/lib/blog-fields";
import { siteConfig } from "@/lib/site-config";
import ImageUpload from "./ImageUpload";
import CategorySelect from "./CategorySelect";
import styles from "./BlogForm.module.css";
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor/RichTextEditor"), { ssr: false });

const empty = { title: "", slug: "", excerpt: "", content: "<p>Start writing your article…</p>", coverImage: "", imageAlt: "", featuredImage: "", featuredImageAlt: "", socialImage: "", socialImageAlt: "", category: "", categorySlug: "", tags: [], featured: false, status: "draft", seo: { title: "", description: "", ogTitle: "", ogDescription: "" } };
function initialForm(initial) {
  if (!initial) return empty;
  return { ...empty, ...initial, category: getCategoryName(initial.category), categorySlug: initial.categorySlug || getCategorySlug(initial.category), coverImage: initial.coverImage ?? initial.image ?? "", socialImage: storedSocialImage(initial), seo: { ...empty.seo, ...initial.seo } };
}
export default function BlogForm({ initial, id }) {
  const router = useRouter();
  const [form, setForm] = useState(() => initialForm(initial));
  const [tagInput, setTagInput] = useState((initial?.tags || []).join(", "));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const saving = useRef(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setSeo = (key, value) => setForm((current) => ({ ...current, seo: { ...current.seo, [key]: value } }));
  async function submit(status) {
    if (saving.current) return;
    saving.current = true; setBusy(true); setMessage(""); setFailed(false);
    try {
      const payload = { ...form, status, slug: slugify(form.slug || form.title), tags: tagInput.split(",").map((tag) => tag.trim()).filter(Boolean), seo: { ...form.seo, ogImage: form.socialImage } };
      const response = await fetch(id ? `/api/blogs/${id}` : "/api/blogs", { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save blog.");
      setMessage(status === "published" ? "Blog published successfully." : "Draft saved successfully.");
      if (!id && data.id) router.replace(`/admin/blogs/${data.id}/edit`); else router.refresh();
    } catch (error) { setFailed(true); setMessage(error.message || "Unable to save blog. Please try again."); }
    finally { saving.current = false; setBusy(false); }
  }
  const searchTitle = form.seo.title.trim() || form.title || "Your article title";
  const description = form.seo.description.trim() || form.excerpt;
  const socialTitle = form.seo.ogTitle.trim() || searchTitle;
  const socialDescription = form.seo.ogDescription.trim() || description;
  const socialImage = form.socialImage || form.coverImage || siteConfig.defaultImage;
  const previewUrl = siteUrl(getBlogUrl({ ...form, categorySlug: form.categorySlug || "category", slug: form.slug || "article-slug" }));
  return <div className={styles.form}>
    <section><h2>Main content</h2>
      <label>Title<input required value={form.title} maxLength={180} onChange={(event) => { const title = event.target.value; setForm((current) => ({ ...current, title, ...(!id ? { slug: slugify(title) } : {}) })); }} placeholder="A clear, useful article title" /></label>
      <label>Slug<input value={form.slug} maxLength={180} onChange={(event) => set("slug", slugify(event.target.value))} /></label><p className={styles.help}>Keep published slugs stable. Changing one can break existing links.</p>
      <label>Excerpt<textarea required rows={3} value={form.excerpt} onChange={(event) => set("excerpt", event.target.value)} maxLength={320} /></label>
      <p className={styles.help}>Use descriptive H2/H3 headings and useful internal links. Add descriptions to informative images using Image alt text in the editor toolbar.</p>
      <RichTextEditor value={form.content} onChange={(value) => set("content", value)} />
    </section>
    <section><h2>Organization</h2><CategorySelect value={form.category} slug={form.categorySlug} onChange={(category) => setForm((current) => ({ ...current, category: category.name, categorySlug: category.slug, categoryId: category.id }))} />
      <label>Tags<input value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="React, JavaScript" /></label>
      <label className={styles.check}><input type="checkbox" checked={form.featured} onChange={(event) => set("featured", event.target.checked)} />Featured Article</label>
    </section>
    <section><h2>Images</h2>
      <ImageUpload label="Cover Image" value={form.coverImage} onChange={(value) => set("coverImage", value)} />
      <label>Cover Image Alt Text<input value={form.imageAlt} maxLength={250} onChange={(event) => set("imageAlt", event.target.value)} /></label><p className={styles.help}>Describe the image for accessibility and search engines.</p>
      {form.featured && <><ImageUpload label="Featured Article Image" value={form.featuredImage} onChange={(value) => set("featuredImage", value)} width={1250} height={1320} help="Used only for the featured article layout on the main Blog page. The article detail page continues using the normal Cover Image. Optional: falls back to the Cover Image." /><label>Featured Image Alt Text<input value={form.featuredImageAlt} maxLength={250} onChange={(event) => set("featuredImageAlt", event.target.value)} /></label><p className={styles.help}>If empty, Cover Image Alt Text is used. Unchecking Featured Article preserves this image.</p></>}
    </section>
    <section><h2>SEO</h2><div className={styles.columns}>
      <label>SEO Title<input value={form.seo.title} maxLength={180} onChange={(event) => setSeo("title", event.target.value)} /><span className={styles.help}>{form.seo.title.length} / 60 recommended. Aim for around 50–60 characters. If empty, the Blog Title is used.</span></label>
      <label>Meta Description<textarea value={form.seo.description} maxLength={320} onChange={(event) => setSeo("description", event.target.value)} /><span className={styles.help}>{form.seo.description.length} / 160 recommended. Aim for around 150–160 characters. If empty, the Blog Excerpt is used.</span></label>
      <label>Social Preview Title<input value={form.seo.ogTitle} maxLength={180} onChange={(event) => setSeo("ogTitle", event.target.value)} /><span className={styles.help}>Used for LinkedIn, Facebook, X and other previews. If empty, SEO Title or Blog Title is used.</span></label>
      <label>Social Preview Description<textarea value={form.seo.ogDescription} maxLength={320} onChange={(event) => setSeo("ogDescription", event.target.value)} /><span className={styles.help}>Used when sharing. If empty, Meta Description or Blog Excerpt is used.</span></label>
    </div><ImageUpload label="Custom Social Image" value={form.socialImage} onChange={(value) => set("socialImage", value)} help="Optional. Falls back to Cover Image, then the default website OG image. Featured Image is never used as the social fallback." />
      <label>Social Image Alt Text<input value={form.socialImageAlt} maxLength={250} onChange={(event) => set("socialImageAlt", event.target.value)} /></label><p className={styles.help}>Describe your custom social image. If no custom image is used, the cover image description is used instead.</p>
      <div className={styles.columns}><div className={styles.searchPreview}><h3>Search preview</h3><small>{previewUrl}</small><strong>{searchTitle} | {siteConfig.name}</strong><p>{description}</p></div><div className={styles.socialPreview}><h3>Social preview</h3><ContentImage src={imagePreviewSource(socialImage)} alt={form.socialImage ? form.socialImageAlt || "Social image preview" : form.imageAlt || "Social image preview"} className={styles.preview} /><strong>{socialTitle}</strong><p>{socialDescription}</p><small>{new URL(siteUrl()).hostname}</small></div></div><p className={styles.help}>Illustrative previews. Search engines and social platforms may display different text or crops.</p>
    </section>
    <section><h2>Publication</h2>{message && <p className={failed ? styles.error : styles.message} role={failed ? "alert" : "status"}>{message}</p>}<div className={styles.actions}><button className="btn btnOutline" type="button" disabled={busy} onClick={() => submit("draft")}>Save Draft</button>{id && <Link href={`/admin/blogs/${id}/preview`} className="btn btnOutline">Preview saved version</Link>}<button className="btn btnPrimary" type="button" disabled={busy} onClick={() => submit("published")}>{busy ? "Saving…" : "Publish"}</button></div></section>
  </div>;
}
