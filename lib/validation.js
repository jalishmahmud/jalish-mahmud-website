import { z } from "zod";
import { decodeBlogImage } from "./image-data.js";
const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180);
export const categorySchema = z.object({ name: z.string().trim().min(2).max(60), slug });
const image = z.string().max(2100000).refine((value) => {
  if (!value) return true;
  if (/^https?:\/\//i.test(value) || (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/9j/"))) return true;
  const decoded = decodeBlogImage(value);
  return Boolean(decoded && decoded.buffer.length <= 1500000);
}, "Use a JPG, PNG or WebP image up to 1.5 MB.").optional().default("");

export const blogSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  excerpt: z.string().trim().min(20).max(320),
  content: z.string().min(1).max(500000),
  coverImage: image,
  featuredImage: image,
  socialImage: image,
  featuredImageAlt: z.string().trim().max(250).optional().default(""),
  categorySlug: slug.optional(),
  categoryId: z.string().optional(),
  imageAlt: z.string().trim().max(250).optional().default(""),
  category: z.string().trim().min(2).max(60),
  tags: z.array(z.string().trim().min(1).max(30)).max(12).default([]),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
  seo: z.object({
    title: z.string().max(180).optional().default(""),
    description: z.string().max(320).optional().default(""),
    keywords: z.array(z.string().trim().max(40)).max(20).default([]),
    ogTitle: z.string().max(180).optional().default(""),
    ogDescription: z.string().max(320).optional().default(""),
    ogImage: image,
  }).default({}),
});

export function parseBlogInput(input) {
  return blogSchema.parse(input);
}
