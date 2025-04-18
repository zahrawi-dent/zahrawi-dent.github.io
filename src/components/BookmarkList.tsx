// BookmarksList.jsx
import { Show, For, createSignal, onMount } from "solid-js";
import { bookmarkStore } from "../stores/bookmarkStore";
import type { BookmarkArticle } from "@/types";

// Create a singleton instance for BookmarksList
let isInitialized = false;
let storeInstance = null;

export default function BookmarkList() {
  // Only initialize the store once
  if (!storeInstance) {
    storeInstance = bookmarkStore;
  }

  const { bookmarks, removeBookmark } = storeInstance;

  // Signal to track if the component has mounted on the client
  const [isClientMounted, setIsClientMounted] = createSignal(isInitialized);

  // Set the signal to true only after the component mounts on the client
  onMount(() => {
    if (!isInitialized) {
      setIsClientMounted(true);
      isInitialized = true;
      // Optional: Force a store sync when first mounting
      storeInstance.syncFromStorage();
    }
  });



  const handleDelete = (article: BookmarkArticle, e: Event) => {

    e.preventDefault();
    e.stopPropagation();
    // Toggle the bookmark and update the UI state
    bookmarkStore.toggleBookmark(article);

    // removeBookmark(id);
  };

  return (
    <div class="space-y-4 p-4">
      <h3 class="mb-4 text-lg font-semibold text-white">Bookmarked Articles</h3>

      {/* Only render the list content after mounting on the client */}
      <Show when={isClientMounted()}>
        <Show
          when={bookmarks.length > 0}
          fallback={<p class="text-sm text-gray-400">No bookmarked articles yet</p>}
        >
          <div class="space-y-3">
            <For each={bookmarks}>
              {(article: BookmarkArticle) => (
                <div class="group relative">
                  <a
                    href={`/${article.id}`}
                    class="block rounded-lg bg-gray-800 p-3 pr-10 transition-colors hover:bg-gray-700"
                  >
                    <h4 class="line-clamp-2 font-medium text-white">{article.data.title}</h4>
                    <p class="mt-1 line-clamp-2 text-sm text-gray-400">{article.data.description}</p>
                  </a>
                  <button
                    onClick={(e) => handleDelete(article, e)}
                    class="absolute top-2 right-2 p-2 text-red-500 opacity-60 transition-colors hover:opacity-100 cursor-pointer"
                    aria-label="Delete bookmark"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>

      <Show when={!isClientMounted()}>
        <p class="text-sm text-gray-500">Loading bookmarks...</p>
      </Show>
    </div>
  );
}


// import { Show, For, createSignal, onMount } from "solid-js";
// import { bookmarkStore } from "../stores/bookmarkStore";
//
// export default function BookmarksList() {
//   const { bookmarks, removeBookmark } = bookmarkStore;
//
//   // Signal to track if the component has mounted on the client
//   const [isClientMounted, setIsClientMounted] = createSignal(false);
//
//
//   // Set the signal to true only after the component mounts on the client
//   onMount(() => {
//     setIsClientMounted(true);
//     // Optional: You could trigger a store sync here if needed,
//     // though the store already tries to load initially.
//     // bookmarkStore.syncFromStorage();
//   });
//
//   const handleDelete = (id: string, e: Event) => {
//     e.preventDefault();
//     e.stopPropagation(); // Prevent potential clicks bubbling up
//     removeBookmark(id);
//   };
//
//   return (
//     <div class="space-y-4 p-4">
//       <h3 class="mb-4 text-lg font-semibold text-white">Bookmarked Articles</h3>
//       {/* Only render the list content *after* mounting on the client */}
//       <Show when={isClientMounted()}>
//         <Show
//           when={bookmarks.length > 0}
//           fallback={<p class="text-sm text-gray-400">No bookmarked articles yet</p>}
//         >
//           <div class="space-y-3">
//             <For each={bookmarks}>
//               {(article) => (
//                 <div class="group relative">
//                   <a
//                     href={`/${article.data.category}/${article.data.subcategory}/${article.slug}`}
//                     class="block rounded-lg bg-gray-800 p-3 pr-10 transition-colors hover:bg-gray-700"
//                   >
//                     <h4 class="line-clamp-2 font-medium text-white">{article.data.title}</h4>
//                     <p class="mt-1 line-clamp-2 text-sm text-gray-400">{article.data.description}</p>
//                   </a>
//                   <button
//                     onClick={(e) => handleDelete(article.id, e)}
//                     class="absolute top-2 right-2 p-2 text-red-500 opacity-60 transition-colors hover:opacity-100 cursor-pointer"
//                     aria-label="Delete bookmark"
//                   >
//                     <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                       <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//               )}
//             </For>
//           </div>
//         </Show>
//       </Show>
//
//       <Show when={!isClientMounted()}>
//         <p class="text-sm text-gray-500">Loading bookmarks...</p>
//       </Show>
//     </div>
//   );
//
// }
