import { getCollection } from "astro:content";

// Outputs: /builtwith.json
export async function GET({ params, request }) {
  // get all blog posts with category "endodontics"
  const posts = await getCollection("blog", ({ data }) => {
    return data.category === "endodontics";
  });

  return new Response(JSON.stringify(posts));
}
