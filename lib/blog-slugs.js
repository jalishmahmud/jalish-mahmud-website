// Legacy documents have only slug; new saves reserve current and published URLs.
export function blogSlugFilter(slug) {
  return { $or: [{ slug }, { urlSlugs: slug }] };
}

export function blogSlugState(existing, slug, status) {
  const legacyPublished = !Array.isArray(existing.publishedSlugs) && Boolean(existing.publishedAt);
  const publishedSlugs = [...new Set([
    ...(existing.publishedSlugs || []),
    ...(existing.status === "published" || legacyPublished ? [existing.slug] : []),
    ...(status === "published" ? [slug] : []),
  ])];
  return { publishedSlugs, urlSlugs: [...new Set([slug, ...publishedSlugs])] };
}

export function isBlogSlugCollision(error) {
  return error.code === 11000 && Boolean(error.keyPattern?.urlSlugs || error.keyPattern?.slug);
}
