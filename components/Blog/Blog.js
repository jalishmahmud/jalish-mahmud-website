"use client";

import { useState } from "react";
import ContentImage from "@/components/ContentImage/ContentImage";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";
import styles from "./Blog.module.css";

export default function Blog({ posts = [] }) {
  const [activeCategory, setActiveCategory] = useState("");
  const categories = [{ name: "All", slug: "" }, ...new Map(posts.map((post) => [post.categorySlug, { name: post.category, slug: post.categorySlug }])).values()];
  const filteredPosts =
    activeCategory === ""
      ? posts
      : posts.filter((post) => post.categorySlug === activeCategory);

  return (
    <section className="container" id="blog">
      <SectionHeader
        title="Latest From The Blog"
        subtitle="Notes on frontend engineering, AWS deployment, CI/CD, product development, and design"
      />
      <div
        className={styles.tabs}
        role="group"
        aria-label="Filter blog posts"
      >
        {categories.map((category) => (
          <button
            className={
              activeCategory === category.slug ? styles.activeTab : styles.tab
            }
            key={category.slug}
            type="button"
            aria-pressed={activeCategory === category.slug}
            onClick={() => setActiveCategory(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {filteredPosts.slice(0, 3).map((post) => (
          <article className={styles.card} key={post.slug}>
            <Link
              href={getBlogUrl(post)}
              className={styles.imageLink}
              aria-label={`Read ${post.title}`}
            >
              <ContentImage src={post.coverImage} alt={post.imageAlt || `Cover for ${post.title}`} className={styles.image} />
            </Link>
            <div className={styles.meta}>
              <Link href={getCategoryUrl(post.categorySlug)}>{post.category}</Link>
              <time dateTime={post.date}>{post.date}</time>
            </div>
            <h3><Link href={getBlogUrl(post)}>{post.title}</Link></h3>
            <p>{post.excerpt}</p>
            <Link href={getBlogUrl(post)} className={styles.link} aria-label={`Read ${post.title}`}>
              Read Article <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>
      <div className={styles.viewAll}><Link href="/blog" className="btn btnOutline">View All Blogs →</Link></div>
    </section>
  );
}
