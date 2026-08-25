"use client";

import { useState } from "react";
import eventData from "@/data/experience-events.json";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import styles from "./Gallery.module.css";

const galleryPhotos = eventData.flatMap((company) =>
  company.events.flatMap((event) =>
    event.photos.map((photo) => ({
      ...photo,
      company: company.company,
      event: event.name,
    })),
  ),
);

const filters = ["All", ...eventData.map((company) => company.company)];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("All");
  const visiblePhotos =
    activeFilter === "All"
      ? galleryPhotos
      : galleryPhotos.filter((photo) => photo.company === activeFilter);

  return (
    <section className="container" id="gallery">
      <SectionHeader
        title="Life Outside The Code"
        subtitle="A few moments from the teams, offices, and events along my journey"
      />
      <div className={styles.tabs} role="tablist" aria-label="Filter gallery photos">
        {filters.map((filter) => (
          <button
            className={activeFilter === filter ? styles.activeTab : styles.tab}
            key={filter}
            type="button"
            role="tab"
            aria-selected={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {visiblePhotos.map((photo, index) => (
          <figure className={styles.item} key={`${photo.src}-${index}`}>
            <img src={photo.src} alt={photo.alt} className={styles.image} />
            <figcaption>
              <strong>{photo.event}</strong>
              <span>{photo.company}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
