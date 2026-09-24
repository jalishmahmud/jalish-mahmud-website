export function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/&/g, " ").replace(/[^\w\s-]/g, " ").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function readingTime(html = "") {
  return Math.max(1, Math.ceil(html.replace(/<[^>]+>/g, " ").replace(/&\w+;/g, " ").split(/\s+/).filter(Boolean).length / 200));
}

export function siteUrl(path = "") {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("Set NEXT_PUBLIC_SITE_URL to the canonical HTTPS production origin before building or starting.");
  }
  const url = new URL(configured || "http://localhost:3000");
  const hostname = url.hostname;
  const internal = !hostname.includes(".") || /^[0-9.]+$/.test(hostname) || hostname.includes(":") || /\.(localhost|local|internal)$/.test(hostname);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      (process.env.NODE_ENV === "production" && (url.protocol !== "https:" || internal || url.port))) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a public HTTPS domain origin without credentials, path, query, port or fragment.");
  }
  return `${url.origin}${path}`;
}

export function absoluteUrl(value) {
  if (!value) return siteUrl();
  try {
    return new URL(value, siteUrl()).toString();
  } catch {
    return siteUrl();
  }
}

export function cleanText(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
