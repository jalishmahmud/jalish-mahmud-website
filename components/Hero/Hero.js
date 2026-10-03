import { FaArrowRight, FaEnvelope, FaGithub, FaLinkedinIn, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import Link from "next/link";
import Typewriter from "./Typewriter";
import { siteConfig } from "@/lib/site-config";
import baseStyles from "./Hero.module.css";
import { withDesignStyles } from "@/lib/design-styles";
const styles = withDesignStyles(baseStyles, "Hero");
import data from "@/data/hero.json";
import { links } from "@/utils/links";

export default function Hero() {
  return (
    <section className={`${styles.hero} container`} id="about">
      <div>
        <div className={styles.badge}>
          <span />
          {data.availability}
        </div>
        <h1>
          <span className={styles.fixedTitle}>{data.typewriterPrefix}</span>
          <Typewriter />
        </h1>
        <p className={styles.description}>
          I’m {siteConfig.fullName}, a {siteConfig.jobTitle} based in {siteConfig.location}. I build web applications with React, Next.js and TypeScript, integrate APIs, and deploy applications on AWS EC2 with GitHub Actions CI/CD.
        </p>
        <div className={styles.buttons}>
          <Link href="/contact" className="btn btnPrimary">
            Get in Touch <FaArrowRight aria-hidden="true" />
          </Link>
          <a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            className="btn btnOutline"
          >
            <FaGithub aria-hidden="true" /> GitHub
          </a>
        </div>
        <div className={styles.contactInfo}>
          <span><FaPhone aria-hidden="true" /> {data.phone}</span>
          <span><FaEnvelope aria-hidden="true" /> {data.email}</span>
          <span><FaMapMarkerAlt aria-hidden="true" /> {data.location}</span>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <strong>{data.overviewTitle}</strong>
          <span>{data.overviewSubtitle}</span>
        </div>
        <div className={styles.stats}>
          {data.stats.map(([value, label, color]) => (
            <div className={`${styles.stat} ${styles[color]}`} key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <a
          href={links.linkedin}
          target="_blank"
          rel="noreferrer"
          className="btn btnOutline fullWidth"
        >
          <FaLinkedinIn aria-hidden="true" /> Connect on LinkedIn
        </a>
      </div>
    </section>
  );
}
