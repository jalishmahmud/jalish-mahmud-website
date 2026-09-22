"use client";

import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import galleryData from "@/data/gallery.json";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import styles from "./Gallery.module.css";

const PAGE_SIZE = 6;

const galleryPhotos = galleryData.flatMap((group) =>
  group.photos.map((photo) => ({
    ...photo,
    category: group.category,
  })),
);

const filters = ["All", ...galleryData.map((group) => group.category)];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Modal state is fully decoupled from the page tabs.
  const [modalCategory, setModalCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const visiblePhotos =
    activeFilter === "All"
      ? galleryPhotos
      : galleryPhotos.filter((photo) => photo.category === activeFilter);

  const modalPhotos =
    modalCategory === "All"
      ? galleryPhotos
      : galleryPhotos.filter((photo) => photo.category === modalCategory);

  const shownPhotos = visiblePhotos.slice(0, visibleCount);
  const hasMore = visibleCount < visiblePhotos.length;

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setVisibleCount(PAGE_SIZE);
  };

  const openPhoto = (photo) => {
    setModalCategory(activeFilter);
    setSelectedIndex(modalPhotos.findIndex((item) => item.src === photo.src));
  };
  const closePhoto = () => setSelectedIndex(null);

  const showPrev = () =>
    setSelectedIndex((index) => (index - 1 + modalPhotos.length) % modalPhotos.length);
  const showNext = () =>
    setSelectedIndex((index) => (index + 1) % modalPhotos.length);

  useEffect(() => {
    if (selectedIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closePhoto();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, modalPhotos.length]);

  const selectedPhoto = selectedIndex !== null ? modalPhotos[selectedIndex] : null;

  return (
    <section className="container" id="gallery">
      <SectionHeader
        title="Life Outside The Code"
        subtitle="A few moments from the places I've explored"
      />
      <div className={styles.tabs} role="tablist" aria-label="Filter gallery photos">
        {filters.map((filter) => (
          <button
            className={activeFilter === filter ? styles.activeTab : styles.tab}
            key={filter}
            type="button"
            role="tab"
            aria-selected={activeFilter === filter}
            onClick={() => handleFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {shownPhotos.map((photo, index) => (
          <figure className={styles.item} key={`${photo.src}-${index}`}>
            <button
              type="button"
              className={styles.imageButton}
              onClick={() => openPhoto(photo)}
              aria-label={`View ${photo.alt}`}
            >
              <img src={photo.src} alt={photo.alt} className={styles.image} />
            </button>
            <figcaption>
              <strong>{photo.category}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
      {hasMore && (
        <div className={styles.moreWrap}>
          <button
            className={styles.moreButton}
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            More
          </button>
        </div>
      )}
      {selectedPhoto && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={closePhoto}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-photo-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>{selectedPhoto.category}</p>
                <h2 id="gallery-photo-title">{selectedPhoto.alt}</h2>
              </div>
              <button
                className={styles.closeButton}
                type="button"
                onClick={closePhoto}
                aria-label="Close photo viewer"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>
            <div className={styles.modalTabs} role="tablist" aria-label="Categories">
              {filters.map((filter) => (
                <button
                  className={
                    modalCategory === filter ? styles.galleryTabActive : styles.galleryTab
                  }
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={modalCategory === filter}
                  onClick={() => {
                    setModalCategory(filter);
                    setSelectedIndex(0);
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className={styles.modalImageArea}>
              <button
                className={styles.modalNav}
                type="button"
                onClick={showPrev}
                aria-label="Previous photo"
              >
                <FaChevronLeft aria-hidden="true" />
              </button>
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                className={styles.modalImage}
              />
              <button
                className={styles.modalNav}
                type="button"
                onClick={showNext}
                aria-label="Next photo"
              >
                <FaChevronRight aria-hidden="true" />
              </button>
            </div>
            <p className={styles.modalCounter}>
              {selectedIndex + 1} / {modalPhotos.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
