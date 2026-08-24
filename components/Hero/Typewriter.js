"use client";

import { useEffect, useState } from "react";
import styles from "./Hero.module.css";

const parts = [
  ["Building Scalable Web Apps ", ""],
  ["With React", styles.green],
  [" & ", ""],
  ["Next.js", styles.amber],
];

export default function Typewriter() {
  const [text, setText] = useState(parts.map(() => ""));
  const [partIndex, setPartIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (partIndex >= parts.length) return undefined;
    const timer = setTimeout(
      () => {
        setText((current) =>
          current.map((value, index) =>
            index === partIndex
              ? value + parts[partIndex][0][charIndex]
              : value,
          ),
        );
        if (charIndex + 1 >= parts[partIndex][0].length) {
          setPartIndex((current) => current + 1);
          setCharIndex(0);
        } else {
          setCharIndex((current) => current + 1);
        }
      },
      charIndex === 0 ? 100 : 50,
    );
    return () => clearTimeout(timer);
  }, [partIndex, charIndex]);

  return (
    <>
      {text.map((value, index) => (
        <span className={parts[index][1]} key={index}>
          {value}
        </span>
      ))}
      <span className={styles.cursor} aria-hidden="true">
        &nbsp;
      </span>
    </>
  );
}
