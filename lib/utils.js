export function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/&/g, " ").replace(/[^\w\s-]/g, " ").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function readingTime(html = "") {
  return Math.max(1, Math.ceil(html.replace(/<[^>]+>/g, " ").replace(/&\w+;/g, " ").split(/\s+/).filter(Boolean).length / 200));
}

export function siteUrl(path = "") {
  return `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}${path}`;
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
