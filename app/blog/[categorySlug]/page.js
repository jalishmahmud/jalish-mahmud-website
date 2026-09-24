import ContentImage from "@/components/ContentImage/ContentImage";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { getBlogBySlug, getPublishedBlogsByCategory, getPublishedCategories } from "@/lib/blog";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";
import { cleanText } from "@/lib/utils";
import { buildPageMetadata, breadcrumbData, serializeJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

async function resolveCategory(params) {
  const { categorySlug } = await params;
  const normalized = categorySlug.toLowerCase();
  const category = (await getPublishedCategories()).find((item) => item.slug === normalized);
  if (!category) {
    const legacyPost = await getBlogBySlug(normalized);
    if (legacyPost) permanentRedirect(getBlogUrl(legacyPost));
    notFound();
  }
  if (categorySlug !== normalized) permanentRedirect(getCategoryUrl(category.slug));
  return category;
}

export async function generateMetadata({ params }) {
  const category = await resolveCategory(params);
  return buildPageMetadata({
    title: `${category.name} Articles`,
    description: `${category.name} articles, practical tutorials and development notes by ${siteConfig.fullName}.`,
    path: getCategoryUrl(category.slug),
  });
}

export default async function CategoryPage({ params }) {
  const category = await resolveCategory(params);
  const posts = await getPublishedBlogsByCategory(category.slug);
  const breadcrumbs = breadcrumbData([{ name: "Blog", path: "/blog" }, { name: category.name, path: getCategoryUrl(category.slug) }]);
  return <><Header /><main className="container"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }} /><section className={styles.hero}><nav aria-label="Breadcrumb" className={styles.breadcrumbs}><Link href="/">Home</Link><span>›</span><Link href="/blog">Blog</Link><span>›</span><span aria-current="page">{category.name}</span></nav><span className={styles.kicker}>Category</span><h1>{category.name}<br /><span>Articles.</span></h1><p>Explore articles, tutorials, and development notes about {category.name}.</p></section><section className={styles.latest}><div className={styles.heading}><div><span className={styles.kicker}>Latest writing</span><h2>{category.name} articles</h2></div><span>{posts.length} published articles</span></div><div className={styles.grid}>{posts.map((post) => <article key={post.slug}><Link href={getBlogUrl(post)}><ContentImage src={post.image} alt={post.imageAlt || `Cover for ${post.title}`} /></Link><div className={styles.meta}><Link href={getCategoryUrl(post.categorySlug)}>{post.category}</Link><time dateTime={post.date}>{post.date} · {post.readTime}</time></div><h3><Link href={getBlogUrl(post)}>{post.title}</Link></h3><p>{cleanText(post.excerpt)}</p><Link className={styles.read} href={getBlogUrl(post)}>Read article →</Link></article>)}</div></section></main><Footer /></>;
}
