import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  excerpt: z.string().trim().min(20).max(320),
  content: z.string().min(1).max(500000),
  coverImage: z.string().max(3500000).optional().default(""),
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
    ogImage: z.string().max(3500000).optional().default(""),
  }).default({}),
});

export function parseBlogInput(input) {
  return blogSchema.parse(input);
}
