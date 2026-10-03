import SectionHeader from "@/components/SectionHeader/SectionHeader";
import { FaCloud, FaCode, FaServer, FaWrench } from "react-icons/fa";
import skills from "@/data/skills.json";
import baseStyles from "./Skills.module.css";
import { withDesignStyles } from "@/lib/design-styles";
const styles = withDesignStyles(baseStyles, "Skills");

const skillIcons = {
  frontend: FaCode,
  backend: FaServer,
  tools: FaWrench,
  devops: FaCloud,
};

export default function Skills() {
  return (
    <section className="container" id="skills">
      <SectionHeader
        title="Technical Expertise"
        subtitle="Technologies I use to build, integrate, deploy, and operate production applications"
      />
      <div className={styles.grid}>
        {skills.map(([iconKey, title, color, tags]) => {
          const Icon = skillIcons[iconKey];

          return (
          <article className={styles.card} key={title}>
            <div className={styles.heading}>
              <div className={`${styles.icon} ${styles[color]}`}>
                <Icon aria-hidden="true" />
              </div>
              <h3>{title}</h3>
            </div>
            <div className={styles.tags}>
              {tags.split(",").map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}
