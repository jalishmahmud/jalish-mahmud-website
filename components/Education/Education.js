import SectionHeader from "@/components/SectionHeader/SectionHeader";
import styles from "./Education.module.css";

const education = [
  ["♙", "Jagannath University", "Postgraduate & Bachelor's Degrees"],
  ["⌘", "NamasteDev", "Namaste React Certification"],
  ["文", "Duolingo, Inc.", "Duolingo English Test (DET)"],
];
export default function Education() {
  return (
    <section className="container">
      <SectionHeader title="Education & Certifications" />
      <div className={styles.grid}>
        {education.map(([icon, title, description]) => (
          <article className={styles.card} key={title}>
            <div className={styles.icon}>{icon}</div>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
