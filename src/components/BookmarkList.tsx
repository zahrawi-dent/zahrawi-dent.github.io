import { Show, For } from "solid-js";
// Import the reactive state and actions directly
import { bookmarkStore } from "../stores/bookmarkStore";
// No longer need createSignal, onMount, onCleanup for this

export default function BookmarksList() {
  // Use the reactive state and actions directly from the store
  const { bookmarks, removeBookmark } = bookmarkStore;

  // No need for loadBookmarks, onMount, onCleanup, or local signal anymore
  // The component will automatically re-render when `bookmarkStore.bookmarks` changes.

  const handleDelete = (id: string, e: Event) => {
    e.preventDefault();
    removeBookmark(id); // Just call the store action
  };

  return (
    <div class="space-y-4 p-4">
      <h3 class="mb-4 text-lg font-semibold text-white">Bookmarked Articles</h3>
      {/* Use the reactive bookmarks array directly */}
      <Show when={bookmarks.length > 0} fallback={<p class="text-sm text-gray-400">No bookmarked articles yet</p>}>
        <div class="space-y-3">
          {/* Solid's For component automatically tracks changes in the array */}
          <For each={bookmarks}>
            {(article) => (
              <div class="group relative">
                <a
                  href={`/${article.data.category}/${article.data.subcategory}/${article.slug}`}
                  class="block rounded-lg bg-gray-800 p-3 pr-10 transition-colors hover:bg-gray-700"
                >
                  <h4 class="line-clamp-2 font-medium text-white">{article.data.title}</h4>
                  <p class="mt-1 line-clamp-2 text-sm text-gray-400">{article.data.description}</p>
                </a>
                <button
                  onClick={[handleDelete, article.id]} // Pass only the ID
                  class="absolute top-2 right-2 p-2 text-gray-400 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500"
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
    </div>
  );
}
