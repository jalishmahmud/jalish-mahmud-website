import Link from "next/link";
import StickySidebarFrame from "./StickySidebarFrame";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";
import { withDesignStyles } from "@/lib/design-styles";
import baseStyles from "./BlogSidebar.module.css";

const styles = withDesignStyles(baseStyles, "BlogSidebar");

export default function BlogSidebar({ posts, activeCategorySlug }) {
  const categories = [...new Map(posts.map((post) => [post.categorySlug, { name: post.category, slug: post.categorySlug }])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));
  const mostViewed = [...posts]
    .sort((a, b) => (b.views || 0) - (a.views || 0) || (b.date || "").localeCompare(a.date || ""))
    .slice(0, 5);

  return <StickySidebarFrame className={styles.sidebar}>
    <section className={styles.group}><h2>Categories</h2><nav aria-label="Article categories">{categories.map((category) => <Link key={category.slug} href={getCategoryUrl(category.slug)} prefetch={false} aria-current={category.slug === activeCategorySlug ? "page" : undefined}>{category.name}</Link>)}</nav></section>
    <section className={styles.group}><h2>Most viewed</h2><ol>{mostViewed.map((post) => <li key={post.slug}><Link href={getBlogUrl(post)} prefetch={false}>{post.title}</Link></li>)}</ol></section>
  </StickySidebarFrame>;
}
