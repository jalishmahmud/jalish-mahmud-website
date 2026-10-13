import Link from "next/link";
import { getAdminBlogs } from "@/lib/blog";
import AdminShell from "@/components/AdminShell/AdminShell";
import DashboardTable from "./DashboardTable";
import styles from "./page.module.css";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.adminId || session.role !== "super-admin") redirect("/admin/login");
  const blogs = await getAdminBlogs();
  const published = blogs.filter((blog) => blog.status === "published");
  const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
  const articles = blogs.map((blog) => ({
    id: blog._id.toString(),
    title: blog.title,
    category: blog.category,
    categorySlug: blog.categorySlug,
    slug: blog.slug,
    status: blog.status,
    views: blog.views || 0,
    updatedAt: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : null,
  }));

  return <AdminShell title="Dashboard" action={<Link className="btn btnPrimary" href="/admin/blogs/new">+ New blog</Link>}>
    <div className={styles.stats}><div><span>Total blogs</span><strong>{blogs.length}</strong></div><div><span>Published</span><strong>{published.length}</strong></div><div><span>Drafts</span><strong>{blogs.length - published.length}</strong></div><div><span>Article views</span><strong>{totalViews.toLocaleString()}</strong></div></div>
    <DashboardTable articles={articles} />
  </AdminShell>;
}
