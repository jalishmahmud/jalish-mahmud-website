"use client";

import { useEffect, useState } from "react";
import data from "@/data/hero.json";
import styles from "./Hero.module.css";

export default function Typewriter() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const phraseParts = data.typewriterPhrases[phraseIndex];
  const phrase = phraseParts.map(([text]) => text).join("");

  useEffect(() => {
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
  }, [charIndex, deleting, phrase, phraseIndex]);

  return (
    <>
      {phraseParts.map(([part, color], index) => {
        const start = phraseParts.slice(0, index).reduce((total, [value]) => total + value.length, 0);
        const visiblePart = part.slice(0, Math.max(0, Math.min(part.length, charIndex - start)));
        return <span className={color ? styles[color] : styles.typewriterText} key={part}>{visiblePart}</span>;
      })}
      <span className={styles.cursor} aria-hidden="true">&nbsp;</span>
    </>
  );
}
