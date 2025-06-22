import type { ArticleType } from "./types";

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };
  return new Date(date).toLocaleDateString(undefined, options);
}
function getReadingTime(s: string) {
  if (!s) return 0;
  const wpm = 200;

  const n = s
    .replace(/[^\w\s]/gi, "")
    .replaceAll("\r", "")
    .replaceAll("\n", "")
    .split(" ").length;

  return Math.ceil(n / wpm);
}

// title.toLowerCase().replace(' ', '-')

// Utility function to remove pagination number from URL
function removePageNumber(url: URL | string): string {
  // Convert to URL object if it's a string
  const urlObj = typeof url === "string" ? new URL(url) : url;

  // Split the pathname into segments
  const pathSegments = urlObj.pathname.split("/").filter((segment) => segment !== "");

  // Remove the page number if it exists
  const cleanedSegments = pathSegments.filter((segment) => !/^\d+$/.test(segment));

  // Reconstruct the URL without the page number
  return "/" + cleanedSegments.join("/");
}

// async function getPrevNextPosts(allPosts: ArticleType[], currentPost: ArticleType) {
//   const subcategory = currentPost.data.subcategory;
//   const sequence = articleSequences[subcategory as keyof typeof articleSequences];
//
//   if (!sequence) return { prevPost: undefined, nextPost: undefined };
//
//   // Get the current article's position in the sequence
//   const currentArticleId = currentPost.data.title; // Remove .md or .mdx extension
//   const currentIndex = sequence.indexOf(currentArticleId);
//
//   if (currentIndex === -1) return { prevPost: undefined, nextPost: undefined };
//
//   // Get the IDs of the previous and next articles
//   const prevArticleId = currentIndex > 0 ? sequence[currentIndex - 1] : null;
//   const nextArticleId = currentIndex < sequence.length - 1 ? sequence[currentIndex + 1] : null;
//
//   // Find the actual post objects
//   const prevPost = prevArticleId ? allPosts.find((post) => post.data.title === prevArticleId) : null;
//   const nextPost = nextArticleId ? allPosts.find((post) => post.data.title === nextArticleId) : null;
//
//   return {
//     prevPost: prevPost
//       ? {
//           slug: prevPost.id,
//           title: prevPost.data.title,
//           category: prevPost.data.category,
//           subcategory: prevPost.data.subcategory,
//         }
//       : undefined,
//     nextPost: nextPost
//       ? {
//           slug: nextPost.id,
//           title: nextPost.data.title,
//           category: nextPost.data.category,
//           subcategory: nextPost.data.subcategory,
//         }
//       : undefined,
//   };
// }

export {
  formatDate, getReadingTime, removePageNumber,
  // getPrevNextPosts 
};
