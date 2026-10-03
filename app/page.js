import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Skills from "@/components/Skills/Skills";
import Experience from "@/components/Experience/Experience";
import Projects from "@/components/Projects/Projects";
import Education from "@/components/Education/Education";
import Blog from "@/components/Blog/Blog";
import Gallery from "@/components/Gallery/Gallery";
import Footer from "@/components/Footer/Footer";
import { getPublishedBlogs } from "@/lib/blog";

import { buildPageMetadata, homeStructuredData, serializeJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = { ...buildPageMetadata({ title: siteConfig.title, description: siteConfig.description, path: "/" }), title: { absolute: siteConfig.title } };

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPublishedBlogs();
  // Keep every published category while sending only the cards each tab can show.
  const categoryCounts = new Map();
  const previewPosts = posts.filter((post) => {
    const count = categoryCounts.get(post.categorySlug) || 0;
    categoryCounts.set(post.categorySlug, count + 1);
    return count < 3;
  });
  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(homeStructuredData()) }} />
        <Hero />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Blog posts={previewPosts.map(({ title, slug, category, categorySlug, excerpt, coverImage, imageAlt, date }) => ({ title, slug, category, categorySlug, excerpt, coverImage, imageAlt, date }))} />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}
