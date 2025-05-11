import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";

// Assuming you have a collection named "blog"
const blogs = await getCollection("blog");

// Transform the collection into an object
const pages = Object.fromEntries(
  blogs.map(({ id, data }) => [id, { data }]),
);

export const { getStaticPaths, GET } = OGImageRoute({
  // The name of your dynamic route segment.
  // In this case it’s `route`, because the file is named `[...route].ts`.
  param: "route",

  // A collection of pages to generate images for.
  pages,

  // For each page, this callback will be used to customize the OG image.
  getImageOptions: async (id, { data, }: (typeof pages)[string]) => {
    return {
      title: data.title,
      description: data.description,
      // dir: data.isArabic ? "rtl" : "ltr",
      border: { color: [114, 221, 64], width: 20, side: "inline-start" },
      bgGradient: [
        [6, 38, 45],
        [8, 3, 2],
      ],
      logo: {
        path: "public/favicon.svg",
        size: [500],
      },
    };
  },
});
