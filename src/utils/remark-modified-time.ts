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
