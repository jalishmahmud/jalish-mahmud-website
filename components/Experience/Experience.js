"use client";

import { useState } from "react";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import eventData from "@/data/experience-events.json";
import jobs from "@/data/experience.json";
import styles from "./Experience.module.css";

export default function Experience() {
  const [activeEvents, setActiveEvents] = useState({});

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
                {(() => {
                  const companyEvents = eventData.find(
                    (item) => item.company === company,
                  )?.events;
                  if (!companyEvents?.length) return null;
                  const activeIndex = activeEvents[company] ?? 0;
                  const activeEvent = companyEvents[activeIndex];

                  return (
                    <div className={styles.gallery}>
                      <div className={styles.galleryTabs} role="tablist">
                        {companyEvents.map((event, eventIndex) => (
                          <button
                            className={
                              eventIndex === activeIndex
                                ? styles.galleryTabActive
                                : styles.galleryTab
                            }
                            key={event.name}
                            type="button"
                            role="tab"
                            aria-selected={eventIndex === activeIndex}
                            onClick={() =>
                              setActiveEvents((current) => ({
                                ...current,
                                [company]: eventIndex,
                              }))
                            }
                          >
                            {event.name}
                          </button>
                        ))}
                      </div>
                      <div className={styles.galleryGrid}>
                        {activeEvent.photos.map((photo) => (
                          <img
                            key={photo.src}
                            src={photo.src}
                            alt={photo.alt}
                            className={styles.galleryImage}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
