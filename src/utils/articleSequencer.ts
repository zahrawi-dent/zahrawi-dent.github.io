import type { CollectionEntry } from 'astro:content';

import sequences from '../../blog-content/sequences.json';

type SequenceMap = {
  [subcategory: string]: readonly string[];
};

type BlogPost = CollectionEntry<'blog'>;

/**
 * Orders articles based on the sequence defined for their subcategory
 */
export function getOrderedArticles(
  subcategory: string,
  articles: BlogPost[]
): BlogPost[] {
  const sequence = sequences[subcategory as keyof typeof sequences];

  if (!sequence || sequence.length === 0) {
    // No sequence defined, return articles sorted by date
    return articles
    // return articles.sort((a, b) => 
    // new Date(b.data.pubDate || 0).getTime() - new Date(a.data.pubDate || 0).getTime()
    // );
  }

  return articles.sort((a, b) => {
    const aIndex = sequence.indexOf(a.data.title);
    const bIndex = sequence.indexOf(b.data.title);

    // Articles not in sequence go to the end
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });
}

/**
 * Get the sequence position of an article
 */
export function getArticlePosition(
  subcategory: string,
  articleTitle: string
): number {
  const sequence = sequences[subcategory as keyof typeof sequences];

  if (!sequence) return -1;

  return sequence.indexOf(articleTitle);
}

/**
 * Get the next and previous articles in a sequence
 */
export function getAdjacentArticles(
  subcategory: string,
  currentTitle: string,
  allArticles: BlogPost[]
): { prevPost: BlogPost | null; nextPost: BlogPost | null } {
  const orderedArticles = getOrderedArticles(subcategory, allArticles);
  const currentIndex = orderedArticles.findIndex(
    article => article.data.title === currentTitle
  );

  return {
    prevPost: currentIndex > 0 ? orderedArticles[currentIndex - 1] : null,
    // if not nextPost for last article return null 
    nextPost: currentIndex < orderedArticles.length - 1 ? orderedArticles[currentIndex + 1] : null
  };
}
