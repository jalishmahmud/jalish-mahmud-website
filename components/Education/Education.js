import SectionHeader from "@/components/SectionHeader/SectionHeader";
import { FaLanguage, FaUniversity } from "react-icons/fa";
import education from "@/data/education.json";
import { SiReact } from "react-icons/si";
import styles from "./Education.module.css";

const educationIcons = {
  university: FaUniversity,
  react: SiReact,
  language: FaLanguage,
};

export default function Education() {
  return (
    <section className="container">
      <SectionHeader title="Education & Certifications" />
      <div className={styles.grid}>
        {education.map(([iconKey, title, description]) => {
          const Icon = educationIcons[iconKey];

          return (
          <article className={styles.card} key={title}>
            <div className={styles.icon}>
              <Icon aria-hidden="true" />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}
