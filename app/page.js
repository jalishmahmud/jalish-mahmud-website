import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Skills from "@/components/Skills/Skills";
import Experience from "@/components/Experience/Experience";
import Projects from "@/components/Projects/Projects";
import Education from "@/components/Education/Education";
import Blog from "@/components/Blog/Blog";
import Footer from "@/components/Footer/Footer";
import { getPublishedBlogs } from "@/lib/blog";

import { buildPageMetadata, homeStructuredData, serializeJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = { ...buildPageMetadata({ title: siteConfig.title, description: siteConfig.description, path: "/" }), title: { absolute: siteConfig.title } };

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPublishedBlogs();
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
        <Blog posts={posts.map(({ title, slug, category, categorySlug, excerpt, coverImage, imageAlt, date }) => ({ title, slug, category, categorySlug, excerpt, coverImage, imageAlt, date }))} />
      </main>
      <Footer />
    </>
  );
}
