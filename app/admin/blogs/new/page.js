import AdminShell from "@/components/AdminShell/AdminShell";
import BlogForm from "@/components/BlogForm/BlogForm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export const metadata = { title: "New blog | Admin", robots: { index: false, follow: false } };
export default async function NewBlogPage() { if (!(await getSession())) redirect("/admin/login"); return <AdminShell title="Create blog"><BlogForm /></AdminShell>; }
