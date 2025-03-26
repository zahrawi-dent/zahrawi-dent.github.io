import { type CollectionEntry } from "astro:content";

export type ArticleType = CollectionEntry<"blog">;

export interface ArticleData {
  title: string;
  description: string;
  pubDate: Date;
  lastUpdated?: Date;
  category: string;
  subcategory: string;
  tags?: string[];
}

export interface BookmarkArticle {
  id: string;
  slug: string;
  data: {
    title: string;
    description: string;
    category: string;
    subcategory: string;
  };
}

export interface Item {
  title: string;
  description: string;
  href: string;
}
