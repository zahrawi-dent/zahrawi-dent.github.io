// src/components/BookmarkButton.jsx
import { createEffect, createSignal, onMount } from "solid-js";
import { bookmarkStore } from "../stores/bookmarkStore";

export default function BookmarkButton(props) {
  const { article } = props;
  const [isBookmarked, setIsBookmarked] = createSignal(false);

  // Check bookmark status on mount
  onMount(() => {
    setIsBookmarked(bookmarkStore.isBookmarked(article));
  });

  // an effect that runs whenever the bookmarks array changes
  createEffect(() => {
    // Access the bookmarks array to create a dependency
    const currentBookmarks = bookmarkStore.bookmarks;
    // Update the button state based on current bookmarks
    setIsBookmarked(bookmarkStore.isBookmarked(article));
  });

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Toggle the bookmark and update the UI state
    const newStatus = bookmarkStore.toggleBookmark(article);
    setIsBookmarked(newStatus);
  };


  return (
    <button
      class="text-gray-400 transition-colors hover:text-blue-600"
      onClick={toggleBookmark}
      aria-label={isBookmarked() ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarked() ? (
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

