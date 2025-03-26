# Blog Content

This repository contains the blog content for the dental education website.

## Structure

The content is organized by categories and subcategories:

```
content/
├── category1/
│   └── subcategory1/
│       ├── _images/
│       ├── 01-article1.md
│       └── 02-article2.md
└── category2/
    └── subcategory2/
```

## Adding Content

1. Place your markdown files in the appropriate category/subcategory directory
2. Name files with a numeric prefix for ordering (e.g., `01-article.md`)
3. Place associated images in the `_images` directory within the subcategory
4. Update `sequences.json` if needed

## Frontmatter Requirements

Each markdown file should have the following frontmatter:

```yaml
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
```
