import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { getBlogBySlug, getPublishedBlogs, getRelatedBlogs } from "@/lib/blog";
import { siteUrl } from "@/lib/utils";
import BlogShare from "@/components/BlogShare/BlogShare";

export const dynamic = "force-dynamic";
import styles from "./page.module.css";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  return post
    ? { title: post.seo?.title || `${post.title} | Jalish Mahmud`, description: post.seo?.description || post.excerpt, alternates: { canonical: siteUrl(`/blog/${post.slug}`) }, openGraph: { title: post.seo?.ogTitle || post.title, description: post.seo?.ogDescription || post.excerpt, url: siteUrl(`/blog/${post.slug}`), type: "article", images: [{ url: post.seo?.ogImage || post.coverImage || post.image }] }, twitter: { card: "summary_large_image", title: post.seo?.ogTitle || post.title, description: post.seo?.ogDescription || post.excerpt, images: [post.seo?.ogImage || post.coverImage || post.image] } }
    : {};
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedBlogs(post);

  return (
    <>
      <Header />
      <main className="container">
        <article className={styles.article}>
          <Link href="/#blog" className={styles.back}>
            ← Back to blog
          </Link>
          <div className={styles.meta}>
            <span>{post.category}</span>
            <time dateTime={post.date}>
              {post.date} · {post.readTime}
            </time>
          </div>
          <h1>{post.title}</h1>
          <img src={post.image} alt={post.title} className={styles.image} />
          <p className={styles.excerpt}>{post.excerpt}</p>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: post.contentHtml || (Array.isArray(post.content) ? post.content.map((paragraph) => `<p>${paragraph}</p>`).join("") : post.content) }} />
          <BlogShare title={post.title} />
          {related.length > 0 && <section className={styles.related}><h2>Related Articles</h2><div className={styles.relatedGrid}>{related.map((item) => <Link key={item.slug} href={`/blog/${item.slug}`}><strong>{item.title}</strong><span>{item.category} · {item.readTime}</span></Link>)}</div></section>}
        </article>
      </main>
      <Footer />
    </>
  );
}
