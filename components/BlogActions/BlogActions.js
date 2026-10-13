"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./BlogActions.module.css";
import { getBlogUrl } from "@/lib/blog-urls";

export default function BlogActions({ id, slug, category, categorySlug, status }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      router.refresh();
    } catch {
      window.alert("Could not delete this article. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return <div className={styles.actions}>
    <Link href={`/admin/blogs/${id}/edit`}>Edit</Link>
    <Link href={status === "published" ? getBlogUrl({ slug, category, categorySlug }) : `/admin/blogs/${id}/preview`} target="_blank" rel="noopener noreferrer">Preview</Link>
    <button type="button" onClick={remove} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</button>
  </div>;
}
