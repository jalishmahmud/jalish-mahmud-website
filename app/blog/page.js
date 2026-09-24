import ContentImage from "@/components/ContentImage/ContentImage";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { getPublishedBlogs } from "@/lib/blog";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";
import styles from "./page.module.css";

import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = buildPageMetadata({ title: "Software Engineering Blog", description: `Articles by ${siteConfig.fullName} about Next.js, frontend engineering, API integration, product development and UI design.`, path: "/blog" });
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedBlogs();
  const featured = posts.find((post) => post.featured) || posts[0];
  return <><Header /><main className="container"><section className={styles.hero}><span className={styles.kicker}>The Blog</span><h1>Thoughts on building<br /><span>better software.</span></h1><p>Practical notes on frontend engineering, product development, and design from the workbench.</p></section>{featured && <div className={styles.featured}><Link href={getBlogUrl(featured)} className={styles.featuredImage}><ContentImage src={featured.image} alt={featured.imageAlt || `Cover for ${featured.title}`} loading="eager" /></Link><div><Link className={styles.categoryLink} href={getCategoryUrl(featured.categorySlug)}>{featured.category}</Link><span className={styles.featuredMeta}> · {featured.readTime}</span><h2><Link href={getBlogUrl(featured)}>{featured.title}</Link></h2><p>{featured.excerpt}</p><Link className={styles.read} href={getBlogUrl(featured)}>Read featured article →</Link></div></div>}<section className={styles.latest}><div className={styles.heading}><div><span className={styles.kicker}>Latest writing</span><h2>More articles</h2></div><span>{posts.length} published articles</span></div><div className={styles.grid}>{posts.map((post) => <article key={post.slug}><Link href={getBlogUrl(post)}><ContentImage src={post.image} alt={post.imageAlt || `Cover for ${post.title}`} /></Link><div className={styles.meta}><Link href={getCategoryUrl(post.categorySlug)}>{post.category}</Link><time dateTime={post.date}>{post.date} · {post.readTime}</time></div><h3><Link href={getBlogUrl(post)}>{post.title}</Link></h3><p>{post.excerpt}</p><Link className={styles.read} href={getBlogUrl(post)}>Read article →</Link></article>)}</div></section></main><Footer /></>;
}
