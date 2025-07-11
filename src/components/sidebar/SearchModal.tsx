import { createSignal, createEffect, For, Show, onMount, onCleanup, createResource } from "solid-js";
import { isServer } from "solid-js/web";

// Lazy load FileIcon only when search is opened
const FileIcon = () => (
  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const SearchIcon = () => (
  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Kbd = (props: { children: any; class?: string }) => (
  <kbd
    class={`inline-flex items-center justify-center rounded border border-gray-600 bg-rich-black-700 px-1.5 py-0.5 text-xs font-semibold text-gray-300 ${props.class ?? ""}`}
  >
    {props.children}
  </kbd>
)



// Interface for Pagefind result data
interface PagefindResultData {
  url: string;
  meta: {
    title: string;
  };
  excerpt: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Constants ---
const PAGEFIND_SCRIPT_PATH = "/pagefind/pagefind.js";
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

// --- Utility Functions ---

// Simple debounce function
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Lazy load Pagefind API
const loadPagefindApi = async () => {
  if (isServer) return null;

  try {
    console.log("Loading Pagefind API...");
    // @ts-ignore - Ignore dynamic import path checking
    const pagefindModule = await import(/* @vite-ignore */ PAGEFIND_SCRIPT_PATH);
    const pf = pagefindModule.default || pagefindModule;

    if (pf && typeof pf.search === "function") {
      console.log("Pagefind API loaded successfully.");
      return pf;
    } else {
      throw new Error("Pagefind module loaded, but API not found or invalid.");
    }
  } catch (e) {
    console.error("Error loading Pagefind:", e);
    throw new Error("Failed to load search functionality.");
  }
};

export default function SearchModal(props: SearchModalProps) {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const [searchResults, setSearchResults] = createSignal<PagefindResultData[]>([]);
  const [isSearching, setIsSearching] = createSignal(false);

  // Use createResource for lazy loading Pagefind API
  const [pagefindApi] = createResource(
    () => props.isOpen ? true : false, // Only load when search is opened
    loadPagefindApi,
    {
      initialValue: null,
    }
  );

  let searchInput: HTMLInputElement | undefined;

  // --- Effects ---

  // Effect to handle focusing input when search opens
  createEffect(() => {
    if (props.isOpen) {
      searchInput?.focus();
      setSelectedIndex(searchResults().length > 0 ? 0 : -1);
    } else {
      // Clear results and query when search is closed
      setSearchQuery("");
      setSearchResults([]);
      setSelectedIndex(-1);
      setIsSearching(false);
    }
  });

  // Effect to scroll selected result into view
  createEffect(() => {
    if (!isServer && props.isOpen) {
      const idx = selectedIndex();
      if (idx >= 0) {
        const element = document.querySelector(`[data-result-index="${idx}"]`);
        element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  });

  // Effect to trigger debounced search when query changes
  createEffect(() => {
    const query = searchQuery().trim();
    if (query.length >= MIN_SEARCH_LENGTH) {
      debouncedSearch(query);
    } else {
      setSearchResults([]);
      setSelectedIndex(-1);
      setIsSearching(false);
    }
  });

  // --- Search Integration ---

  // Debounced search function using Pagefind
  const debouncedSearch = debounce(async (query: string) => {
    const pf = pagefindApi();

    if (!pf) {
      console.warn("Pagefind API not loaded yet, search skipped.");
      return;
    }

    if (query.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSelectedIndex(-1);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSelectedIndex(-1);

    console.log(`Searching Pagefind for: "${query}"`);
    try {
      const search = await pf.search(query);

      if (search.results.length === 0) {
        console.log("No results found.");
        setSearchResults([]);
      } else {
        const resultsData = await Promise.all(search.results.map((result: any) => result.data()));
        console.log(`Found ${resultsData.length} results.`);
        setSearchResults(resultsData as PagefindResultData[]);
        setSelectedIndex(0);
      }
    } catch (e) {
      console.error("Pagefind search error:", e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, SEARCH_DEBOUNCE_MS);

  // --- Event Handlers ---

  onMount(() => {
    if (!isServer) {
      document.addEventListener("keydown", handleKeyDown);
    }
  });

  onCleanup(() => {
    if (!isServer) {
      document.removeEventListener("keydown", handleKeyDown);
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    // Close modal on Escape
    if (e.key === "Escape" && props.isOpen) {
      e.preventDefault();
      props.onClose();
      return;
    }

    // Handle navigation within search results only if search is open
    if (!props.isOpen) return;

    const results = searchResults();
    if (results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = prev - 1;
          return newIndex < 0 ? results.length - 1 : newIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        const currentSelection = selectedIndex();
        if (currentSelection > -1) {
          const selectedResult = results[currentSelection];
          if (selectedResult?.url && !isServer) {
            console.log("Navigating to:", selectedResult.url);
            window.location.href = selectedResult.url;
            props.onClose();
          }
        }
        break;
    }
  };

  // --- Render ---
  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 z-50 overflow-y-auto bg-rich-black-900/90 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) props.onClose();
        }}
      >
        <div class="mx-auto mt-4 max-w-2xl overflow-hidden rounded-lg bg-rich-black-800 shadow-xl md:mt-16">
          <div class="relative flex items-center border-b border-gray-700">
            <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="search"
              class="w-full appearance-none border-none bg-transparent py-3 pr-24 pl-12 text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
              placeholder="Search content..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              ref={searchInput}
              autocomplete="off"
              aria-label="Search input"
            />
            <Show when={isSearching()}>
              <div class="absolute inset-y-0 right-16 animate-pulse p-2 text-xs text-gray-400">...</div>
            </Show>
            <button
              onClick={props.onClose}
              class="absolute right-4 text-sm font-medium text-indigo-400 hover:text-indigo-300"
            >
              Cancel
            </button>
          </div>

          {/* Keyboard Hints - Lazily loaded */}
          <div class="hidden flex-wrap items-center gap-x-3 gap-y-1 px-4 pt-3 pb-2 text-xs text-gray-400 lg:flex" aria-hidden="true">
            <span>Navigate:</span>
            <span class="flex items-center gap-1">
              <Kbd>↑</Kbd> <Kbd>↓</Kbd>
            </span>
            <span>Select:</span> <Kbd>↵</Kbd>
            <span>Close:</span> <Kbd>Esc</Kbd>
          </div>

          {/* Results Area */}
          <div class="max-h-[60vh] overflow-y-auto md:max-h-[70vh]">
            {/* Error loading Pagefind */}
            <Show when={pagefindApi.error}>
              <div class="p-4 text-center text-red-400">
                {pagefindApi.error?.message || "Failed to load search functionality"}
              </div>
            </Show>

            {/* Loading Pagefind API */}
            <Show when={pagefindApi.loading}>
              <div class="p-6 text-center text-gray-400">Loading search...</div>
            </Show>

            {/* Loading Search Results */}
            <Show when={isSearching() && !pagefindApi.error && !pagefindApi.loading}>
              <div class="p-6 text-center text-gray-400">Searching...</div>
            </Show>

            {/* Search Results Display */}
            <Show when={!isSearching() && !pagefindApi.error && !pagefindApi.loading && searchQuery().trim().length >= MIN_SEARCH_LENGTH}>
              <Show
                when={searchResults().length > 0}
                fallback={<div class="p-6 text-center text-gray-400">No results found for "{searchQuery()}".</div>}
              >
                <div class="px-2 pt-2 pb-1 text-xs text-gray-500">
                  {searchResults().length} result{searchResults().length === 1 ? "" : "s"}
                </div>
                <ul class="divide-y divide-gray-700">
                  <For each={searchResults()}>
                    {(item, index) => (
                      <li
                        data-result-index={index()}
                        class={`transition-colors duration-100 ${index() === selectedIndex() ? "bg-rich-black-700/50" : ""
                          }`}
                        onMouseEnter={() => setSelectedIndex(index())}
                      >
                        <a href={item.url} class="block p-4 hover:bg-rich-black-700">
                          <div class="flex items-start gap-3 text-white">
                            <div class="mt-1 shrink-0 text-gray-500">
                              <FileIcon />
                            </div>
                            <div class="flex-1 overflow-hidden">
                              <span class="mb-1 block truncate font-medium">
                                {item.meta.title || "Untitled Page"}
                              </span>
                              <div
                                class="search-excerpt line-clamp-2 text-sm text-gray-400"
                                innerHTML={item.excerpt}
                              />
                            </div>
                          </div>
                        </a>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </Show>

            {/* Prompt to type more */}
            <Show when={
              !isSearching() &&
              !pagefindApi.error &&
              !pagefindApi.loading &&
              searchQuery().trim().length > 0 &&
              searchQuery().trim().length < MIN_SEARCH_LENGTH
            }>
              <div class="p-6 text-center text-gray-400">Please enter at least {MIN_SEARCH_LENGTH} characters.</div>
            </Show>

            {/* Initial state / empty query */}
            <Show when={!pagefindApi.error && !pagefindApi.loading && searchQuery().trim().length === 0}>
              <div class="p-6 text-center text-gray-500">Start typing to search your content.</div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
}
