"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ContentImage from "@/components/ContentImage/ContentImage";
import { getBlogUrl, getCategoryUrl } from "@/lib/blog-urls";
import styles from "./CategoryRows.module.css";

function CategoryRow({ category }) {
  const headingId = useId();
  const trackRef = useRef(null);
  const [position, setPosition] = useState({ previous: false, next: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => setPosition({
      previous: track.scrollLeft > 1,
      next: track.scrollLeft + track.clientWidth < track.scrollWidth - 1,
    });
    update();
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [category.posts.length]);

  function move(direction) {
    const track = trackRef.current;
    const card = track?.firstElementChild;
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  }

  return <section className={styles.categorySection} aria-labelledby={headingId}>
    <div className={styles.rowHeader}>
      <div className={styles.rowTitle}>
        <h2 id={headingId}>{category.name}</h2>
        <span>{category.posts.length} {category.posts.length === 1 ? "article" : "articles"}</span>
      </div>
      <div className={styles.rowActions}>
        <Link className={styles.viewAll} prefetch={false} href={getCategoryUrl(category.slug)} aria-label={`View all ${category.name} articles`}>View all <FaArrowRight aria-hidden="true" /></Link>
        <div className={styles.controls} role="group" aria-label={`${category.name} article navigation`} hidden={!position.previous && !position.next}>
          <button type="button" onClick={() => move(-1)} disabled={!position.previous} aria-label={`Previous ${category.name} article`}><FaChevronLeft aria-hidden="true" /></button>
          <button type="button" onClick={() => move(1)} disabled={!position.next} aria-label={`Next ${category.name} article`}><FaChevronRight aria-hidden="true" /></button>
        </div>
      </div>
    </div>
    <div className={styles.track} ref={trackRef} role="group" aria-label={`${category.name} articles`}>
      {category.posts.map((post) => <article className={styles.card} key={post.slug}>
        <Link className={styles.cardImage} prefetch={false} href={getBlogUrl(post)}><ContentImage src={post.coverImage} alt={post.imageAlt || `Cover for ${post.title}`} sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 380px" /></Link>
        <div className={styles.cardBody}>
          <time dateTime={post.date}>{post.date} · {post.readTime}</time>
          <h3><Link prefetch={false} href={getBlogUrl(post)}>{post.title}</Link></h3>
          <p>{post.excerpt}</p>
          <Link className={styles.read} prefetch={false} href={getBlogUrl(post)}>Read article <FaArrowRight aria-hidden="true" /></Link>
        </div>
      </article>)}
    </div>
  </section>;
}

export default function CategoryRows({ categories }) {
  return <div className={styles.categories}>
    {categories.map((category) => <CategoryRow key={category.slug} category={category} />)}
  </div>;
}
