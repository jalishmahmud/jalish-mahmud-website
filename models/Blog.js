import mongoose from "mongoose";

const { Schema } = mongoose;

// Keep the existing collection and legacy fields readable while Zod validates
// all new article input at the API boundary.
const blogSchema = new Schema({
  title: String,
  slug: String,
  urlSlugs: { type: [String], default: undefined },
  publishedSlugs: { type: [String], default: undefined },
  excerpt: String,
  content: Schema.Types.Mixed,
  contentHtml: String,
  coverImage: String,
  image: String,
  featuredImage: String,
  socialImage: String,
  imageAlt: String,
  featuredImageAlt: String,
  socialImageAlt: String,
  category: String,
  categorySlug: String,
  categoryId: String,
  tags: { type: [String], default: undefined },
  featured: Boolean,
  status: String,
  seo: Schema.Types.Mixed,
  readTime: Schema.Types.Mixed,
  views: Number,
  date: String,
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date,
}, { collection: "blogs", strict: false, versionKey: false, minimize: false, autoIndex: false, autoCreate: false });

blogSchema.index({ urlSlugs: 1 }, { unique: true, sparse: true });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ updatedAt: -1 });

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
