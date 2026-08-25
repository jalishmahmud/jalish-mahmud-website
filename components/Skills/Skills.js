import SectionHeader from "@/components/SectionHeader/SectionHeader";
import styles from "./Skills.module.css";

const skills = [
  [
    "⌨",
    "Frontend Development",
    "green",
    "React.js,Next.js,Redux Toolkit,Tailwind CSS,TypeScript,JavaScript (ES6+),GSAP,HTML5 / CSS3,Sass",
  ],
  [
    "▣",
    "Backend & API",
    "amber",
    "Node.js,Express.js,MongoDB,PostgreSQL,.NET,Python (FastAPI),REST API,OAuth,JWT",
  ],
  [
    "⚒",
    "Tools & Workflow",
    "blue",
    "Git,Jira,Jest,Docker,WebSocket,Webpack,Babel,Figma,WordPress",
  ],
];

export default function Skills() {
  return (
    <section className="container" id="skills">
      <SectionHeader
        title="Technical Expertise"
        subtitle="Core technologies and tools I work with daily"
      />
      <div className={styles.grid}>
        {skills.map(([icon, title, color, tags]) => (
          <article className={styles.card} key={title}>
            <div className={styles.heading}>
              <div className={`${styles.icon} ${styles[color]}`}>{icon}</div>
              <h3>{title}</h3>
            </div>
            <div className={styles.tags}>
              {tags.split(",").map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
