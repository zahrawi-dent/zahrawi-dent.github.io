import { createMemo } from "solid-js"; // Use createMemo for derived state
import type { BookmarkArticle } from "../types";
// Import the reactive check function and actions
import { bookmarkStore } from "../stores/bookmarkStore";

interface Props {
  article: {
    id: string;
    slug: string;
    data: {
      title: string;
      description: string;
      category: string;
      subcategory: string;
    };
  };
}

export default function BookmarkButton(props: Props) {
  // Use the reactive functions/state from the store
  const { addBookmark, removeBookmark, isBookmarked } = bookmarkStore;

  // Create a derived signal (memo) that reactively checks if this article is bookmarked
  const isCurrentlyBookmarked = createMemo(() => isBookmarked(props.article.id));

  // No need for createEffect or local signal for isBookmarked anymore

  const toggleBookmark = () => {
    // Check the derived state
    if (isCurrentlyBookmarked()) {
      removeBookmark(props.article.id);
    } else {
      const bookmarkData: BookmarkArticle = {
        id: props.article.id,
        slug: props.article.slug,
        data: {
          title: props.article.data.title,
          description: props.article.data.description,
          category: props.article.data.category,
          subcategory: props.article.data.subcategory,
        },
      };
      addBookmark(bookmarkData);
    }
    // No need to manually set state or dispatch event - reactivity handles it!
  };

  return (
    <button
      class="text-gray-400 transition-colors hover:text-blue-600"
      onClick={toggleBookmark}
      // Use the derived signal here
      aria-label={isCurrentlyBookmarked() ? "Remove from bookmarks" : "Add to bookmarks"}
    >
      {/* Use the derived signal for conditional rendering */}
      {isCurrentlyBookmarked() ? (
        <svg class="h-6 w-6" viewBox="0 0 24 24">
          <path fill="currentColor" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
        </svg>
      ) : (
        <svg class="h-6 w-6" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
          />
        </svg>
      )}
    </button>
  );
}
