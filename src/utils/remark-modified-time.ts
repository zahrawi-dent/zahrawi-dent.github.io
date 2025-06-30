import { execSync } from "child_process";
import { globSync } from "fs";
import path from "path";

export function remarkModifiedTime() {
  return function(tree, file) {
    const filepath = file.history[0];
    console.log("PATH:", filepath)
    const result = execSync(`git log -1 --pretty="format:%cI" "${filepath}"`);
    file.data.astro.frontmatter.lastModified = result.toString();
  };
}

export function getFileLastModified(filePath: string): string | null {
  try {
    const result = execSync(`git log -1 --pretty="format:%cI" "${filePath}"`);
    return result.toString();
  } catch (error) {
    console.warn(`Could not get git info for ${filePath}:`, error);
    return null;
  }
}


export function getContentFileLastModified(article: any): string | null {
  const contentDir = path.join(process.cwd(), 'blog-content/content');
  const title = article.data.title;

  // Use glob to find the file by title
  const patterns = [
    `${contentDir}/**/${title}.md`,
    `${contentDir}/**/${title}.mdx`,
    `${contentDir}/${title}.md`,
    `${contentDir}/${title}.mdx`,
  ];

  for (const pattern of patterns) {
    const matches = globSync(pattern);
    if (matches.length > 0) {
      const filePath = matches[0];
      const result = execSync(`git log -1 --pretty="format:%cI" "${filePath}"`);
      return result.toString();
    }
  }

  console.warn(`Could not find file for title: ${title}`);
  return null;
}
