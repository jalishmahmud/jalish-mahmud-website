import Category from "../../models/Category.js";
import Blog from "../../models/Blog.js";
import { connectToDatabase } from "../db/mongoose.js";

let indexPromise;

async function readyCategories() {
  await connectToDatabase();
  return Category;
}

export async function findSavedCategories() {
  const model = await readyCategories();
  return model.find({}).select("name nameKey slug").sort({ name: 1 }).lean().exec();
}

export async function findBlogCategoryFields() {
  await connectToDatabase();
  return Blog.find({}).select("category categorySlug").lean().exec();
}

export async function upsertCategory(filter, values) {
  const model = await readyCategories();
  if (!indexPromise) indexPromise = model.createIndexes().catch((error) => {
    indexPromise = undefined;
    throw error;
  });
  await indexPromise;
  return model.findOneAndUpdate(filter, { $setOnInsert: values }, {
    upsert: true, returnDocument: "after", lean: true, setDefaultsOnInsert: false,
  }).exec();
}

export async function findSavedCategory(filter) {
  const model = await readyCategories();
  return model.findOne(filter).lean().exec();
}
