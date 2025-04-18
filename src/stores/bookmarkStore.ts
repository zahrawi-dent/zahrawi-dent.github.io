// src/stores/bookmarkStore.js
import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
import type { BookmarkArticle } from "@/types";

// Create a singleton store for the bookmarks
let [bookmarks, setBookmarks] = createStore<BookmarkArticle[]>([]);
let initialized = false;

// Storage key for localStorage
const STORAGE_KEY = "zahrawi_bookmarks";

// Define the store as a function to maintain singleton pattern
export const bookmarkStore = (() => {
  // Initialize the store if not already done
  if (!initialized && typeof window !== "undefined") {
    syncFromStorage();
    initialized = true;
  }

  // Function to add a bookmark
  function addBookmark(article: BookmarkArticle) {
    // Generate a unique ID if one doesn't exist
    const bookmarkId = article.id

    // Check if the article is already bookmarked
    const exists = bookmarks.some(bookmark => bookmark.id === bookmarkId);

    if (!exists) {
      // Add id property if it doesn't exist
      const bookmarkToAdd = { ...article, id: bookmarkId };
      setBookmarks([...bookmarks, bookmarkToAdd]);
      saveToStorage();
      return true;
    }
    return false;
  }

  // Function to remove a bookmark
  function removeBookmark(id: string) {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
    saveToStorage();
  }

  // Function to toggle a bookmark
  function toggleBookmark(article: BookmarkArticle) {
    const bookmarkId = article.id || `bookmark_${Date.now()}`;

    // Check if article is already bookmarked
    const existingIndex = bookmarks.findIndex(bookmark => bookmark.id === bookmarkId);

    if (existingIndex >= 0) {
      // Remove bookmark if it exists
      removeBookmark(bookmarks[existingIndex].id);
      // notify that bookmark was removed
      return false; // Indicates bookmark was removed
    } else {
      // Add bookmark if it doesn't exist
      addBookmark(article);
      return true; // Indicates bookmark was added
    }
  }

  // Check if an article is bookmarked
  function isBookmarked(article: BookmarkArticle) {
    // return bookmarks.some(bookmark =>
    //   bookmark.id === article.id);
    return bookmarks.some(bookmark => (bookmark.id === article.id));
  }

  // Save bookmarks to localStorage
  function saveToStorage() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error("Failed to save bookmarks to localStorage:", error);
      }
    }
  }

  // Load bookmarks from localStorage
  function syncFromStorage() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setBookmarks(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load bookmarks from localStorage:", error);
      }
    }
  }

  // Clear all bookmarks
  function clearBookmarks() {
    setBookmarks([]);
    saveToStorage();
  }

  // Create a signal for total bookmarks count
  const [bookmarkCount] = createSignal(() => bookmarks.length);

  // Set up effect to listen for storage events from other tabs
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        syncFromStorage();
      }
    });
  }

  return {
    // Expose the store as a readable array
    get bookmarks() {
      return bookmarks;
    },
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    syncFromStorage,
    clearBookmarks,
    bookmarkCount
  };
})();

// Export the store by default
export default bookmarkStore;
