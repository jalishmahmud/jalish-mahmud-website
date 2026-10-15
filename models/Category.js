import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: String,
  nameKey: String,
  slug: String,
  createdAt: Date,
  updatedAt: Date,
}, { collection: "categories", strict: false, versionKey: false, autoIndex: false, autoCreate: false });

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ nameKey: 1 }, { unique: true });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
