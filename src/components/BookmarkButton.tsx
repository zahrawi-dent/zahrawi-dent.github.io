// src/components/BookmarkButton.jsx
import { createSignal, onMount } from "solid-js";
import { bookmarkStore } from "../stores/bookmarkStore";

export default function BookmarkButton(props) {
  const { article } = props;
  const [isBookmarked, setIsBookmarked] = createSignal(false);

  // Check bookmark status on mount
  onMount(() => {
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
      class=" text-gray-400 transition-colors hover:text-blue-600"
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

  // return (
  //   <button
  //     onClick={toggleBookmark}
  //     class={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${isBookmarked()
  //       ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
  //       : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
  //       }`}
  //     aria-label={isBookmarked() ? "Remove bookmark" : "Add bookmark"}
  //   >
  //     <svg
  //       class="h-5 w-5"
  //       fill={isBookmarked() ? "currentColor" : "none"}
  //       viewBox="0 0 24 24"
  //       stroke="currentColor"
  //       stroke-width="2"
  //     >
  //       <path
  //         stroke-linecap="round"
  //         stroke-linejoin="round"
  //         d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
  //       />
  //     </svg>
  //   </button>
  // );
}


// import { createMemo } from "solid-js"; // Use createMemo for derived state
// import type { BookmarkArticle } from "../types";
// import { bookmarkStore } from "../stores/bookmarkStore";
//
//
// export default function BookmarkButton(props: { article: BookmarkArticle }) {
//   const { addBookmark, removeBookmark, isBookmarked } = bookmarkStore;
//
//   const isCurrentlyBookmarked = createMemo(() => isBookmarked(props.article.id));
//
//
//   const toggleBookmark = () => {
//     if (isCurrentlyBookmarked()) {
//       removeBookmark(props.article.id);
//     } else {
//       const bookmarkData: BookmarkArticle = {
//         id: props.article.id,
//         slug: props.article.slug,
//         data: {
//           title: props.article.data.title,
//           description: props.article.data.description,
//           category: props.article.data.category,
//           subcategory: props.article.data.subcategory,
//         },
//       };
//       addBookmark(bookmarkData);
//     }
//   };
//
//   return (
//     <button
//       class="text-gray-400 transition-colors hover:text-blue-600"
//       onClick={toggleBookmark}
//       aria-label={isCurrentlyBookmarked() ? "Remove from bookmarks" : "Add to bookmarks"}
//     >
//       {isCurrentlyBookmarked() ? (
//         <svg class="h-6 w-6" viewBox="0 0 24 24">
//           <path fill="currentColor" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
//         </svg>
//       ) : (
//         <svg class="h-6 w-6" viewBox="0 0 24 24">
//           <path
//             fill="currentColor"
//             d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
//           />
//         </svg>
//       )}
//     </button>
//   );
// }
