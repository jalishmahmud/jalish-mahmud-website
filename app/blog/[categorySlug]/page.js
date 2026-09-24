import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { getBlogBySlug, getPublishedBlogsByCategory, getPublishedCategories } from "@/lib/blog";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";
import { siteUrl, cleanText } from "@/lib/utils";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { categorySlug } = await params;
  const category = (await getPublishedCategories()).find((item) => item.slug === categorySlug);
  if (!category) return {};
  const title = `${category.name} Articles | Jalish Mahmud`;
  const description = `Read the latest ${category.name} articles, tutorials, and development notes.`;
  return { title, description, alternates: { canonical: siteUrl(getCategoryUrl(category.slug)) }, openGraph: { title, description, url: siteUrl(getCategoryUrl(category.slug)), type: "website", siteName: "Jalish Mahmud", images: [{ url: siteUrl("/api/og/default"), alt: title }] }, twitter: { card: "summary_large_image", title, description, images: [siteUrl("/api/og/default")] } };
}

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params;
  if (categorySlug !== categorySlug.toLowerCase()) redirect(`/blog/${categorySlug.toLowerCase()}`);
  const categories = await getPublishedCategories();
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) {
    const legacyPost = await getBlogBySlug(categorySlug);
    if (legacyPost) permanentRedirect(getBlogUrl(legacyPost));
  }
  if (!category) notFound();
  const posts = await getPublishedBlogsByCategory(category.slug);
  const breadcrumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Blog", item: siteUrl("/blog") }, { "@type": "ListItem", position: 2, name: category.name, item: siteUrl(getCategoryUrl(category.slug)) }] };
  return <><Header /><main className="container"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} /><section className={styles.hero}><div className={styles.breadcrumbs}><Link href="/blog">Blog</Link><span>›</span><span>{category.name}</span></div><span className={styles.kicker}>Category</span><h1>{category.name}<br /><span>Articles.</span></h1><p>Explore articles, tutorials, and development notes about {category.name}.</p></section><section className={styles.latest}><div className={styles.heading}><div><span className={styles.kicker}>Latest writing</span><h2>{category.name} articles</h2></div><span>{posts.length} published articles</span></div><div className={styles.grid}>{posts.map((post) => <article key={post.slug}><Link href={getBlogUrl(post)}><img src={post.image} alt="" /></Link><div className={styles.meta}><Link href={getCategoryUrl(post.categorySlug)}>{post.category}</Link><time>{post.date} · {post.readTime}</time></div><h3><Link href={getBlogUrl(post)}>{post.title}</Link></h3><p>{cleanText(post.excerpt)}</p><Link className={styles.read} href={getBlogUrl(post)}>Read article →</Link></article>)}</div></section></main><Footer /></>;
}
