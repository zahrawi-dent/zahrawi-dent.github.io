import { createStore, reconcile } from "solid-js/store";
import { createEffect } from "solid-js";
import type { BookmarkArticle } from "../types";

// Helper to safely get initial state, handling server-side rendering
const getInitialBookmarks = (): BookmarkArticle[] => {
  if (typeof window === "undefined") {
    return []; // No localStorage on server
  }
  try {
    return JSON.parse(localStorage.getItem("bookmarks") || "[]");
  } catch (e) {
    console.error("Failed to parse bookmarks from localStorage:", e);
    return [];
  }
};

function createBookmarkStore() {
  // Create the reactive store, initialized from localStorage
  const [bookmarks, setBookmarks] = createStore<BookmarkArticle[]>(getInitialBookmarks());

  // Effect to automatically save to localStorage whenever the store changes
  createEffect(() => {
    if (typeof window !== "undefined") {
      // Use JSON.stringify on the store proxy directly
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      // Dispatch event for potential non-Solid listeners (optional, can be removed if only Solid components use the store)
      window.dispatchEvent(new CustomEvent("bookmarks-changed"));
    }
  });

  // --- Store Actions ---

  const addBookmark = (bookmark: BookmarkArticle) => {
    // Check if already exists directly on the store state
    if (!bookmarks.some((b) => b.id === bookmark.id)) {
      setBookmarks([...bookmarks, bookmark]); // Add to the store
    }
  };

  const removeBookmark = (id: string) => {
    // Filter the store state
    setBookmarks((prevBookmarks) => prevBookmarks.filter((b) => b.id !== id));
  };

  const isBookmarked = (id: string): boolean => {
    // Check directly against the reactive store state
    return bookmarks.some((b) => b.id === id);
  };

  return {
    // Export the reactive state directly
    bookmarks,
    // Export actions
    addBookmark,
    removeBookmark,
    // Export a reactive check function
    isBookmarked,
    // Provide a way to re-sync from storage if needed (e.g., storage event listener)
    syncFromStorage: () => {
      // reconcile helps update the store efficiently without recreating everything
      setBookmarks(reconcile(getInitialBookmarks()));
    },
  };
}

export const bookmarkStore = createBookmarkStore();

// Optional: Listen for storage events in other tabs/windows
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "bookmarks") {
      // Re-sync the store state if localStorage was changed externally
      bookmarkStore.syncFromStorage();
    }
  });
}
