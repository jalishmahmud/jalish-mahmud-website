import Link from "next/link";
import AdminShell from "@/components/AdminShell/AdminShell";
import { getAdminBlogs } from "@/lib/blog";
import BlogActions from "@/components/BlogActions/BlogActions";
import styles from "./page.module.css";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Blogs | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function BlogsPage() {
  if (!(await getSession())) redirect("/admin/login");
  const blogs = await getAdminBlogs();
  return <AdminShell title="Blogs" action={<Link className="btn btnPrimary" href="/admin/blogs/new">+ New blog</Link>}>
    <div className={styles.table}>
      {blogs.map((blog) => <div className={styles.row} key={blog._id.toString()}><div className={styles.title}><strong>{blog.title}</strong><span>{blog.category} · {new Date(blog.updatedAt).toLocaleDateString()}</span></div><span className={blog.status === "published" ? styles.published : styles.draft}>{blog.status}</span><BlogActions id={blog._id.toString()} slug={blog.slug} category={blog.category} status={blog.status} /></div>)}
      {!blogs.length && <div className={styles.empty}><h2>No blogs yet.</h2><p>Create your first article to start publishing.</p><Link className="btn btnPrimary" href="/admin/blogs/new">Create blog</Link></div>}
    </div>
  </AdminShell>;
}
