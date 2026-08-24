import ClientOnly from "@/components/ClientOnly/ClientOnly";
import Typewriter from "./Typewriter";
import styles from "./Hero.module.css";

const stats = [
  ["5+ Yrs", "Full Stack Experience", "green"],
  ["4+", "Companies Worked With", "amber"],
  ["100%", "Scalable Systems", "blue"],
  ["Full Stack", "Capable Stack", "green"],
];

export default function Hero() {
  return (
    <section className={`${styles.hero} container`} id="about">
      <div>
        <div className={styles.badge}>
          <span />
          Available for Hire
        </div>
        <h1>
          <ClientOnly>
            <Typewriter />
          </ClientOnly>
        </h1>
        <p className={styles.description}>
          Full Stack Software Engineer with 5+ years of experience specializing
          in building scalable web apps, high-performance systems, RESTful API
          integrations, and modern UI/UX solutions.
        </p>
        <div className={styles.buttons}>
          <a href="mailto:jalish93@gmail.com" className="btn btnPrimary">
            Get in Touch <span>→</span>
          </a>
          <a
            href="https://github.com/jalish93"
            target="_blank"
            rel="noreferrer"
            className="btn btnOutline"
          >
            ◉ GitHub
          </a>
        </div>
        <div className={styles.contactInfo}>
          <span>⌕ (+88) 01847 791 304</span>
          <span>✉ jalish93@gmail.com</span>
          <span>⌖ Dhaka, Bangladesh</span>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <strong>Developer Overview</strong>
          <span>Summary of qualifications &amp; key metrics</span>
        </div>
        <div className={styles.stats}>
          {stats.map(([value, label, color]) => (
            <div className={`${styles.stat} ${styles[color]}`} key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noreferrer"
          className="btn btnOutline fullWidth"
        >
          in Connect on LinkedIn
        </a>
      </div>
    </section>
  );
}
