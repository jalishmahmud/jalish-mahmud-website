let indexPromise;

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

export async function writableBlogs(db) {
  const blogs = db.collection("blogs");
  // Sparse keeps legacy documents readable without a bulk data migration.
  // One multikey index prevents current/alias collisions, including concurrent writes.
  if (!indexPromise) indexPromise = blogs.createIndex({ urlSlugs: 1 }, { unique: true, sparse: true }).catch((error) => { indexPromise = undefined; throw error; });
  await indexPromise;
  return blogs;
}

export function isBlogSlugCollision(error) {
  return error.code === 11000 && Boolean(error.keyPattern?.urlSlugs || error.keyPattern?.slug);
}

export async function insertBlogWithUniqueSlug(blogs, doc) {
  for (let suffix = 1; ; suffix += 1) {
    const ending = suffix === 1 ? "" : `-${suffix}`;
    const slug = `${doc.slug.slice(0, 180 - ending.length).replace(/-+$/, "")}${ending}`;
    if (await blogs.findOne(blogSlugFilter(slug), { projection: { _id: 1 } })) continue;
    try {
      return await blogs.insertOne({ ...doc, slug, ...blogSlugState({}, slug, doc.status) });
    } catch (error) {
      if (!isBlogSlugCollision(error)) throw error;
      // Another request claimed this URL after the check. Try the next suffix.
    }
  }
}
