import { FaArrowRight, FaEnvelope, FaGithub, FaLinkedinIn, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import Typewriter from "./Typewriter";
import styles from "./Hero.module.css";
import data from "@/data/hero.json";

export default function Hero() {
  return (
    <section className={`${styles.hero} container`} id="about">
      <div>
        <div className={styles.badge}>
          <span />
          {data.availability}
        </div>
        <h1>
          <Typewriter />
        </h1>
        <p className={styles.description}>
          {data.description}
        </p>
        <div className={styles.buttons}>
          <a href={`mailto:${data.contactEmail}`} className="btn btnPrimary">
            Get in Touch <FaArrowRight aria-hidden="true" />
          </a>
          <a
            href={data.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btnOutline"
          >
            <FaGithub aria-hidden="true" /> GitHub
          </a>
        </div>
        <div className={styles.contactInfo}>
          <span><FaPhone aria-hidden="true" /> {data.phone}</span>
          <span><FaEnvelope aria-hidden="true" /> {data.contactEmail}</span>
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
          href={data.linkedinUrl}
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
