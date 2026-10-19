import ContentImage from "@/components/ContentImage/ContentImage";
import { imagePreviewSource } from "@/lib/blog-fields";
import { getCategoryName } from "@/lib/blog-urls";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getBlogById, sanitizeContent } from "@/lib/blog";
import CodeCopyButtons from "@/components/CodeCopyButtons/CodeCopyButtons";
import articleStyles from "@/styles/article-content.module.css";
import styles from "./page.module.css";

export const metadata = { title: "Preview | Admin", robots: { index: false, follow: false } };
export default async function PreviewPage({ params }) {
  if (!(await getSession())) redirect("/admin/login");
  const { id } = await params;
  const blog = await getBlogById(id);
  if (!blog) notFound();
  const articleHtml = sanitizeContent(blog.contentHtml || (Array.isArray(blog.content) ? blog.content.map((paragraph) => `<p>${paragraph}</p>`).join("") : blog.content) || "");
  return <main className="container"><article className={styles.article}><Link href={`/admin/blogs/${id}/edit`}>← Back to editor</Link><span>{getCategoryName(blog.category)} · {blog.status}</span><h1>{blog.title}</h1>{(blog.coverImage || blog.image) && <ContentImage src={imagePreviewSource(blog.coverImage ?? blog.image)} alt={blog.imageAlt || `Cover for ${blog.title}`} style={{ width: "100%", height: "auto", aspectRatio: "1200 / 630", objectFit: "contain" }} />}<p className={styles.excerpt}>{blog.excerpt}</p><div className={`${styles.content} ${articleStyles.articleContent}`} data-code-copy-root dangerouslySetInnerHTML={{ __html: articleHtml }} />{/<pre(?:\s|>)/i.test(articleHtml) && <CodeCopyButtons slug={blog.slug} />}</article></main>;
}
