import * as fs from "fs";
import * as path from "path";

type SequenceMap = {
  [key: string]: readonly string[];
};

function loadSequences(): SequenceMap | null {
  try {
    const filePath = path.join("blog-content/sequences.json");

    // 3. Read the file content synchronously (use readFile for async)
    //    Specify 'utf8' encoding to get a string
    const fileContent = fs.readFileSync(filePath, "utf8");

    // 4. Parse the JSON string into a JavaScript object
    const sequences: SequenceMap = JSON.parse(fileContent);

    return sequences;
  } catch (error) {
    console.error(`Error loading sequences from ~/sequences.json:`, error);
    // Handle errors appropriately - e.g., return null, throw, use default data
    return null;
  }
}

export const articleSequences: SequenceMap = loadSequences() || ({} as const);

// Helper function to get the sequence number of an article
export function getArticleSequence(subcategory: string, articleId: string): number {
  const sequence = articleSequences[subcategory];
  if (!sequence) return -1;

  const index = sequence.indexOf(articleId);
  return index === -1 ? -1 : index;
}
