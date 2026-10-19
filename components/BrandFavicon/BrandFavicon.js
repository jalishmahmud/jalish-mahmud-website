"use client";

import { useEffect } from "react";
import { brandAssets } from "@/lib/brand-assets";

export default function BrandFavicon() {
  useEffect(() => {
    const originalUrls = new WeakMap();

    const sync = () => {
      const isV2 = document.documentElement.dataset.design === "v2";
      const links = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');

      for (const link of links) {
        if (!originalUrls.has(link)) originalUrls.set(link, link.getAttribute("href"));
        const variant = isV2 ? "v2" : "classic";
        const target = !isV2
          ? originalUrls.get(link)
          : link.rel === "apple-touch-icon"
            ? brandAssets.appleIcon[variant]
            : link.type === "image/png"
              ? brandAssets.iconPng[variant]
              : brandAssets.favicon[variant];
        if (target && link.getAttribute("href") !== target) link.setAttribute("href", target);
      }
    };

    const onStorage = () => queueMicrotask(sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.head, { childList: true, subtree: true });
    window.addEventListener("site-preferences-change", sync);
    window.addEventListener("storage", onStorage);
    sync();

    return () => {
      observer.disconnect();
      window.removeEventListener("site-preferences-change", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
