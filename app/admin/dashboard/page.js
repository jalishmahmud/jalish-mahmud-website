import Link from "next/link";
import { getAdminBlogs } from "@/lib/blog";
import AdminShell from "@/components/AdminShell/AdminShell";
import styles from "./page.module.css";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  if (!(await getSession())) redirect("/admin/login");
  const blogs = await getAdminBlogs(); const published = blogs.filter((blog) => blog.status === "published");
  return <AdminShell title="Dashboard" action={<Link className="btn btnPrimary" href="/admin/blogs/new">+ New blog</Link>}><div className={styles.stats}><div><span>Total blogs</span><strong>{blogs.length}</strong></div><div><span>Published</span><strong>{published.length}</strong></div><div><span>Drafts</span><strong>{blogs.length - published.length}</strong></div><div><span>Featured</span><strong>{blogs.filter((blog) => blog.featured).length}</strong></div></div><section className={styles.recent}><div className={styles.sectionHead}><h2>Recently updated</h2><Link href="/admin/blogs">View all →</Link></div>{blogs.slice(0, 5).map((blog) => <div className={styles.row} key={blog._id.toString()}><div><strong>{blog.title}</strong><span>{blog.category} · {new Date(blog.updatedAt).toLocaleDateString()}</span></div><em className={blog.status === "published" ? styles.published : styles.draft}>{blog.status}</em></div>)}{!blogs.length && <p className={styles.empty}>No blogs yet. Create your first article to get started.</p>}</section></AdminShell>;
}
