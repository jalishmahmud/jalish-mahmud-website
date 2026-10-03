"use client";

import { useState, useSyncExternalStore } from "react";
import { COLOR_KEY, DESIGN_KEY, ensureV2Stylesheet, readPreference, setPreference } from "@/lib/theme-preferences";
import { withDesignStyles } from "@/lib/design-styles";
import baseStyles from "./ThemeToggle.module.css";

const styles = withDesignStyles(baseStyles, "ThemeToggle");
const getColor = () => readPreference("theme", "dark");
const getDesign = () => readPreference("design", "classic");
const serverColor = () => "dark";
const serverDesign = () => "classic";

function subscribe(callback) {
  const onStorage = (event) => {
    if (event.key === COLOR_KEY && (event.newValue === "light" || event.newValue === "dark")) {
      document.documentElement.dataset.theme = event.newValue;
    }
    if (event.key === DESIGN_KEY && (event.newValue === "classic" || event.newValue === "v2")) {
      if (event.newValue === "v2") {
        ensureV2Stylesheet().then(() => {
          document.documentElement.dataset.design = "v2";
          document.documentElement.dataset.designReady = "true";
          callback();
        }).catch(() => {});
      } else {
        document.documentElement.dataset.design = "classic";
      }
    }
    callback();
  };
  window.addEventListener("site-preferences-change", callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("site-preferences-change", callback);
    window.removeEventListener("storage", onStorage);
  };
}

export default function ThemeToggle() {
  const color = useSyncExternalStore(subscribe, getColor, serverColor);
  const design = useSyncExternalStore(subscribe, getDesign, serverDesign);
  const [loading, setLoading] = useState(false);

  const toggleDesign = async () => {
    if (loading) return;
    const next = getDesign() === "v2" ? "classic" : "v2";
    if (next === "v2") {
      setLoading(true);
      try {
        await ensureV2Stylesheet();
      } catch {
        setLoading(false);
        return;
      }
      document.documentElement.dataset.designReady = "true";
      setLoading(false);
    }
    setPreference("design", next, DESIGN_KEY);
  };

  return (
    <div className={styles.controls}>
      <button
        className={styles.button}
        type="button"
        aria-label={color === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={color === "dark" ? "Light mode" : "Dark mode"}
        onClick={() => setPreference("theme", getColor() === "dark" ? "light" : "dark", COLOR_KEY)}
      >
        <span aria-hidden="true">{color === "dark" ? "☼" : "☾"}</span>
      </button>
      <button
        className={styles.button}
        type="button"
        aria-label={design === "v2" ? "Switch to classic design" : "Switch to V2 design"}
        title={design === "v2" ? "Classic design" : "V2 design"}
        aria-pressed={design === "v2"}
        disabled={loading}
        onClick={toggleDesign}
      >
        <span aria-hidden="true">↻</span>
      </button>
    </div>
  );
}
