export const COLOR_KEY = "theme";
export const DESIGN_KEY = "design";
export const DESIGN_STYLESHEET = "/design-v2.css";

export function readPreference(name, fallback) {
  if (typeof document === "undefined") return fallback;
  return document.documentElement.dataset[name] || fallback;
}

export function setPreference(name, value, storageKey) {
  document.documentElement.dataset[name] = value;
  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    // Browsers may disallow storage; the active page still changes design.
  }
  window.dispatchEvent(new Event("site-preferences-change"));
}

export function ensureV2Stylesheet() {
  const existing = document.getElementById("design-v2-styles");
  if (existing?.dataset.loaded === "true") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = existing || document.createElement("link");
    link.addEventListener("load", () => {
      link.dataset.loaded = "true";
      resolve();
    }, { once: true });
    link.addEventListener("error", (error) => {
      link.remove();
      reject(error);
    }, { once: true });
    if (!existing) {
      link.id = "design-v2-styles";
      link.rel = "stylesheet";
      link.href = DESIGN_STYLESHEET;
      document.head.appendChild(link);
    }
  });
}
