import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { getPublishedBlogs } from "@/lib/blog";
import styles from "./page.module.css";

export const metadata = { title: "Blog | Jalish Mahmud", description: "Notes on frontend engineering, product development, and design." };
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedBlogs();
  const featured = posts.find((post) => post.featured) || posts[0];
  return <><Header /><main className="container"><section className={styles.hero}><span className={styles.kicker}>The Blog</span><h1>Thoughts on building<br /><span>better software.</span></h1><p>Practical notes on frontend engineering, product development, and design from the workbench.</p></section>{featured && <Link href={`/blog/${featured.slug}`} className={styles.featured}><img src={featured.image} alt="" /><div><span>{featured.category} · {featured.readTime}</span><h2>{featured.title}</h2><p>{featured.excerpt}</p><b>Read featured article →</b></div></Link>}<section className={styles.latest}><div className={styles.heading}><div><span className={styles.kicker}>Latest writing</span><h2>More articles</h2></div><span>{posts.length} published articles</span></div><div className={styles.grid}>{posts.map((post) => <article key={post.slug}><Link href={`/blog/${post.slug}`}><img src={post.image} alt="" /></Link><div className={styles.meta}><span>{post.category}</span><time>{post.date} · {post.readTime}</time></div><h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.excerpt}</p><Link className={styles.read} href={`/blog/${post.slug}`}>Read article →</Link></article>)}</div></section></main><Footer /></>;
}
