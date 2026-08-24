"use client";

import { useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import posts from "@/data/blog.json";
import styles from "./Blog.module.css";

export default function Blog() {
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
              href={`/blog/${post.slug}`}
              className={styles.imageLink}
              aria-label={`Read ${post.title}`}
            >
              <img src={post.image} alt="" className={styles.image} />
            </Link>
            <div className={styles.meta}>
              <span>{post.category}</span>
              <time dateTime={post.date}>{post.date}</time>
            </div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className={styles.link}>
              Read Article <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
