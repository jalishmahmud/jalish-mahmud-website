import { getDatabase } from "./mongodb";
import { getCategoryName, getCategorySlug } from "./blog-urls";
import { slugify } from "./utils";

let indexes;
async function collection() {
  const categories = (await getDatabase()).collection("categories");
  if (!indexes) indexes = Promise.all([
    categories.createIndex({ slug: 1 }, { unique: true }),
    categories.createIndex({ nameKey: 1 }, { unique: true }),
  ]).catch((error) => { indexes = undefined; throw error; });
  await indexes;
  return categories;
}

const nameKey = (name) => name.trim().normalize("NFKC").toLocaleLowerCase("en");
const serialize = (category) => ({ id: category._id?.toString() || "", name: category.name, slug: category.slug });

export async function getAdminCategories() {
  const db = await getDatabase();
  const [saved, blogs] = await Promise.all([
    db.collection("categories").find({}).sort({ name: 1 }).toArray(),
    db.collection("blogs").find({}, { projection: { category: 1, categorySlug: 1 } }).toArray(),
  ]);
  const all = new Map();
  for (const category of saved) all.set(nameKey(category.name), serialize(category));
  const slugs = new Set(saved.map((category) => category.slug));
  for (const blog of blogs) {
    const name = getCategoryName(blog.category);
    const slug = blog.categorySlug || getCategorySlug(blog.category);
    if (name && slug && !all.has(nameKey(name)) && !slugs.has(slug)) {
      all.set(nameKey(name), { id: "", name, slug });
      slugs.add(slug);
    }
  }
  return [...all.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveCategory({ name, slug }) {
  const categories = await collection();
  const key = nameKey(name);
  // Existing string categories are reused before creating an independent category.
  const known = (await getAdminCategories()).find((item) => nameKey(item.name) === key || item.slug === slug);
  const canonical = known || { name: name.trim(), slug: slug || slugify(name) };
  const canonicalKey = nameKey(canonical.name);
  const filter = { $or: [{ nameKey: canonicalKey }, { slug: canonical.slug }] };
  const now = new Date();
  try {
    const category = await categories.findOneAndUpdate(filter, { $setOnInsert: { name: canonical.name, nameKey: canonicalKey, slug: canonical.slug, createdAt: now, updatedAt: now } }, { upsert: true, returnDocument: "after" });
    return serialize(category);
  } catch (error) {
    if (error.code !== 11000) throw error;
    const category = await categories.findOne(filter);
    if (!category) throw error;
    return serialize(category);
  }
}
