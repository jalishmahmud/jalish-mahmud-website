"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import data from "@/data/hero.json";
import styles from "./Hero.module.css";

const motionPreference = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange) {
  const preference = window.matchMedia(motionPreference);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia(motionPreference).matches;
}

function serverMotionPreference() {
  return false;
}

export default function Typewriter() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, prefersReducedMotion, serverMotionPreference);
  const phraseParts = data.typewriterPhrases[phraseIndex];
  const phrase = phraseParts.map(([text]) => text).join("");

  useEffect(() => {
    if (reducedMotion) return undefined;
    const finished = charIndex === phrase.length;
    const empty = charIndex === 0;
    const delay = finished && !deleting ? 1800 : deleting ? 35 : empty ? 100 : 55;
    const timer = setTimeout(() => {
      if (finished && !deleting) {
        setDeleting(true);
      } else if (deleting && empty) {
        setDeleting(false);
        setPhraseIndex((current) => (current + 1) % data.typewriterPhrases.length);
      } else if (deleting) {
        setCharIndex((current) => current - 1);
      } else {
        setCharIndex((current) => current + 1);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [charIndex, deleting, phrase, phraseIndex, reducedMotion]);

  return (
    <span className={styles.typewriter}>
      <span className={styles.typewriterAccessible}>
        {data.typewriterPhrases[0].map(([part, color], index) => (
          <span className={color ? styles[color] : styles.typewriterText} key={index}>{part}</span>
        ))}
      </span>
      {/* Layout-only copies reserve each phrase's wrapped height at every width. */}
      {data.typewriterPhrases.map((parts, index) => (
        <span className={styles.typewriterSizer} aria-hidden="true" key={index}>
          {parts.map(([part, color], partIndex) => (
            <span className={color ? styles[color] : styles.typewriterText} key={partIndex}>{part}</span>
          ))}
          <span className={styles.cursor}>&nbsp;</span>
        </span>
      ))}
      <span className={styles.typewriterAnimated} aria-hidden="true">
        {phraseParts.map(([part, color], index) => {
          const start = phraseParts.slice(0, index).reduce((total, [value]) => total + value.length, 0);
          const visiblePart = part.slice(0, Math.max(0, Math.min(part.length, charIndex - start)));
          return <span className={color ? styles[color] : styles.typewriterText} key={part}>{visiblePart}</span>;
        })}
        <span className={styles.cursor}>&nbsp;</span>
      </span>
    </span>
  );
}
