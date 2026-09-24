import { slugify } from "./utils";

export function getCategorySlug(category) {
  if (typeof category === "object" && category) return category.slug || slugify(category.name || "");
  return slugify(category || "");
}

export function getCategoryName(category) {
  if (typeof category === "object" && category) return category.name || category.slug || "";
  return category || "";
}

export function getCategoryUrl(category) {
  return `/blog/${getCategorySlug(category)}`;
}

export function getBlogUrl(blog) {
  const categorySlug = blog.categorySlug || getCategorySlug(blog.category);
  return `/blog/${categorySlug}/${blog.slug}`;
}
