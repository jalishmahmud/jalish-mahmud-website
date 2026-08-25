"use client";

import { useEffect, useState } from "react";
import data from "@/data/hero.json";
import styles from "./Hero.module.css";

export default function Typewriter() {
  const [text, setText] = useState(data.typewriterParts.map(() => ""));
  const [partIndex, setPartIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (partIndex >= data.typewriterParts.length) return undefined;
    const timer = setTimeout(
      () => {
        setText((current) =>
          current.map((value, index) =>
            index === partIndex
              ? value + data.typewriterParts[partIndex][0][charIndex]
              : value,
          ),
        );
        if (charIndex + 1 >= data.typewriterParts[partIndex][0].length) {
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
        <span className={styles[data.typewriterParts[index][1]]} key={index}>
          {value}
        </span>
      ))}
      <span className={styles.cursor} aria-hidden="true">
        &nbsp;
      </span>
    </>
  );
}
