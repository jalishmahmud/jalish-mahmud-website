import SectionHeader from "@/components/SectionHeader/SectionHeader";
import jobs from "@/data/experience.json";
import styles from "./Experience.module.css";

export default function Experience() {
  return (
    <section className="container" id="experience">
      <SectionHeader
        title="Work History"
        subtitle="My professional journey and career progression"
      />
      <div className={styles.timeline}>
        {jobs.map(([company, role, dates, location, duties, roles]) => (
          <article className={styles.item} key={company}>
            <div className={styles.dot} />
            <div className={styles.content}>
              <h3>{company}</h3>
              <div className={styles.meta}>
                <strong>{role}</strong>
                <span>{dates}</span>
              </div>
              <p className={styles.location}>{location}</p>
              {roles && (
                <div className={styles.roles}>
                  {roles.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              )}
              <ul>
                {duties.map((duty) => (
                  <li key={duty}>{duty}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
