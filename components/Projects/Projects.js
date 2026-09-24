import SectionHeader from "@/components/SectionHeader/SectionHeader";
import projects from "@/data/projects.json";
import styles from "./Projects.module.css";

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
            {href ? <a href={href} target="_blank" rel="noreferrer">
              Visit {name} <span>›</span>
            </a> : <span>Website currently unavailable</span>}
          </article>
        ))}
      </div>
    </section>
  );
}
