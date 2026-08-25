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
        {jobs.map(([company, role, dates, location, duties, roles], index) => (
          <article
            className={`${styles.item} ${index % 2 === 0 ? styles.left : styles.right}`}
            key={company}
          >
            <span className={styles.year}>{dates.match(/\d{4}/)?.[0]}</span>
            <div className={styles.dot} />
            <time className={styles.date}>{dates}</time>
            <div className={styles.content} tabIndex="0">
              <h3>{company}</h3>
              <div className={styles.meta}>
                <strong>{role}</strong>
              </div>
              <div className={styles.details}>
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
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
