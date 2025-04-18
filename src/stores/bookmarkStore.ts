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

// // src/stores/bookmarkStore.js
// import { createStore } from "solid-js/store";
// import { createSignal, createEffect } from "solid-js";
// import type { ArticleType, BookmarkArticle } from "@/types";
//
// // Create a singleton store for the bookmarks
// let [bookmarks, setBookmarks] = createStore<BookmarkArticle[]>([]);
// let initialized = false;
//
// // Storage key for localStorage
// const STORAGE_KEY = "zahrawi_bookmarks";
//
// // Define the store as a function to maintain singleton pattern
// export const bookmarkStore = (() => {
//   // Initialize the store if not already done
//   if (!initialized && typeof window !== "undefined") {
//     syncFromStorage();
//     initialized = true;
//   }
//
//   // Function to add a bookmark
//   function addBookmark(bookmark: BookmarkArticle) {
//     // Check if already exists directly on the store state
//     if (!bookmarks.some((b) => b.id === bookmark.id)) {
//       setBookmarks([...bookmarks, bookmark]); // Add to the store
//     }
//     saveToStorage();
//     // Generate a unique ID if one doesn't exist
//     // const bookmarkId = article.id || `bookmark_${Date.now()}`;
//     //
//     // // Check if the article is already bookmarked
//     // const exists = bookmarks.some(bookmark =>
//     //   bookmark.id === bookmarkId ||
//     //   (bookmark.slug === article.slug &&
//     //     bookmark.data.category === article.data.category &&
//     //     bookmark.data.subcategory === article.data.subcategory)
//     // );
//     //
//     // if (!exists) {
//     //   // Add id property if it doesn't exist
//     //   const bookmarkToAdd = { ...article, id: bookmarkId };
//     //   setBookmarks([...bookmarks, bookmarkToAdd]);
//     //   return true;
//     // }
//     // return false;
//   }
//
//   // Function to remove a bookmark
//   function removeBookmark(id: string) {
//     // setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
//     setBookmarks((prevBookmarks) => prevBookmarks.filter((b) => b.id !== id));
//     saveToStorage();
//   }
//
//   function isBookmarked(id: string): boolean {
//     return bookmarks.some((b) => b.id === id);
//
//     // return bookmarks.some(bookmark =>
//     // (bookmark.slug === article.slug &&
//     //   bookmark.data.category === article.data.category &&
//     //   bookmark.data.subcategory === article.data.subcategory)
//     // );
//   }
//
//   // Function to toggle a bookmark
//   function toggleBookmark(bookmark: BookmarkArticle) {
//
//     // if (isBookmarked(id)) {
//     //   removeBookmark(id);
//     // } else {
//     //   const bookmarkData: BookmarkArticle = {
//     //     id: article.id,
//     //     slug: props.article.slug,
//     //     data: {
//     //       title: props.article.data.title,
//     //       description: props.article.data.description,
//     //       category: props.article.data.category,
//     //       subcategory: props.article.data.subcategory,
//     //     },
//     //   };
//     //   addBookmark(bookmarkData);
//     // }
//
//     const bookmarkId = bookmark.id
//     //
//     // // Check if article is already bookmarked
//     const existingIndex = bookmarks.findIndex(bookmark =>
//       bookmark.id === bookmarkId ||
//       (bookmark.slug === bookmark.slug &&
//         bookmark.data.category === bookmark.data.category &&
//         bookmark.data.subcategory === bookmark.data.subcategory)
//     );
//
//     if (existingIndex >= 0) {
//       // Remove bookmark if it exists
//       removeBookmark(bookmarks[existingIndex].id);
//       return false; // Indicates bookmark was removed
//     } else {
//       // Add bookmark if it doesn't exist
//       addBookmark(bookmark);
//       return true; // Indicates bookmark was added
//     }
//   }
//
//   // Check if an article is bookmarked
//
//   // Save bookmarks to localStorage
//   function saveToStorage() {
//     if (typeof window !== "undefined") {
//       try {
//         localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
//       } catch (error) {
//         console.error("Failed to save bookmarks to localStorage:", error);
//       }
//     }
//   }
//
//   // Load bookmarks from localStorage
//   function syncFromStorage() {
//     if (typeof window !== "undefined") {
//       try {
//         const stored = localStorage.getItem(STORAGE_KEY);
//         if (stored) {
//           setBookmarks(JSON.parse(stored));
//         }
//       } catch (error) {
//         console.error("Failed to load bookmarks from localStorage:", error);
//       }
//     }
//   }
//
//   // Clear all bookmarks
//   function clearBookmarks() {
//     setBookmarks([]);
//     saveToStorage();
//   }
//
//   // Create a signal for total bookmarks count
//   const [bookmarkCount] = createSignal(() => bookmarks.length);
//
//   // Set up effect to listen for storage events from other tabs
//   if (typeof window !== "undefined") {
//     window.addEventListener("storage", (event) => {
//       if (event.key === STORAGE_KEY) {
//         syncFromStorage();
//       }
//     });
//   }
//
//   return {
//     // Expose the store as a readable array
//     get bookmarks() {
//       return bookmarks;
//     },
//     addBookmark,
//     removeBookmark,
//     toggleBookmark,
//     isBookmarked,
//     syncFromStorage,
//     clearBookmarks,
//     bookmarkCount
//   };
// })();
//
// // Export the store by default
// export default bookmarkStore;

// import { createStore, reconcile } from "solid-js/store";
// import { createEffect } from "solid-js";
// import type { BookmarkArticle } from "../types";
//
// const getInitialBookmarks = (): BookmarkArticle[] => {
//   if (typeof window === "undefined") {
//     return []
//   }
//   try {
//     return JSON.parse(localStorage.getItem("bookmarks") || "[]");
//   } catch (e) {
//     console.error("Failed to parse bookmarks from localStorage:", e);
//     return [];
//   }
// };
//
// function createBookmarkStore() {
//   const [bookmarks, setBookmarks] = createStore<BookmarkArticle[]>(getInitialBookmarks());
//
//   createEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
//       window.dispatchEvent(new CustomEvent("bookmarks-changed"));
//     }
//   });
//
//
//   const addBookmark = (bookmark: BookmarkArticle) => {
//     if (!bookmarks.some((b) => b.id === bookmark.id)) {
//       setBookmarks([...bookmarks, bookmark]);
//     }
//   };
//
//   const removeBookmark = (id: string) => {
//     setBookmarks((prevBookmarks) => prevBookmarks.filter((b) => b.id !== id));
//   };
//
//   const isBookmarked = (id: string): boolean => {
//     return bookmarks.some((b) => b.id === id);
//   };
//
//   return {
//     bookmarks,
//     addBookmark,
//     removeBookmark,
//     isBookmarked,
//     syncFromStorage: () => {
//       setBookmarks(reconcile(getInitialBookmarks()));
//     },
//   };
// }
//
// export const bookmarkStore = createBookmarkStore();
//
// if (typeof window !== "undefined") {
//   window.addEventListener("storage", (event) => {
//     if (event.key === "bookmarks") {
//       bookmarkStore.syncFromStorage();
//     }
//   });
// }
