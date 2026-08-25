import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Skills from "@/components/Skills/Skills";
import Experience from "@/components/Experience/Experience";
import Projects from "@/components/Projects/Projects";
import Education from "@/components/Education/Education";
import Blog from "@/components/Blog/Blog";
import Gallery from "@/components/Gallery/Gallery";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Blog />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}
