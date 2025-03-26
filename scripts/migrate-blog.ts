import fs from 'fs/promises';
import path from 'path';
import { articleSequences } from '../src/content/sequences';

const BLOG_CONTENT_ROOT = path.join(process.cwd(), '../blog-content');
const CURRENT_BLOG_DIR = path.join(process.cwd(), 'src/blog');

async function createDirectoryStructure() {
  // Create root directory
  await fs.mkdir(BLOG_CONTENT_ROOT, { recursive: true });
  
  // Create content directory
  const contentDir = path.join(BLOG_CONTENT_ROOT, 'content');
  await fs.mkdir(contentDir, { recursive: true });

  // Create README.md
  const readmeContent = `# Blog Content

This repository contains the blog content for the dental education website.

## Structure

The content is organized by categories and subcategories:

\`\`\`
content/
├── category1/
│   └── subcategory1/
│       ├── _images/
│       ├── 01-article1.md
│       └── 02-article2.md
└── category2/
    └── subcategory2/
\`\`\`

## Adding Content

1. Place your markdown files in the appropriate category/subcategory directory
2. Name files with a numeric prefix for ordering (e.g., \`01-article.md\`)
3. Place associated images in the \`_images\` directory within the subcategory
4. Update \`sequences.json\` if needed

## Frontmatter Requirements

Each markdown file should have the following frontmatter:

\`\`\`yaml
---
title: "Article Title"
description: "Brief description"
category: "category-name"
subcategory: "subcategory-name"
pubDate: 2024-03-26
lastUpdated: 2024-03-26
author: "Author Name"
image:
  url: "./_images/image-name.png"
  alt: "Image description"
tags: ["tag1", "tag2"]
---
\`\`\`
`;
  await fs.writeFile(path.join(BLOG_CONTENT_ROOT, 'README.md'), readmeContent);

  // Create sequences.json
  const sequencesJson = JSON.stringify(articleSequences, null, 2);
  await fs.writeFile(path.join(BLOG_CONTENT_ROOT, 'sequences.json'), sequencesJson);
}

async function migrateContent() {
  // Read all current blog posts
  const files = await fs.readdir(CURRENT_BLOG_DIR);
  
  for (const file of files) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    
    const content = await fs.readFile(path.join(CURRENT_BLOG_DIR, file), 'utf-8');
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) continue;
    
    const frontmatter = frontmatterMatch[1];
    const categoryMatch = frontmatter.match(/category:\s*["'](.+)["']/);
    const subcategoryMatch = frontmatter.match(/subcategory:\s*["'](.+)["']/);
    
    if (!categoryMatch || !subcategoryMatch) continue;
    
    const category = categoryMatch[1];
    const subcategory = subcategoryMatch[1];
    
    // Create category and subcategory directories
    const categoryDir = path.join(BLOG_CONTENT_ROOT, 'content', category);
    const subcategoryDir = path.join(categoryDir, subcategory);
    const imagesDir = path.join(subcategoryDir, '_images');
    
    await fs.mkdir(categoryDir, { recursive: true });
    await fs.mkdir(subcategoryDir, { recursive: true });
    await fs.mkdir(imagesDir, { recursive: true });
    
    // Get sequence number from sequences.json
    const sequence = articleSequences[subcategory] || [];
    const titleMatch = frontmatter.match(/title:\s*["'](.+)["']/);
    const title = titleMatch ? titleMatch[1] : '';
    const sequenceNum = sequence.indexOf(title) + 1;
    
    // Create new filename with sequence number
    const newFilename = sequenceNum > 0 
      ? `${String(sequenceNum).padStart(2, '0')}-${file}`
      : file;
    
    // Write the file to new location
    await fs.writeFile(
      path.join(subcategoryDir, newFilename),
      content
    );
  }
}

async function main() {
  try {
    await createDirectoryStructure();
    await migrateContent();
    console.log('Blog content migration completed successfully!');
  } catch (error) {
    console.error('Error migrating blog content:', error);
  }
}

main(); 