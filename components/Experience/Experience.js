"use client";

import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import eventData from "@/data/experience-events.json";
import jobs from "@/data/experience.json";
import styles from "./Experience.module.css";

export default function Experience() {
  const [activeEvents, setActiveEvents] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (!selectedPhoto) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedPhoto(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedPhoto]);

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
                        {activeEvent.photos.map((photo, photoIndex) => (
                          <button
                            key={photo.src}
                            type="button"
                            className={styles.galleryImageButton}
                            onClick={() =>
                              setSelectedPhoto({
                                company,
                                events: companyEvents,
                                eventIndex: activeIndex,
                                photoIndex,
                              })
                            }
                            aria-label={`View ${photo.alt}`}
                          >
                            <img
                              src={photo.src}
                              alt={photo.alt}
                              className={styles.galleryImage}
                            />
                          </button>
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
      {selectedPhoto && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="experience-photo-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Office Event</p>
                <h2 id="experience-photo-title">
                  {selectedPhoto.company} <span>·</span>{" "}
                  {selectedPhoto.events[selectedPhoto.eventIndex].name}
                </h2>
              </div>
              <button
                className={styles.closeButton}
                type="button"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Close photo viewer"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>
            <div className={styles.modalTabs} role="tablist" aria-label="Events">
              {selectedPhoto.events.map((event, eventIndex) => (
                <button
                  className={
                    eventIndex === selectedPhoto.eventIndex
                      ? styles.galleryTabActive
                      : styles.galleryTab
                  }
                  key={event.name}
                  type="button"
                  role="tab"
                  aria-selected={eventIndex === selectedPhoto.eventIndex}
                  onClick={() =>
                    setSelectedPhoto((current) => ({
                      ...current,
                      eventIndex,
                      photoIndex: 0,
                    }))
                  }
                >
                  {event.name}
                </button>
              ))}
            </div>
            <div className={styles.modalImageArea}>
              <button
                className={styles.modalNav}
                type="button"
                onClick={() =>
                  setSelectedPhoto((current) => ({
                    ...current,
                    photoIndex:
                      (current.photoIndex -
                        1 +
                        current.events[current.eventIndex].photos.length) %
                      current.events[current.eventIndex].photos.length,
                  }))
                }
                aria-label="Previous photo"
              >
                <FaChevronLeft aria-hidden="true" />
              </button>
              <img
                src={
                  selectedPhoto.events[selectedPhoto.eventIndex].photos[
                    selectedPhoto.photoIndex
                  ].src
                }
                alt={
                  selectedPhoto.events[selectedPhoto.eventIndex].photos[
                    selectedPhoto.photoIndex
                  ].alt
                }
                className={styles.modalImage}
              />
              <button
                className={styles.modalNav}
                type="button"
                onClick={() =>
                  setSelectedPhoto((current) => ({
                    ...current,
                    photoIndex:
                      (current.photoIndex + 1) %
                      current.events[current.eventIndex].photos.length,
                  }))
                }
                aria-label="Next photo"
              >
                <FaChevronRight aria-hidden="true" />
              </button>
            </div>
            <p className={styles.modalCounter}>
              {selectedPhoto.photoIndex + 1} /{" "}
              {selectedPhoto.events[selectedPhoto.eventIndex].photos.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
