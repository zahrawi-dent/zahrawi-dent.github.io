import { defineCollection, z } from 'astro:content';

// Get blog content path from environment variable, fallback to $HOME/blog-content
const BLOG_CONTENT_PATH = process.env.BLOG_CONTENT_PATH || `${process.env.HOME}/blog-content`;

const blog = defineCollection({
  type: 'content',
  // Use glob pattern to find all markdown files in the content directory
  base: `${BLOG_CONTENT_PATH}/content`,
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    lastUpdated: z.date(),
    category: z.enum([
      "endodontics",
      "orthodontics",
      "restorative",
      "oral-surgery",
      "periodontics",
      "oral-health",
      "anatomy",
    ]),
    subcategory: z.string(),
    author: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  blog,
}; 
