import { glob } from "astro/loaders";
import { z, defineCollection } from "astro:content";

const blog = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "blog-content/content",
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    lastUpdated: z.date(),
    description: z.string(),
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

// Export a single `collections` object to register your collection(s)
export const collections = { blog };
