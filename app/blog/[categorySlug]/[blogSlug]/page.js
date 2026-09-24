import ContentImage from "@/components/ContentImage/ContentImage";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import BlogShare from "@/components/BlogShare/BlogShare";
import { getBlogBySlug, getRelatedBlogs, sanitizeContent } from "@/lib/blog";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";
import { cleanText, siteUrl } from "@/lib/utils";
import { buildPageMetadata, isoDate, serializeJsonLd, breadcrumbData, authorData } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import styles from "../../[slug]/page.module.css";

export const dynamic = "force-dynamic";

async function resolvePost(params) {
  const { categorySlug, blogSlug } = await params;
  const post = await getBlogBySlug(blogSlug.toLowerCase());
  if (!post) notFound();
  if (categorySlug !== post.categorySlug || blogSlug !== post.slug) permanentRedirect(getBlogUrl(post));
  return post;
}

export async function generateMetadata({ params }) {
  const post = await resolvePost(params);
  const publishedTime = isoDate(post.publishedAt || post.date);
  return buildPageMetadata({
    title: post.seo?.title?.trim() || post.title,
    description: post.seo?.description?.trim() || post.excerpt,
    path: getBlogUrl(post),
    ogTitle: post.seo?.ogTitle?.trim() || post.seo?.title?.trim() || post.title,
    ogDescription: post.seo?.ogDescription?.trim() || post.seo?.description?.trim() || post.excerpt,
    image: post.seo?.ogImage || post.image,
    article: { publishedTime, modifiedTime: isoDate(post.updatedAt) || publishedTime, authors: [siteUrl("/")], section: post.category, tags: post.tags },
  });
}

export default async function BlogPost({ params }) {
  const post = await resolvePost(params);
  const related = await getRelatedBlogs(post);
  const blogUrl = siteUrl(getBlogUrl(post));
  const socialImage = post.seo?.ogImage || post.image || siteUrl("/api/og/default");
  const publishedTime = isoDate(post.publishedAt || post.date);
  const modifiedTime = isoDate(post.updatedAt) || publishedTime;
  const structuredData = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: cleanText(post.seo?.description?.trim() || post.excerpt), image: [socialImage], author: authorData(), datePublished: publishedTime, dateModified: modifiedTime, keywords: post.tags, articleSection: post.category, mainEntityOfPage: { "@type": "WebPage", "@id": blogUrl } };
  const breadcrumbs = breadcrumbData([{ name: "Blog", path: "/blog" }, { name: post.category, path: getCategoryUrl(post.categorySlug) }, { name: post.title, path: getBlogUrl(post) }]);

  return <><Header /><main className="container"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }} /><article className={styles.article}><nav aria-label="Breadcrumb" className={styles.breadcrumbs}><Link href="/">Home</Link><span>›</span><Link href="/blog">Blog</Link><span>›</span><Link href={getCategoryUrl(post.categorySlug)}>{post.category}</Link><span>›</span><span aria-current="page">{post.title}</span></nav><div className={styles.meta}><Link href={getCategoryUrl(post.categorySlug)}>{post.category}</Link><Link href="/#about" rel="author">{siteConfig.fullName}</Link><time dateTime={publishedTime}>{post.date} · {post.readTime}</time></div><h1>{post.title}</h1><ContentImage src={post.image} alt={post.imageAlt || `Cover for ${post.title}`} loading="eager" className={styles.image} /><p className={styles.excerpt}>{post.excerpt}</p><div className={styles.content} dangerouslySetInnerHTML={{ __html: sanitizeContent(post.contentHtml || (Array.isArray(post.content) ? post.content.map((paragraph) => `<p>${paragraph}</p>`).join("") : post.content) || "") }} /><BlogShare title={post.title} url={blogUrl} />{related.length > 0 && <section className={styles.related}><h2>Related {post.category} Articles</h2><div className={styles.relatedGrid}>{related.map((item) => <Link key={item.slug} href={getBlogUrl(item)}><strong>{item.title}</strong><span>{item.category} · {item.readTime}</span></Link>)}</div></section>}</article></main><Footer /></>;
}
