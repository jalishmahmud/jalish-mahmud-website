import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import posts from "@/data/blog.json";
import styles from "./page.module.css";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  return post
    ? { title: `${post.title} | Jalish Mahmud`, description: post.excerpt }
    : {};
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="container">
        <article className={styles.article}>
          <Link href="/#blog" className={styles.back}>
            ← Back to blog
          </Link>
          <div className={styles.meta}>
            <span>{post.category}</span>
            <time dateTime={post.date}>
              {post.date} · {post.readTime}
            </time>
          </div>
          <h1>{post.title}</h1>
          <img src={post.image} alt="" className={styles.image} />
          <p className={styles.excerpt}>{post.excerpt}</p>
          <div className={styles.content}>
            {post.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
