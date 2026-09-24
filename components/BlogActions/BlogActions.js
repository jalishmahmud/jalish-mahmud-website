"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./BlogActions.module.css";
import { getBlogUrl } from "@/lib/blog-urls";
export default function BlogActions({ id, slug, category, status }) { const router = useRouter(); async function remove() { if (!window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return; await fetch(`/api/blogs/${id}`, { method: "DELETE" }); router.refresh(); } return <div className={styles.actions}><Link href={`/admin/blogs/${id}/edit`}>Edit</Link><Link href={status === "published" ? getBlogUrl({ slug, category }) : `/admin/blogs/${id}/preview`} target="_blank">Preview</Link><button onClick={remove}>Delete</button></div>; }
