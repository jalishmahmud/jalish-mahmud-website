// Nullish checks deliberately preserve an explicit empty string (image removal).
export function storedSocialImage(post) {
  return post.socialImage ?? post.seo?.socialImage ?? post.seo?.ogImage ?? "";
}

export function mergeBlogInput(existing, input) {
  return {
    ...existing, ...input,
    coverImage: input.coverImage ?? existing.coverImage ?? existing.image ?? "",
    featuredImage: input.featuredImage ?? existing.featuredImage ?? "",
    socialImage: input.socialImage ?? input.seo?.socialImage ?? input.seo?.ogImage ?? storedSocialImage(existing),
    seo: { ...existing.seo, ...input.seo },
  };
}

export function imagePreviewSource(value) {
  if (!value || /^(https?:|data:)/i.test(value)) return value;
  const mime = value.startsWith("iVBOR") ? "image/png" : value.startsWith("UklGR") ? "image/webp" : value.startsWith("/9j/") ? "image/jpeg" : "";
  return mime ? `data:${mime};base64,${value}` : value;
}
