"use client";

import { useEffect, useRef } from "react";

export default function BlogViewTracker({ id }) {
  const counted = useRef(false);

  useEffect(() => {
    if (!id || counted.current) return;
    counted.current = true;
    fetch(`/api/blog-views/${encodeURIComponent(id)}`, {
      method: "POST",
      cache: "no-store",
      keepalive: true,
    }).catch(() => {});
  }, [id]);

  return null;
}
