import { notFound } from "next/navigation";
import AdminShell from "@/components/AdminShell/AdminShell";
import BlogForm from "@/components/BlogForm/BlogForm";
import { getBlogById } from "@/lib/blog";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export const metadata = { title: "Edit blog | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function EditBlogPage({ params }) { if (!(await getSession())) redirect("/admin/login"); const { id } = await params; const blog = await getBlogById(id); if (!blog) notFound(); const initial = { ...blog, _id: undefined, createdAt: undefined, updatedAt: undefined, publishedAt: undefined, content: blog.content || blog.contentHtml || "", seo: { title: "", description: "", keywords: [], ogTitle: "", ogDescription: "", ogImage: "", ...blog.seo } }; return <AdminShell title="Edit blog"><BlogForm initial={JSON.parse(JSON.stringify(initial))} id={id} /></AdminShell>; }
