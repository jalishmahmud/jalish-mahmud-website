"use client";

import { useState } from "react";
import ContentImage from "@/components/ContentImage/ContentImage";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";
import styles from "./Blog.module.css";

export default function Blog({ posts = [] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", ...new Set(posts.map((post) => post.category))];
  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  return (
    <section className="container" id="blog">
      <SectionHeader
        title="Latest From The Blog"
        subtitle="Notes on frontend engineering, product development, and design"
      />
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Filter blog posts"
      >
        {categories.map((category) => (
          <button
            className={
              activeCategory === category ? styles.activeTab : styles.tab
            }
            key={category}
            type="button"
            role="tab"
            aria-selected={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {filteredPosts.map((post) => (
          <article className={styles.card} key={post.slug}>
            <Link
              href={getBlogUrl(post)}
              className={styles.imageLink}
              aria-label={`Read ${post.title}`}
            >
              <ContentImage src={post.image} alt={post.imageAlt || `Cover for ${post.title}`} className={styles.image} />
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
