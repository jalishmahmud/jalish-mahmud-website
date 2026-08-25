import SectionHeader from "@/components/SectionHeader/SectionHeader";
import styles from "./Experience.module.css";

const jobs = [
  [
    "JB Connect Ltd.",
    "Intermediate Software Engineer",
    "October 2025 – Present",
    "Banani, Dhaka, Bangladesh",
    [
      "Working with .NET, Python (FastAPI), and Nuxt.js, implementing features like Google Business Profile data scraping, Google Keyword Planner, Google Place Service, ChatGPT API, and Synup API for MEO tools.",
      "Refactoring and improving existing backend and frontend modules to enhance system performance.",
      "Debugging and resolving critical integration issues between systems, delivering stable feature releases.",
    ],
  ],
  [
    "ShellBeeHaken Ltd.",
    "Software Engineer - I",
    "August 2022 – September 2025",
    "Mirpur DOHS, Dhaka, Bangladesh",
    [
      "Developed responsive pixel-perfect Next.js and React Native applications from Figma designs.",
      "Integrated RESTful APIs using Node.js, Express.js, and MongoDB, optimizing backend and frontend performance.",
      "Managed complex application states using Redux Toolkit, implemented dual-language support, and mentored junior developers.",
    ],
    [
      "Software Engineer - I (Jan 25 – Sep 25)",
      "Associate Software Engineer (Jan 23 – Dec 24)",
      "Trainee React Developer (Aug 22 – Dec 22)",
    ],
  ],
  [
    "DataFairHosting Pty Ltd.",
    "WordPress Web Developer (Remote)",
    "August 2020 – July 2022",
    "Lakemba, NSW, Australia",
    [
      "Built and maintained WordPress-based eCommerce and corporate websites using themes and custom plugins.",
      "Fixed bugs, updated content, and designed graphics using Photoshop and Illustrator to boost engagement.",
    ],
  ],
  [
    "iFindCheaters LLC.",
    "UI/UX Designer (Remote)",
    "November 2016 – April 2020",
    "New Jersey, United States",
    [
      "Designed intuitive UI/UX structures for frontend and backend systems, improving overall application flow.",
      "Collaborated with remote product managers and developers to produce consistent UI mockups and prototypes.",
    ],
  ],
];

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
