export function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function readingTime(html = "") {
  return Math.max(1, Math.ceil(html.replace(/<[^>]+>/g, " ").replace(/&\w+;/g, " ").split(/\s+/).filter(Boolean).length / 200));
}

export function siteUrl(path = "") {
  return `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}${path}`;
}
