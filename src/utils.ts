import calculateReadingTime from "reading-time";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";

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
  const wpm = 200;

  const n = s
    .replace(/[^\w\s]/gi, "")
    .replaceAll("\r", "")
    .replaceAll("\n", "")
    .split(" ").length;

  return Math.ceil(n / wpm);
}

// const getReadingTime = (text: string): string | undefined => {
//   if (!text || !text.length) return undefined;
//   try {
//     const { minutes } = calculateReadingTime(toString(fromMarkdown(text)));
//     if (minutes && minutes > 0) {
//       return `${Math.ceil(minutes)} min read`;
//     }
//     return undefined;
//   } catch (e) {
//     return undefined;
//   }
// };
export { formatDate, getReadingTime };
