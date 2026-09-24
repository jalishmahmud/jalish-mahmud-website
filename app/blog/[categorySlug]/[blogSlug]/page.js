import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import BlogShare from "@/components/BlogShare/BlogShare";
import { getPublishedBlogByCategoryAndSlug, getRelatedBlogs } from "@/lib/blog";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";
import { cleanText, siteUrl } from "@/lib/utils";
import styles from "../../[slug]/page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { categorySlug, blogSlug } = await params;
  const post = await getPublishedBlogByCategoryAndSlug(categorySlug, blogSlug);
  if (!post) return {};
  const blogUrl = siteUrl(`/blog/${post.categorySlug}/${post.slug}`);
  const title = post.seo?.title || post.title;
  const description = cleanText(post.seo?.description || post.excerpt);
  const ogTitle = post.seo?.ogTitle || post.seo?.title || post.title;
  const ogDescription = cleanText(post.seo?.ogDescription || post.seo?.description || post.excerpt);
  const ogImage = post.seo?.ogImage || post.image || siteUrl("/api/og/default");
  const publishedTime = post.publishedAt ? new Date(post.publishedAt).toISOString() : post.date ? new Date(post.date).toISOString() : undefined;
  const modifiedTime = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedTime;
  return { title, description, keywords: post.seo?.keywords || post.tags, alternates: { canonical: blogUrl }, openGraph: { title: ogTitle, description: ogDescription, url: blogUrl, type: "article", siteName: "Jalish Mahmud", images: [{ url: ogImage, alt: ogTitle }], publishedTime, modifiedTime, authors: ["Jalish Mahmud"] }, twitter: { card: "summary_large_image", title: ogTitle, description: ogDescription, images: [ogImage] } };
}

export default async function BlogPost({ params }) {
  const { categorySlug, blogSlug } = await params;
  if (categorySlug !== categorySlug.toLowerCase()) redirect(`/blog/${categorySlug.toLowerCase()}/${blogSlug}`);
  const post = await getPublishedBlogByCategoryAndSlug(categorySlug, blogSlug);
  if (!post) notFound();
  const related = await getRelatedBlogs(post);
  const blogUrl = siteUrl(`/blog/${post.categorySlug}/${post.slug}`);
  const socialImage = post.seo?.ogImage || post.image || siteUrl("/api/og/default");
  const publishedTime = post.publishedAt ? new Date(post.publishedAt).toISOString() : post.date ? new Date(post.date).toISOString() : undefined;
  const modifiedTime = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedTime;
  const structuredData = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: cleanText(post.excerpt), image: [socialImage], author: { "@type": "Person", name: "Jalish Mahmud" }, datePublished: publishedTime, dateModified: modifiedTime, mainEntityOfPage: { "@type": "WebPage", "@id": blogUrl } };
  const breadcrumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Blog", item: siteUrl("/blog") }, { "@type": "ListItem", position: 2, name: post.category, item: siteUrl(getCategoryUrl(post.categorySlug)) }, { "@type": "ListItem", position: 3, name: post.title, item: blogUrl }] };
  return <><Header /><main className="container"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} /><article className={styles.article}><div className={styles.breadcrumbs}><Link href="/blog">Blog</Link><span>›</span><Link href={getCategoryUrl(post.categorySlug)}>{post.category}</Link><span>›</span><span>{post.title}</span></div><div className={styles.meta}><Link href={getCategoryUrl(post.categorySlug)}>{post.category}</Link><time dateTime={post.date}>{post.date} · {post.readTime}</time></div><h1>{post.title}</h1><img src={post.image} alt={post.title} className={styles.image} /><p className={styles.excerpt}>{post.excerpt}</p><div className={styles.content} dangerouslySetInnerHTML={{ __html: post.contentHtml || (Array.isArray(post.content) ? post.content.map((paragraph) => `<p>${paragraph}</p>`).join("") : post.content) }} /><BlogShare title={post.title} url={blogUrl} />{related.length > 0 && <section className={styles.related}><h2>Related {post.category} Articles</h2><div className={styles.relatedGrid}>{related.map((item) => <Link key={item.slug} href={getBlogUrl(item)}><strong>{item.title}</strong><span>{item.category} · {item.readTime}</span></Link>)}</div></section>}</article></main><Footer /></>;
}
