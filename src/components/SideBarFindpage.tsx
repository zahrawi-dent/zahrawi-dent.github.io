// SidebarFindpage.jsx
import { createSignal, createEffect, For, Show, onMount, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import BookmarksList from "./BookmarkList";
import ThemeToggle from "./ThemeToggle";

// --- Icon Components (keep as they are) ---
const ChevronDownIcon = () => (
  <svg class="h-5 w-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const SearchIcon = () => (
  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const MenuIcon = () => (
  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const CloseIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ZahrawiIcon = () => (
  <svg class="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
    />
  </svg>
);
const FileIcon = () => (
  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
// --- End Icon Components ---

// --- Kbd component ---
const Kbd = (props) => (
  <kbd
    class={`inline-flex items-center justify-center rounded border border-gray-600 bg-gray-700 px-1.5 py-0.5 text-xs font-semibold text-gray-300 ${props.class ?? ""}`}
  >
    {props.children}
  </kbd>
);

// --- Utility Functions ---
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
}

function createNavItems(categories) {
  return categories.map((cat) => ({
    title: cat.title,
    href: cat.href,
  }));
}

// --- Constants ---
const PAGEFIND_SCRIPT_PATH = "/pagefind/pagefind.js";
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

// Create singleton state for persistence
let singletonState = null;

function createPersistentState(props) {
  if (singletonState) {
    // If the singleton already exists, update its categories prop
    // but keep all other state intact
    if (props.categories) {
      singletonState.setCategories(props.categories);
    }
    return singletonState;
  }

  // Create the initial state if it doesn't exist
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const [activeNavItem, setActiveNavItem] = createSignal("/");
  const [openedCategory, setOpenedCategory] = createSignal(null);
  const [categories, setCategories] = createSignal(props.categories || []);

  // Pagefind State
  const [pagefindApi, setPagefindApi] = createSignal(null);
  const [searchResults, setSearchResults] = createSignal([]);
  const [isSearching, setIsSearching] = createSignal(false);
  const [pagefindLoadError, setPagefindLoadError] = createSignal(null);

  const initialNavItems = () => [
    { title: "Home Page", href: "/" },
    {
      title: "Categories",
      href: "#",
      isOpen: false,
      children: createNavItems(categories()),
    },
    { title: "Blog", href: "/blog" },
    { title: "About", href: "/about" },
  ];

  const [navItems, setNavItems] = createSignal(initialNavItems());

  // Create the singleton state
  singletonState = {
    isSearchOpen,
    setIsSearchOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    searchQuery,
    setSearchQuery,
    selectedIndex,
    setSelectedIndex,
    activeNavItem,
    setActiveNavItem,
    openedCategory,
    setOpenedCategory,
    categories,
    setCategories,
    pagefindApi,
    setPagefindApi,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    pagefindLoadError,
    setPagefindLoadError,
    navItems,
    setNavItems,
    initialNavItems,
  };

  return singletonState;
}

export default function SidebarFindpage(props) {
  // Use the persistent state
  const state = createPersistentState(props);
  let searchInput;

  // --- Effects ---
  createEffect(() => {
    if (!isServer) {
      state.setActiveNavItem(window.location.pathname);
    }
  });

  // Effect to handle focusing input and loading Pagefind when search opens
  createEffect(() => {
    if (state.isSearchOpen()) {
      searchInput?.focus();
      ensurePagefindLoaded();
      state.setSelectedIndex(state.searchResults().length > 0 ? 0 : -1);
    } else {
      state.setSearchQuery("");
      state.setSearchResults([]);
      state.setSelectedIndex(-1);
      state.setIsSearching(false);
    }
  });

  // Effect to scroll selected result into view
  createEffect(() => {
    if (!isServer && state.isSearchOpen()) {
      const idx = state.selectedIndex();
      if (idx >= 0) {
        const element = document.querySelector(`[data-result-index="${idx}"]`);
        element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  });

  // Effect to trigger debounced search when query changes
  createEffect(() => {
    const query = state.searchQuery().trim();
    if (query.length >= MIN_SEARCH_LENGTH) {
      debouncedSearch(query);
    } else {
      state.setSearchResults([]);
      state.setSelectedIndex(-1);
      state.setIsSearching(false);
    }
  });

  // --- Pagefind Integration ---
  const ensurePagefindLoaded = async () => {
    if (isServer || state.pagefindApi() || state.pagefindLoadError()) return;

    console.log("Attempting to load Pagefind...");
    try {
      // @ts-ignore - Ignore dynamic import path checking
      const pagefindModule = await import(/* @vite-ignore */ PAGEFIND_SCRIPT_PATH);
      const pf = pagefindModule.default || pagefindModule;

      if (pf && typeof pf.search === "function") {
        state.setPagefindApi(() => pf);
        console.log("Pagefind loaded successfully.");
        state.setPagefindLoadError(null);
      } else {
        console.error("Pagefind module loaded, but API not found or invalid.");
        state.setPagefindLoadError("Pagefind loaded incorrectly. Search unavailable.");
        state.setPagefindApi(null);
      }
    } catch (e) {
      console.error("Error loading Pagefind:", e);
      state.setPagefindLoadError("Failed to load search functionality.");
      state.setPagefindApi(null);
    }
  };

  // Debounced search function using Pagefind
  const debouncedSearch = debounce(async (query) => {
    const pf = state.pagefindApi();

    if (!pf) {
      console.warn("Pagefind not loaded yet, search skipped.");
      return;
    }
    if (query.length < MIN_SEARCH_LENGTH) {
      state.setSearchResults([]);
      state.setSelectedIndex(-1);
      state.setIsSearching(false);
      return;
    }

    state.setIsSearching(true);
    state.setSelectedIndex(-1);

    console.log(`Searching Pagefind for: "${query}"`);
    try {
      const search = await pf.search(query);

      if (search.results.length === 0) {
        console.log("No results found.");
        state.setSearchResults([]);
      } else {
        const resultsData = await Promise.all(search.results.map((result) => result.data()));
        console.log(`Found ${resultsData.length} results.`);
        state.setSearchResults(resultsData);
        state.setSelectedIndex(0);
      }
    } catch (e) {
      console.error("Pagefind search error:", e);
      state.setSearchResults([]);
    } finally {
      state.setIsSearching(false);
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
      document.body.style.overflow = "";
    }
  });

  const handleKeyDown = (e) => {
    // Focus search on '/' (if not already in an input)
    if (
      e.key === "/" &&
      !state.isSearchOpen() &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName || "")
    ) {
      e.preventDefault();
      state.setIsSearchOpen(true);
      return;
    }

    // Close modals on Escape
    if (e.key === "Escape") {
      if (state.isSearchOpen()) {
        e.preventDefault();
        state.setIsSearchOpen(false);
      } else if (state.isMobileMenuOpen()) {
        e.preventDefault();
        toggleMobileMenu();
      }
      return;
    }

    // Handle navigation within search results only if search is open
    if (!state.isSearchOpen()) return;

    const results = state.searchResults();
    if (results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        state.setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        state.setSelectedIndex((prev) => {
          const newIndex = prev - 1;
          return newIndex < 0 ? results.length - 1 : newIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        const currentSelection = state.selectedIndex();
        if (currentSelection > -1) {
          const selectedResult = results[currentSelection];
          if (selectedResult?.url && !isServer) {
            console.log("Navigating to:", selectedResult.url);
            window.location.href = selectedResult.url;
            state.setIsSearchOpen(false);
          }
        }
        break;
    }
  };

  // --- Helper Functions ---
  const toggleCategory = (categoryTitle) => {
    state.setOpenedCategory((prev) => (prev === categoryTitle ? null : categoryTitle));
  };

  const toggleSearch = () => {
    state.setIsSearchOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    const nextState = !state.isMobileMenuOpen();
    state.setIsMobileMenuOpen(nextState);
    if (!isServer) {
      document.body.style.overflow = nextState ? "hidden" : "";
    }
  };

  // --- Render ---
  return (
    <>
      {/* Header (Mobile) */}
      <header class="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-gray-800 bg-gray-900 p-4 lg:hidden">
        <div class="flex items-center">
          <div class="mr-2 text-teal-300">
            <a href="/">
              <ZahrawiIcon />
            </a>
          </div>
          <a href="/" class="block text-xl font-bold text-white">
            Zahrawi
          </a>
        </div>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={toggleSearch}
            class="rounded-full p-2 text-gray-300 hover:bg-gray-800"
            aria-label="Open Search"
          >
            <SearchIcon />
          </button>
          <button
            onClick={toggleMobileMenu}
            class="rounded-full p-2 text-gray-300 hover:bg-gray-800"
            aria-label="Toggle Menu"
          >
            <Show when={state.isMobileMenuOpen()} fallback={<MenuIcon />}>
              <CloseIcon />
            </Show>
          </button>
        </div>
      </header>

      {/* Search Overlay - Powered by Pagefind */}
      <div class="flex flex-col pt-16 lg:flex-row lg:pt-0">
        <Show when={state.isSearchOpen()}>
          <div
            class="fixed inset-0 z-50 overflow-y-auto bg-gray-900/90 p-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) toggleSearch();
            }}
          >
            <div class="mx-auto mt-4 max-w-2xl overflow-hidden rounded-lg bg-gray-800 shadow-xl md:mt-16">
              <div class="relative flex items-center border-b border-gray-700">
                <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
                  <SearchIcon />
                </div>
                <input
                  type="search"
                  class="w-full appearance-none border-none bg-transparent py-3 pr-24 pl-12 text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
                  placeholder="Search content..."
                  value={state.searchQuery()}
                  onInput={(e) => state.setSearchQuery(e.currentTarget.value)}
                  ref={searchInput}
                  autocomplete="off"
                  aria-label="Search input"
                />
                <Show when={state.isSearching()}>
                  <div class="absolute inset-y-0 right-16 animate-pulse p-2 text-xs text-gray-400">...</div>
                </Show>
                <button
                  onClick={toggleSearch}
                  class="absolute right-4 text-sm font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Cancel
                </button>
              </div>
              <div
                class="hidden flex-wrap items-center gap-x-3 gap-y-1 px-4 pt-3 pb-2 text-xs text-gray-400 lg:flex"
                aria-hidden="true"
              >
                <span>Navigate:</span>
                <span class="flex items-center gap-1">
                  <Kbd>↑</Kbd> <Kbd>↓</Kbd>
                </span>
                <span>Select:</span> <Kbd>↵</Kbd>
                <span>Close:</span> <Kbd>Esc</Kbd>
              </div>
              <div class="max-h-[60vh] overflow-y-auto md:max-h-[70vh]">
                <Show when={state.pagefindLoadError()}>
                  <div class="p-4 text-center text-red-400">{state.pagefindLoadError()}</div>
                </Show>
                <Show when={state.isSearching() && !state.pagefindLoadError()}>
                  <div class="p-6 text-center text-gray-400">Searching...</div>
                </Show>
                <Show when={!state.isSearching() && !state.pagefindLoadError() && state.searchQuery().trim().length >= MIN_SEARCH_LENGTH}>
                  <Show
                    when={state.searchResults().length > 0}
                    fallback={<div class="p-6 text-center text-gray-400">No results found for "{state.searchQuery()}".</div>}
                  >
                    <div class="px-2 pt-2 pb-1 text-xs text-gray-500">
                      {state.searchResults().length} result{state.searchResults().length === 1 ? "" : "s"}
                    </div>
                    <ul class="divide-y divide-gray-700">
                      <For each={state.searchResults()}>
                        {(item, index) => (
                          <li
                            data-result-index={index()}
                            class={`transition-colors duration-100 ${index() === state.selectedIndex() ? "bg-gray-700/50" : ""
                              }`}
                            onMouseEnter={() => state.setSelectedIndex(index())}
                          >
                            <a href={item.url} class="block p-4 hover:bg-gray-700">
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
                <Show
                  when={
                    !state.isSearching() &&
                    !state.pagefindLoadError() &&
                    state.searchQuery().trim().length > 0 &&
                    state.searchQuery().trim().length < MIN_SEARCH_LENGTH
                  }
                >
                  <div class="p-6 text-center text-gray-400">Please enter at least {MIN_SEARCH_LENGTH} characters.</div>
                </Show>
                <Show when={!state.pagefindLoadError() && state.searchQuery().trim().length === 0}>
                  <div class="p-6 text-center text-gray-500">Start typing to search your content.</div>
                </Show>
              </div>
            </div>
          </div>
        </Show>

        {/* Sidebar Navigation */}
        <aside
          class={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gray-900 text-gray-300 transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 lg:border-r lg:border-gray-800 ${state.isMobileMenuOpen() ? "translate-x-0" : "-translate-x-full"
            } ${state.isMobileMenuOpen() ? "mt-16 lg:mt-0" : "mt-16 lg:mt-0"
            } flex h-screen flex-col lg:h-auto lg:max-h-screen`}
        >
          {/* Desktop Header */}
          <div class="hidden shrink-0 items-center border-b border-gray-800 p-4 lg:flex">
            <div class="mr-2 text-teal-300">
              <ZahrawiIcon />
            </div>
            <a href="/" class="text-xl font-bold text-white">
              Zahrawi
            </a>
            <div class="ml-auto flex items-center gap-2">
              <button
                onClick={toggleSearch}
                class="rounded-full p-2 text-gray-300 hover:bg-gray-800"
                aria-label="Search"
              >
                <SearchIcon />
              </button>
              <Kbd aria-hidden="true">/</Kbd>
              <ThemeToggle />
            </div>
          </div>

          {/* Scrollable Nav Area */}
          <nav class="flex-grow overflow-y-auto p-4">
            <ul class="space-y-2">
              <For each={state.navItems()}>
                {(item) => (
                  <li>
                    <a
                      href={item.href}
                      class={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors duration-150 ${(state.activeNavItem() === item.href ||
                        (item.href !== "/" && state.activeNavItem().startsWith(item.href))) &&
                        item.href !== "#"
                        ? "bg-gray-800 text-white"
                        : "hover:bg-gray-800 hover:text-white"
                        }`}
                      onClick={(e) => {
                        if (item.children) {
                          e.preventDefault();
                          toggleCategory(item.title);
                        } else {
                          if (state.isMobileMenuOpen()) toggleMobileMenu();
                        }
                      }}
                      aria-expanded={item.children ? state.openedCategory() === item.title : undefined}
                      aria-controls={item.children ? `submenu-${item.title.replace(/\s+/g, "-")}` : undefined}
                    >
                      <span class="font-medium">{item.title}</span>
                      <Show when={item.children}>
                        <span
                          class={`transform transition-transform duration-200 ${state.openedCategory() === item.title ? "rotate-180" : ""
                            }`}
                        >
                          <ChevronDownIcon />
                        </span>
                      </Show>
                    </a>

                    <Show when={item.children && state.openedCategory() === item.title}>
                      <ul
                        class="mt-2 ml-4 space-y-1 border-l border-gray-700 pl-3"
                        id={`submenu-${item.title.replace(/\s+/g, "-")}`}
                      >
                        <For each={item.children}>
                          {(child) => (
                            <li>
                              <a
                                href={child.href}
                                class={`block rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${state.activeNavItem() === child.href
                                  ? "bg-gray-700 text-white"
                                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                  }`}
                                onClick={() => {
                                  if (state.isMobileMenuOpen()) toggleMobileMenu();
                                }}
                              >
                                {child.title}
                              </a>
                            </li>
                          )}
                        </For>
                      </ul>
                    </Show>
                  </li>
                )}
              </For>
            </ul>

            {/* Bookmarks Section */}
            <div class="mt-auto border-t border-gray-800">
              <BookmarksList />
            </div>
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        <Show when={state.isMobileMenuOpen()}>
          <div class="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={toggleMobileMenu} aria-hidden="true" />
        </Show>
      </div>
    </>
  );
}

// import { createSignal, createEffect, For, Show, onMount, onCleanup } from "solid-js";
// import { isServer } from "solid-js/web";
// import BookmarksList from "./BookmarkList";
//
// // --- Icon Components (keep as they are) ---
// const ChevronDownIcon = () => (
//   <svg class="h-5 w-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
//     <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
//   </svg>
// );
// const SearchIcon = () => (
//   <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
//     <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//   </svg>
// );
// const MenuIcon = () => (
//   <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
//     <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
//   </svg>
// );
// const CloseIcon = () => (
//   <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
//     <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
//   </svg>
// );
// const ZahrawiIcon = () => (
//   <svg class="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
//     <path
//       stroke-linecap="round"
//       stroke-linejoin="round"
//       d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
//     />
//   </svg>
// );
// const FileIcon = () => (
//   <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
//     <path
//       stroke-linecap="round"
//       stroke-linejoin="round"
//       d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//     />
//   </svg>
// );
// // --- End Icon Components ---
//
// interface NavItem {
//   title: string;
//   href: string;
//   icon?: string;
//   children?: NavItem[];
//   isOpen?: boolean;
// }
//
// // Interface for Pagefind result data (adjust based on your indexed metadata)
// interface PagefindResultData {
//   url: string;
//   meta: {
//     title: string;
//     // Add other metadata fields you index (e.g., image, description)
//     // image?: string;
//   };
//   excerpt: string; // Pagefind generates this with highlighted terms
//   // You might get other fields depending on your indexing config
//   // e.g., word_count, sub_results if using content chunking
// }
//
// interface Props {
//   categories: { title: string; href: string }[];
// }
//
// // --- Keyboard Key Hint Component ---
// const Kbd = (props: { children: any; class?: string }) => (
//   <kbd
//     class={`inline-flex items-center justify-center rounded border border-gray-600 bg-gray-700 px-1.5 py-0.5 text-xs font-semibold text-gray-300 ${props.class ?? ""}`}
//   >
//     {props.children}
//   </kbd>
// );
//
// // --- Utility Functions ---
//
// // Simple debounce function
// function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
//   let timeout: number | undefined;
//   return (...args: Parameters<T>) => {
//     clearTimeout(timeout);
//     timeout = window.setTimeout(() => {
//       func(...args);
//     }, wait);
//   };
// }
//
// function createNavItems(categories: { title: string; href: string }[]): NavItem[] {
//   return categories.map((cat) => {
//     return ({
//       title: cat.title,
//       // href: `/${title.toLowerCase().replace(/\s+/g, "-")}`, // Assuming category pages exist
//       href: cat.href,
//     })
//   }
//   );
//
// }
//
// // --- Constants ---
// const PAGEFIND_SCRIPT_PATH = "/pagefind/pagefind.js";
// const MIN_SEARCH_LENGTH = 2;
// const SEARCH_DEBOUNCE_MS = 300;
//
//
// export default function Sidebar(props: Props) {
//   const [isSearchOpen, setIsSearchOpen] = createSignal(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
//   const [searchQuery, setSearchQuery] = createSignal("");
//   const [selectedIndex, setSelectedIndex] = createSignal(-1);
//   const [activeNavItem, setActiveNavItem] = createSignal<string>("/");
//   const [openedCategory, setOpenedCategory] = createSignal<string | null>(null);
//
//   // --- Pagefind State ---
//   const [pagefindApi, setPagefindApi] = createSignal<any>(null); // Holds the loaded Pagefind API object
//   const [searchResults, setSearchResults] = createSignal<PagefindResultData[]>([]);
//   const [isSearching, setIsSearching] = createSignal(false);
//   const [pagefindLoadError, setPagefindLoadError] = createSignal<string | null>(null);
//   // --- End Pagefind State ---
//
//   const initialNavItems = (): NavItem[] => [
//     { title: "Home Page", href: "/" },
//     {
//       title: "Categories",
//       href: "#", // Non-navigating parent
//       isOpen: false,
//       children: createNavItems(props.categories),
//     },
//     { title: "Blog", href: "/blog" },
//     { title: "About", href: "/about" },
//   ];
//
//   const [navItems] = createSignal(initialNavItems());
//   let searchInput: HTMLInputElement | undefined;
//
//   // --- Effects ---
//   createEffect(() => {
//     if (!isServer) {
//       setActiveNavItem(window.location.pathname);
//     }
//   });
//
//   // Effect to handle focusing input and loading Pagefind when search opens
//   createEffect(() => {
//     if (isSearchOpen()) {
//       searchInput?.focus();
//       ensurePagefindLoaded(); // Attempt to load Pagefind if not already loaded
//       // Reset index when opening
//       setSelectedIndex(searchResults().length > 0 ? 0 : -1);
//     } else {
//       // Clear results and query when search is closed
//       setSearchQuery("");
//       setSearchResults([]);
//       setSelectedIndex(-1);
//       setIsSearching(false); // Ensure loading state is reset
//     }
//   });
//
//   // Effect to scroll selected result into view
//   createEffect(() => {
//     if (!isServer && isSearchOpen()) {
//       // Only scroll when search is open
//       const idx = selectedIndex();
//       if (idx >= 0) {
//         const element = document.querySelector(`[data-result-index="${idx}"]`);
//         element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
//       }
//     }
//   });
//
//   // Effect to trigger debounced search when query changes
//   createEffect(() => {
//     const query = searchQuery().trim();
//     if (query.length >= MIN_SEARCH_LENGTH) {
//       debouncedSearch(query);
//     } else {
//       // Clear results if query becomes too short
//       setSearchResults([]);
//       setSelectedIndex(-1);
//       setIsSearching(false); // Stop any ongoing search indication
//     }
//   });
//
//   // --- Pagefind Integration ---
//
//   // Function to load the Pagefind script if it hasn't been loaded yet
//   const ensurePagefindLoaded = async () => {
//     if (isServer || pagefindApi() || pagefindLoadError()) return; // Already loaded, errored, or on server
//
//     console.log("Attempting to load Pagefind...");
//     try {
//       // @ts-ignore - Ignore dynamic import path checking
//       const pagefindModule = await import(/* @vite-ignore */ PAGEFIND_SCRIPT_PATH);
//       // Pagefind typically exposes its API directly as the default export or the module itself
//       const pf = pagefindModule.default || pagefindModule;
//
//       if (pf && typeof pf.search === "function") {
//         setPagefindApi(() => pf); // Store the API object in state
//         console.log("Pagefind loaded successfully.");
//         setPagefindLoadError(null); // Clear any previous error
//       } else {
//         // This case might happen if the import resolves but doesn't contain the expected API
//         console.error("Pagefind module loaded, but API not found or invalid.");
//         setPagefindLoadError("Pagefind loaded incorrectly. Search unavailable.");
//         setPagefindApi(null); // Ensure API state is null
//       }
//     } catch (e) {
//       console.error("Error loading Pagefind:", e);
//       setPagefindLoadError("Failed to load search functionality.");
//       setPagefindApi(null); // Ensure API state is null
//     }
//   };
//
//   // Debounced search function using Pagefind
//   const debouncedSearch = debounce(async (query: string) => {
//     const pf = pagefindApi();
//
//     // Ensure Pagefind is loaded and query is valid before searching
//     if (!pf) {
//       console.warn("Pagefind not loaded yet, search skipped.");
//       // Optionally, try loading again here, though the effect on open should handle it
//       // await ensurePagefindLoaded();
//       // pf = pagefindApi(); // Re-check after loading attempt
//       // if (!pf) return;
//       return; // Skip search if still not loaded
//     }
//     if (query.length < MIN_SEARCH_LENGTH) {
//       setSearchResults([]);
//       setSelectedIndex(-1);
//       setIsSearching(false);
//       return;
//     }
//
//     setIsSearching(true);
//     setSelectedIndex(-1); // Reset selection during search
//
//     console.log(`Searching Pagefind for: "${query}"`);
//     try {
//       // Perform the search
//       const search = await pf.search(query);
//
//       if (search.results.length === 0) {
//         console.log("No results found.");
//         setSearchResults([]);
//       } else {
//         // Pagefind returns stubs, fetch full data for each result
//         const resultsData = await Promise.all(search.results.map((result: any) => result.data()));
//         console.log(`Found ${resultsData.length} results.`);
//         setSearchResults(resultsData as PagefindResultData[]);
//         setSelectedIndex(0); // Select the first result by default
//       }
//     } catch (e) {
//       console.error("Pagefind search error:", e);
//       setSearchResults([]); // Clear results on error
//       // Consider showing an error message to the user
//     } finally {
//       setIsSearching(false);
//     }
//   }, SEARCH_DEBOUNCE_MS); // Debounce interval
//
//   // --- End Pagefind Integration ---
//
//   // --- Event Handlers ---
//
//   onMount(() => {
//     if (!isServer) {
//       document.addEventListener("keydown", handleKeyDown);
//     }
//   });
//
//   onCleanup(() => {
//     if (!isServer) {
//       document.removeEventListener("keydown", handleKeyDown);
//       // Clear body overflow style if component unmounts while mobile menu is open
//       document.body.style.overflow = "";
//     }
//   });
//
//   const handleKeyDown = (e: KeyboardEvent) => {
//     // Focus search on '/' (if not already in an input)
//     if (
//       e.key === "/" &&
//       !isSearchOpen() &&
//       !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName || "")
//     ) {
//       e.preventDefault();
//       setIsSearchOpen(true);
//       return;
//     }
//
//     // Close modals on Escape
//     if (e.key === "Escape") {
//       if (isSearchOpen()) {
//         e.preventDefault();
//         setIsSearchOpen(false); // Triggers effect to clear search state
//       } else if (isMobileMenuOpen()) {
//         e.preventDefault();
//         toggleMobileMenu();
//       }
//       return;
//     }
//
//     // Handle navigation within search results only if search is open
//     if (!isSearchOpen()) return;
//
//     const results = searchResults();
//     if (results.length === 0) return; // No results to navigate
//
//     switch (e.key) {
//       case "ArrowDown":
//         e.preventDefault();
//         setSelectedIndex((prev) => (prev + 1) % results.length);
//         break;
//       case "ArrowUp":
//         e.preventDefault();
//         setSelectedIndex((prev) => {
//           const newIndex = prev - 1;
//           return newIndex < 0 ? results.length - 1 : newIndex;
//         });
//         break;
//       case "Enter":
//         e.preventDefault();
//         const currentSelection = selectedIndex();
//         if (currentSelection > -1) {
//           const selectedResult = results[currentSelection];
//           if (selectedResult?.url && !isServer) {
//             console.log("Navigating to:", selectedResult.url);
//             window.location.href = selectedResult.url; // Navigate to the result URL
//             // Optionally close search after navigation
//             setIsSearchOpen(false);
//           }
//         }
//         break;
//     }
//   };
//
//   // --- Helper Functions ---
//   const toggleCategory = (categoryTitle: string) => {
//     setOpenedCategory((prev) => (prev === categoryTitle ? null : categoryTitle));
//   };
//
//   const toggleSearch = () => {
//     setIsSearchOpen((prev) => !prev);
//     // Effect handles clearing/loading state
//   };
//
//   const toggleMobileMenu = () => {
//     const nextState = !isMobileMenuOpen();
//     setIsMobileMenuOpen(nextState);
//     if (!isServer) {
//       // Prevent body scroll when mobile menu is open
//       document.body.style.overflow = nextState ? "hidden" : "";
//     }
//   };
//
//   // --- Render ---
//   return (
//     <>
//       {/* Header (Mobile) */}
//       <header class="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-gray-800 bg-gray-900 p-4 lg:hidden">
//         <div class="flex items-center">
//           <div class="mr-2 text-teal-300">
//             <a href="/">
//               <ZahrawiIcon />
//             </a>
//           </div>
//           <a href="/" class="block text-xl font-bold text-white">
//             Zahrawi
//           </a>
//         </div>
//         <div class="flex items-center gap-2">
//           <button
//             onClick={toggleSearch}
//             class="rounded-full p-2 text-gray-300 hover:bg-gray-800"
//             aria-label="Open Search"
//           >
//             <SearchIcon />
//           </button>
//           <button
//             onClick={toggleMobileMenu}
//             class="rounded-full p-2 text-gray-300 hover:bg-gray-800"
//             aria-label="Toggle Menu"
//           >
//             <Show when={isMobileMenuOpen()} fallback={<MenuIcon />}>
//               <CloseIcon />
//             </Show>
//           </button>
//         </div>
//       </header>
//
//       {/* Search Overlay - Powered by Pagefind */}
//       <div class="flex flex-col pt-16 lg:flex-row lg:pt-0">
//         <Show when={isSearchOpen()}>
//           <div
//             class="fixed inset-0 z-50 overflow-y-auto bg-gray-900/90 p-4 backdrop-blur-sm"
//             onClick={(e) => {
//               if (e.target === e.currentTarget) toggleSearch();
//             }}
//           >
//             {" "}
//             {/* Close on overlay click */}
//             <div class="mx-auto mt-4 max-w-2xl overflow-hidden rounded-lg bg-gray-800 shadow-xl md:mt-16">
//               {" "}
//               {/* Container for better styling */}
//               <div class="relative flex items-center border-b border-gray-700">
//                 <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
//                   {" "}
//                   {/* Adjusted padding */}
//                   <SearchIcon />
//                 </div>
//                 <input
//                   type="search"
//                   class="w-full appearance-none border-none bg-transparent py-3 pr-24 pl-12 text-white placeholder-gray-400 focus:ring-0 focus:outline-none" // Simplified input style
//                   placeholder="Search content..."
//                   value={searchQuery()}
//                   onInput={(e) => setSearchQuery(e.currentTarget.value)}
//                   ref={searchInput}
//                   autocomplete="off"
//                   aria-label="Search input"
//                 />
//                 {/* Loading Spinner (optional, simple text for now) */}
//                 <Show when={isSearching()}>
//                   <div class="absolute inset-y-0 right-16 animate-pulse p-2 text-xs text-gray-400">...</div>
//                 </Show>
//                 {/* Cancel Button */}
//                 <button
//                   onClick={toggleSearch}
//                   class="absolute right-4 text-sm font-medium text-indigo-400 hover:text-indigo-300"
//                 >
//                   Cancel
//                 </button>
//               </div>
//               {/* Keyboard Hints - MODIFIED: Add hidden lg:flex */}
//               <div
//                 class="hidden flex-wrap items-center gap-x-3 gap-y-1 px-4 pt-3 pb-2 text-xs text-gray-400 lg:flex"
//                 aria-hidden="true"
//               >
//                 <span>Navigate:</span>
//                 <span class="flex items-center gap-1">
//                   {" "}
//                   <Kbd>↑</Kbd> <Kbd>↓</Kbd>{" "}
//                 </span>
//                 <span>Select:</span> <Kbd>↵</Kbd>
//                 <span>Close:</span> <Kbd>Esc</Kbd>
//               </div>
//               {/* Results Area */}
//               <div class="max-h-[60vh] overflow-y-auto md:max-h-[70vh]">
//                 {" "}
//                 {/* Constrain height */}
//                 {/* Error loading Pagefind */}
//                 <Show when={pagefindLoadError()}>
//                   <div class="p-4 text-center text-red-400">{pagefindLoadError()}</div>
//                 </Show>
//                 {/* Loading Search Results */}
//                 <Show when={isSearching() && !pagefindLoadError()}>
//                   <div class="p-6 text-center text-gray-400">Searching...</div>
//                 </Show>
//                 {/* Search Results Display */}
//                 <Show when={!isSearching() && !pagefindLoadError() && searchQuery().trim().length >= MIN_SEARCH_LENGTH}>
//                   <Show
//                     when={searchResults().length > 0}
//                     fallback={<div class="p-6 text-center text-gray-400">No results found for "{searchQuery()}".</div>}
//                   >
//                     <div class="px-2 pt-2 pb-1 text-xs text-gray-500">
//                       {searchResults().length} result{searchResults().length === 1 ? "" : "s"}
//                     </div>
//                     <ul class="divide-y divide-gray-700">
//                       <For each={searchResults()}>
//                         {(item, index) => (
//                           <li
//                             data-result-index={index()}
//                             // Use outline for focus visibility which works better with rounded corners
//                             class={`transition-colors duration-100 ${index() === selectedIndex() ? "bg-gray-700/50" : ""
//                               }`}
//                             onMouseEnter={() => setSelectedIndex(index())}
//                           >
//                             <a href={item.url} class="block p-4 hover:bg-gray-700">
//                               <div class="flex items-start gap-3 text-white">
//                                 <div class="mt-1 shrink-0 text-gray-500">
//                                   <FileIcon />
//                                 </div>
//                                 <div class="flex-1 overflow-hidden">
//                                   {" "}
//                                   {/* Allow text to wrap */}
//                                   <span class="mb-1 block truncate font-medium">
//                                     {item.meta.title || "Untitled Page"}
//                                   </span>
//                                   {/* Render Pagefind excerpt with highlights */}
//                                   <div
//                                     class="search-excerpt line-clamp-2 text-sm text-gray-400"
//                                     // WARNING: Only use innerHTML if you trust the source indexed by Pagefind.
//                                     // Pagefind itself generates safe HTML (<mark> tags), but ensure your source content is safe.
//                                     innerHTML={item.excerpt}
//                                   />
//                                 </div>
//                               </div>
//                             </a>
//                           </li>
//                         )}
//                       </For>
//                     </ul>
//                   </Show>
//                 </Show>
//                 {/* Prompt to type more */}
//                 <Show
//                   when={
//                     !isSearching() &&
//                     !pagefindLoadError() &&
//                     searchQuery().trim().length > 0 &&
//                     searchQuery().trim().length < MIN_SEARCH_LENGTH
//                   }
//                 >
//                   <div class="p-6 text-center text-gray-400">Please enter at least {MIN_SEARCH_LENGTH} characters.</div>
//                 </Show>
//                 {/* Initial state / empty query */}
//                 <Show when={!pagefindLoadError() && searchQuery().trim().length === 0}>
//                   <div class="p-6 text-center text-gray-500">Start typing to search your content.</div>
//                 </Show>
//               </div>
//             </div>
//           </div>
//         </Show>
//
//         {/* Sidebar Navigation */}
//         <aside
//           class={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gray-900 text-gray-300 transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 lg:border-r lg:border-gray-800 ${isMobileMenuOpen() ? "translate-x-0" : "-translate-x-full"
//             } ${isMobileMenuOpen() ? "mt-16 lg:mt-0" : "mt-16 lg:mt-0"} flex h-screen flex-col lg:h-auto lg:max-h-screen`}
//         >
//           {/* Desktop Header */}
//           <div class="hidden shrink-0 items-center border-b border-gray-800 p-4 lg:flex">
//             <div class="mr-2 text-teal-300">
//               <ZahrawiIcon />
//             </div>
//             <a href="/" class="text-xl font-bold text-white">
//               Zahrawi
//             </a>
//             <div class="ml-auto flex items-center gap-2">
//               {/* Wrap button and hint */}
//               <button
//                 onClick={toggleSearch}
//                 class="rounded-full p-2 text-gray-300 hover:bg-gray-800"
//                 aria-label="Search"
//               >
//                 <SearchIcon />
//               </button>
//               {/* Hint for desktop search shortcut */}
//               <Kbd aria-hidden="true">/</Kbd>
//             </div>
//           </div>
//
//           {/* Scrollable Nav Area */}
//
//           <nav class="flex-grow overflow-y-auto p-4">
//             {/* ... rest of the navigation UL/For logic ... */}
//             <ul class="space-y-2">
//               <For each={navItems()}>
//                 {(item) => (
//                   <li>
//                     <a
//                       href={item.href}
//                       class={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors duration-150 ${(activeNavItem() === item.href || (item.href !== "/" && activeNavItem().startsWith(item.href))) &&
//                         item.href !== "#"
//                         ? "bg-gray-800 text-white"
//                         : "hover:bg-gray-800 hover:text-white"
//                         }`}
//                       onClick={(e) => {
//                         if (item.children) {
//                           e.preventDefault();
//                           toggleCategory(item.title);
//                         } else {
//                           if (isMobileMenuOpen()) toggleMobileMenu();
//                         }
//                       }}
//                       aria-expanded={item.children ? openedCategory() === item.title : undefined}
//                       aria-controls={item.children ? `submenu-${item.title.replace(/\s+/g, "-")}` : undefined}
//                     >
//                       <span class="font-medium">{item.title}</span>
//                       <Show when={item.children}>
//                         <span
//                           class={`transform transition-transform duration-200 ${openedCategory() === item.title ? "rotate-180" : ""}`}
//                         >
//                           <ChevronDownIcon />
//                         </span>
//                       </Show>
//                     </a>
//
//                     <Show when={item.children && openedCategory() === item.title}>
//                       <ul
//                         class="mt-2 ml-4 space-y-1 border-l border-gray-700 pl-3"
//                         id={`submenu-${item.title.replace(/\s+/g, "-")}`}
//                       >
//                         <For each={item.children}>
//                           {(child) => (
//                             <li>
//                               <a
//                                 href={child.href}
//                                 class={`block rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${activeNavItem() === child.href
//                                   ? "bg-gray-700 text-white"
//                                   : "text-gray-400 hover:bg-gray-700 hover:text-white"
//                                   }`}
//                                 onClick={() => {
//                                   if (isMobileMenuOpen()) toggleMobileMenu();
//                                 }}
//                               >
//                                 {child.title}
//                               </a>
//                             </li>
//                           )}
//                         </For>
//                       </ul>
//                     </Show>
//                   </li>
//                 )}
//               </For>
//             </ul>
//
//             {/* Bookmarks Section */}
//
//             <div class="mt-auto border-t border-gray-800">
//               <BookmarksList />
//             </div>
//
//             {/* 
//
//                */}
//           </nav>
//         </aside>
//
//         {/* Mobile Menu Overlay */}
//         <Show when={isMobileMenuOpen()}>
//           <div class="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={toggleMobileMenu} aria-hidden="true" />
//         </Show>
//       </div>
//     </>
//   );
// }
//
// // Add this CSS to your global stylesheet for the highlights
// /*
// .search-excerpt mark {
//   background-color: #a7f3d0; // Tailwind green-200
//   color: #065f46; // Tailwind green-800
//   font-weight: 600; // semibold
//   padding: 0 2px;
//   border-radius: 2px;
// }
//
// [data-theme="dark"] .search-excerpt mark { // Example for dark theme
//   background-color: #34d399; // Tailwind green-400
//   color: #064e3b; // Tailwind green-900
// }
// */
//
// // {/* Clear Button */}
// // <Show when={searchQuery().length > 0 && !isSearching()}>
// //   <button
// //     onClick={() => {
// //       setSearchQuery("");
// //       searchInput?.focus();
// //     }}
// //     class="absolute inset-y-0 right-16 p-2 text-gray-400 hover:text-white" // Adjusted position
// //     aria-label="Clear search"
// //   >
// //     <CloseIcon />
// //   </button>
// // </Show>
