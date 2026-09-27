"use client";
import { useEffect, useId, useState } from "react";
import { slugify } from "@/lib/utils";
import styles from "./BlogForm.module.css";

export default function CategorySelect({ value, slug, onChange }) {
  const id = useId();
  const [categories, setCategories] = useState([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", slug: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/categories", { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error();
      setCategories(await response.json()); setError("");
    }).catch((error) => { if (error.name !== "AbortError") setError("Unable to load categories. Please retry."); });
    return () => controller.abort();
  }, [retry]);
  async function add() {
    if (!draft.name.trim() || !draft.slug) { setError("Add a category name and slug."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const category = await response.json();
      if (!response.ok) throw new Error(category.error || "Unable to save category.");
      setCategories((current) => [...current.filter((item) => item.slug !== category.slug && item.name.toLowerCase() !== category.name.toLowerCase()), category].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(category); setAdding(false); setDraft({ name: "", slug: "" });
    } catch (error) { setError(error.message || "Unable to save category."); }
    finally { setBusy(false); }
  }
  const options = value && !categories.some((item) => item.slug === slug) ? [{ name: value, slug }, ...categories] : categories;
  return <div className={styles.category}>
    <label htmlFor={id}>Category</label><select id={id} value={slug || ""} onChange={(event) => { const category = options.find((item) => item.slug === event.target.value); if (category) onChange(category); }}><option value="" disabled>Select a category</option>{options.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select>
    <button type="button" className="btn btnOutline" aria-expanded={adding} aria-controls={`${id}-new`} onClick={() => setAdding((value) => !value)}>+ Add New Category</button>
    {adding && <fieldset id={`${id}-new`} className={styles.categoryNew} disabled={busy}><legend>Add New Category</legend><label>Category Name<input value={draft.name} maxLength={60} onChange={(event) => setDraft({ name: event.target.value, slug: slugify(event.target.value) })} /></label><label>Slug<input value={draft.slug} maxLength={180} onChange={(event) => setDraft((current) => ({ ...current, slug: slugify(event.target.value) }))} /></label><div className={styles.actions}><button type="button" className="btn btnOutline" onClick={() => setAdding(false)}>Cancel</button><button type="button" className="btn btnPrimary" onClick={add}>{busy ? "Adding…" : "Add Category"}</button></div></fieldset>}
    {error && <div role="alert" className={styles.error}>{error} <button type="button" className="btn btnOutline" onClick={() => setRetry((value) => value + 1)}>Retry loading</button></div>}
  </div>;
}
