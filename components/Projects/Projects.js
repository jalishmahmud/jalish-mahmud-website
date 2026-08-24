import SectionHeader from "@/components/SectionHeader/SectionHeader";
import styles from "./Projects.module.css";

const projects = [
  [
    "KriyaKarak",
    "Developed core pages (Home, Feed, Seller, Pricing, NFC, Search) using HTML, Vanilla CSS, and Next.js. Integrated Bangla/English multi-language support, REST APIs, and SEO meta tags.",
    "https://kriyakarak.com/",
  ],
  [
    "Mapage",
    "Created responsive landing page layouts from Figma using Next.js and Styled Components. Built beautician portfolio templates with fast loading speeds and API integration.",
    "https://mapage.net/stylist/landing-page",
  ],
  [
    "Leclair",
    "Resolved multi-device responsive design bugs and refactored legacy React class components into modern, reusable functional components to boost code maintainability.",
    "https://leclair.co.jp",
  ],
];

export default function Projects() {
  return (
    <section className="container" id="projects">
      <SectionHeader
        title="Featured Projects"
        subtitle="Selected works demonstrating full stack engineering & performance optimization"
      />
      <div className={styles.grid}>
        {projects.map(([name, description, href]) => (
          <article className={styles.card} key={name}>
            <h3>
              {name}
              <span>↗</span>
            </h3>
            <strong>ShellBeeHaken Ltd.</strong>
            <p>{description}</p>
            <a href={href} target="_blank" rel="noreferrer">
              Visit Website <span>›</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
