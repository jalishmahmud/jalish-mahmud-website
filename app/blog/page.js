import ContentImage from "@/components/ContentImage/ContentImage";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { getPublishedBlogs } from "@/lib/blog";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";
import CategoryRows from "./CategoryRows";
import baseStyles from "./page.module.css";
import { withDesignStyles } from "@/lib/design-styles";
const styles = withDesignStyles(baseStyles, "blog-index");

import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = buildPageMetadata({ title: "Software Engineering Blog", description: `Articles by ${siteConfig.fullName} about React, Next.js, system design, APIs and deploying web applications on AWS.`, path: "/blog" });
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedBlogs();
  const featured = posts.find((post) => post.featured) || posts[0];
  const categories = [...posts.reduce((groups, post) => {
    const slug = post.categorySlug;
    if (!groups.has(slug)) groups.set(slug, { slug, name: post.category, posts: [] });
    groups.get(slug).posts.push({
      slug: post.slug, title: post.title, excerpt: post.excerpt,
      coverImage: post.coverImage, imageAlt: post.imageAlt,
      categorySlug: slug, date: post.date, readTime: post.readTime,
    });
    return groups;
  }, new Map()).values()];

  return <><Header /><main className="container">
    <section className={styles.hero}><span className={styles.kicker}>The Blog</span><h1>Thoughts on building<br /><span>better software.</span></h1><p>Practical notes on frontend engineering, AWS deployment, CI/CD, product development, and design from the workbench.</p></section>
    {featured && <div className={styles.featured}><Link prefetch={false} href={getBlogUrl(featured)} className={featured.featuredImage ? [styles.featuredImage, styles.featuredPortrait].join(" ") : styles.featuredImage}><ContentImage src={featured.featuredImage || featured.coverImage} width={featured.featuredImage ? 1250 : 1200} height={featured.featuredImage ? 1320 : 630} alt={(featured.featuredImage && featured.featuredImageAlt) || featured.imageAlt || `Cover for ${featured.title}`} loading="eager" fetchPriority="high" sizes="(max-width: 800px) 100vw, 550px" /></Link><div><Link className={styles.categoryLink} prefetch={false} href={getCategoryUrl(featured.categorySlug)}>{featured.category}</Link><span className={styles.featuredMeta}> · {featured.readTime}</span><h2><Link prefetch={false} href={getBlogUrl(featured)}>{featured.title}</Link></h2><p>{featured.excerpt}</p><Link className={styles.read} prefetch={false} href={getBlogUrl(featured)}>Read featured article →</Link></div></div>}
    <CategoryRows categories={categories} />
  </main><Footer /></>;
}
