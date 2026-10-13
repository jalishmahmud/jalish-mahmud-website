"use client";

import { useEffect, useRef } from "react";

export default function StickySidebarFrame({ children, className }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const measure = () => {
      sidebar.style.setProperty("--sidebar-height", `${Math.ceil(sidebar.getBoundingClientRect().height)}px`);
    };
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(sidebar);
    return () => observer.disconnect();
  }, []);

  return <aside ref={sidebarRef} className={className} aria-label="Blog navigation">{children}</aside>;
}
