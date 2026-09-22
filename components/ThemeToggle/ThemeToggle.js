"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <button
      className={styles.button}
      type="button"
      aria-label="Toggle theme"
      onClick={() =>
        setTheme((current) => (current === "dark" ? "light" : "dark"))
      }
    >
      {theme === "dark" ? "☼" : "☀"}
    </button>
  );
}
