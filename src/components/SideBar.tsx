import { createSignal, createEffect, For, Show, onMount, onCleanup, createMemo } from "solid-js";
import { isServer } from "solid-js/web";
import type { Index as FlexSearchIndex } from "flexsearch"; // Import type
import BookmarksList from "./BookmarkList";
import type { Item } from "../types";

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

// --- Interfaces ---
interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

interface Props {
  categories: string[];
  searchList: Item[];
}

// --- Keyboard Key Hint Component ---
const Kbd = (props: { children: any; class?: string }) => (
  <kbd
    class={`inline-flex items-center justify-center rounded border border-gray-600 bg-gray-700 px-1.5 py-0.5 text-xs font-semibold text-gray-300 ${props.class ?? ""}`}
  >
    {props.children}
  </kbd>
);

// --- Utility Functions ---

// Simple debounce function
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Generates navigation items for categories
// !! ADJUST THE HREF PATH AS NEEDED for your routing !!
const createCategoryNavItems = (titles: string[]): NavItem[] =>
  titles.map((title) => {
    const slug = title.toLowerCase().replace(/\s+/g, "-");
    return {
      title: title,
      href: `/${slug}`, // Example path structure
    };
  });

// --- Component ---
export default function Sidebar(props: Props) {
  // --- State Signals ---
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = createSignal("");
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const [activeNavItem, setActiveNavItem] = createSignal<string>("/");
  const [openedCategory, setOpenedCategory] = createSignal<string | null>(null);

  // FlexSearch Index Signals (Typed)
  const [titleIndex, setTitleIndex] = createSignal<FlexSearchIndex<number> | null>(null);
  const [descriptionIndex, setDescriptionIndex] = createSignal<FlexSearchIndex<number> | null>(null);

  // Search Results - Initialized with the full list
  const [searchResults, setSearchResults] = createSignal<Item[]>(props.searchList || []);

  // --- Derived State / Constants ---

  // Static Navigation Items (Calculated once)
  const navItems = createMemo((): NavItem[] => [
    { title: "Home Page", href: "/" },
    {
      title: "Categories",
      href: "#", // Non-navigating parent
      children: createCategoryNavItems(props.categories || []),
    },
    { title: "Blog", href: "/blog" },
    { title: "About", href: "/about" },
    { title: "Resources", href: "/resources" },
  ]);

  // Ref for search input
  let searchInputRef: HTMLInputElement | undefined;

  // --- Effects ---

  // Initialize FlexSearch
  onMount(async () => {
    // Guard against running heavy logic unnecessarily
    if (isServer || !props.searchList || props.searchList.length === 0) return;

    try {
      // Dynamically import FlexSearch on the client
      const FlexSearch = (await import("flexsearch")).default;

      // Create indexes
      const titleIdx = new FlexSearch.Index<number>({
        preset: "match",
        tokenize: "forward",
        // Consider adding context for better relevance: context: true, resolution: 9
      });
      const descriptionIdx = new FlexSearch.Index<number>({
        preset: "match",
        tokenize: "forward",
        // Consider adding context: context: true, resolution: 9
      });

      // Add items to the indexes
      props.searchList.forEach((item, idx) => {
        if (item && item.title) {
          // Add checks for data integrity
          titleIdx.add(idx, item.title);
        }
        if (item && item.description) {
          descriptionIdx.add(idx, item.description);
        }
      });

      // Store indexes in signals
      setTitleIndex(titleIdx);
      setDescriptionIndex(descriptionIdx);

      console.log("FlexSearch indexes initialized.");
    } catch (error) {
      console.error("Failed to initialize FlexSearch:", error);
      // Handle initialization error (e.g., show a message)
    }
  });

  // Update active nav item based on current path (on initial load)
  // Note: This doesn't handle client-side navigation updates automatically.
  // Astro's link components might offer better active state handling.
  createEffect(() => {
    if (!isServer) {
      setActiveNavItem(window.location.pathname);
    }
  });

  // Debounce search query
  const debouncedSetQuery = debounce((value: string) => {
    setDebouncedSearchQuery(value);
  }, 250); // Adjust debounce time (ms) as needed

  createEffect(() => {
    const currentQuery = searchQuery();
    debouncedSetQuery(currentQuery);
  });

  // Perform Search when debounced query changes
  createEffect(() => {
    const term = debouncedSearchQuery().trim();
    const tIndex = titleIndex();
    const dIndex = descriptionIndex();

    // Ensure indexes are ready and list exists
    if (isServer || !tIndex || !dIndex || !props.searchList) {
      setSearchResults(props.searchList || []); // Reset or show initial list
      return;
    }

    if (term === "") {
      setSearchResults(props.searchList); // Show all items if search is empty
      setSelectedIndex(-1);
      return;
    }

    // Perform search on both indexes
    const titleResults = tIndex.search(term) as number[]; // Cast result if needed
    const descResults = dIndex.search(term) as number[];

    // Combine and deduplicate result indexes
    const resultIndexes = [...new Set([...titleResults, ...descResults])];

    // Map indexes back to original items from props.searchList
    const results = resultIndexes.map((idx) => props.searchList[idx]).filter((item) => !!item); // Filter out potential undefined items if indexes are somehow out of sync

    setSearchResults(results);
    setSelectedIndex(results.length > 0 ? 0 : -1); // Reset selection index
  });

  // Focus search input when opened & Reset selection
  createEffect(() => {
    if (isSearchOpen() && searchInputRef) {
      searchInputRef.focus();
    }
    // Reset index when search opens/closes or results change significantly
    if (!isSearchOpen() || searchResults().length === 0) {
      setSelectedIndex(-1);
    } else if (selectedIndex() >= searchResults().length) {
      // If selection is out of bounds after search, reset to 0 or -1
      setSelectedIndex(searchResults().length > 0 ? 0 : -1);
    }
  });

  // Scroll selected search result into view
  createEffect(() => {
    if (isServer || !isSearchOpen()) return;

    const idx = selectedIndex();
    if (idx >= 0) {
      // Use a more specific selector if possible
      const element = document.querySelector(`[data-result-index="${idx}"]`);
      element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });

  // --- Keyboard Event Handling ---
  const handleKeyDown = (e: KeyboardEvent) => {
    // Open search with '/'
    if (
      e.key === "/" &&
      !isSearchOpen() &&
      document.activeElement?.tagName !== "INPUT" &&
      document.activeElement?.tagName !== "TEXTAREA"
    ) {
      e.preventDefault();
      setIsSearchOpen(true);
      return;
    }

    // Close search with 'Escape'
    if (e.key === "Escape" && isSearchOpen()) {
      e.preventDefault();
      setIsSearchOpen(false);
      return;
    }

    // Keyboard navigation within search results
    if (!isSearchOpen()) return;

    const results = searchResults();
    if (results.length === 0) return; // No results to navigate

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        const currentSelection = selectedIndex();
        if (currentSelection > -1) {
          const selectedItem = results[currentSelection];
          if (selectedItem && selectedItem.href && !isServer) {
            // Consider using Astro's navigate() for SPA transitions
            window.location.href = selectedItem.href;
            setIsSearchOpen(false); // Close search on navigation
          }
        }
        break;
    }
  };

  // Add/Remove Global Keydown Listener
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

  // --- Helper Functions ---

  const toggleCategory = (categoryTitle: string) => {
    setOpenedCategory((prev) => (prev === categoryTitle ? null : categoryTitle));
  };

  const toggleSearch = () => {
    const nextState = !isSearchOpen();
    setIsSearchOpen(nextState);
    if (!nextState) {
      // Reset search state when closing
      setSearchQuery("");
      setDebouncedSearchQuery(""); // Important to reset debounced value too
      setSearchResults(props.searchList || []); // Reset results
      setSelectedIndex(-1);
    }
  };

  const toggleMobileMenu = () => {
    const nextState = !isMobileMenuOpen();
    setIsMobileMenuOpen(nextState);
    if (!isServer) {
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = nextState ? "hidden" : "";
    }
  };
  return (
    <div class="flex flex-col lg:flex-row">

      {/* Header (Mobile) */}
      <header class="fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b border-gray-800 bg-gray-900 p-4 lg:hidden">
        <div class="flex items-center">
          <div class="mr-2 text-teal-300">
            <ZahrawiIcon />
          </div>
          <a href="/" class="block text-xl font-bold text-white">
            Zahrawi
          </a>
        </div>
        <div class="flex items-center gap-2">
          <button
            onClick={toggleSearch}
            class="rounded-full p-2 text-gray-300 hover:bg-gray-800"
            aria-label="Open Search"
          >
            <SearchIcon />
          </button>
          {/* MODIFIED: Hide completely below lg breakpoint */}
          <Kbd class="hidden" aria-hidden="true"> {/* <-- Just 'hidden' */}
            /
          </Kbd>
          <button
            onClick={toggleMobileMenu}
            class="rounded-full p-2 text-gray-300 hover:bg-gray-800"
            aria-label="Toggle Menu"
          >
            <Show when={isMobileMenuOpen()} fallback={<MenuIcon />}>
              <CloseIcon />
            </Show>
          </button>
        </div>
      </header>
      {/* Search Overlay */}
      <Show when={isSearchOpen()}>
        <div
          class="fixed inset-0 z-50 bg-gray-900/95 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) toggleSearch();
          }}
        >
          <div class="mx-auto mt-16 max-w-2xl rounded-lg bg-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div class="relative flex items-center border-b border-gray-700 p-4">
              {/* ... input, icons, cancel button ... */}
              <div class="pointer-events-none absolute inset-y-0 left-3 flex items-center pl-4">
                <SearchIcon />
              </div>
              <input
                ref={searchInputRef}
                type="search"
                class="w-full rounded-full border border-gray-600 bg-gray-700 py-2 pr-24 pl-10 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Search content..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                aria-label="Search Input"
                aria-controls="search-results-list"
              />
              <Show when={searchQuery()}>
                <button
                  onClick={() => setSearchQuery("")}
                  class="absolute inset-y-0 right-[calc(3.5rem+8px)] p-2 text-gray-400 hover:text-white"
                  aria-label="Clear search"
                >
                  <CloseIcon />
                </button>
              </Show>
              <button
                onClick={toggleSearch}
                class="absolute right-3 px-3 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                Cancel
              </button>
            </div>
            {/* Keyboard Hints - MODIFIED: Add hidden lg:flex */}
            <div
              class="hidden flex-wrap items-center gap-x-3 gap-y-1 px-4 pt-3 pb-2 text-xs text-gray-400 lg:flex"
              aria-hidden="true"
            >
              <span>Navigate:</span>
              <span class="flex items-center gap-1">
                {" "}
                <Kbd>↑</Kbd> <Kbd>↓</Kbd>{" "}
              </span>
              <span>Select:</span> <Kbd>↵</Kbd>
              <span>Close:</span> <Kbd>Esc</Kbd>
            </div>

            {/* Search Results Area */}
            <div
              class="max-h-[calc(80vh-10rem)] overflow-y-auto p-4 pt-0 lg:max-h-[calc(80vh-8rem)]"
              id="search-results-list"
              role="listbox"
              aria-label="Search Results"
            >
              <Show
                when={debouncedSearchQuery().trim() !== ""}
                fallback={
                  <div class="py-4 text-center text-gray-400">
                    Start typing to search...
                    {/* MODIFIED: Wrap Kbd hints in span hidden below lg */}
                    <span class="hidden lg:inline">
                      {" "}
                      Press <Kbd>/</Kbd> to search, <Kbd>Esc</Kbd> to close.
                    </span>
                  </div>
                }
              >
                <div class="mb-2 text-sm text-gray-400">
                  {searchResults().length} {searchResults().length === 1 ? "result" : "results"} for "
                  {debouncedSearchQuery()}"
                </div>
                <Show
                  when={searchResults().length > 0}
                  fallback={<div class="py-4 text-center text-gray-400">No results found.</div>}
                >
                  <div class="space-y-1">
                    <For each={searchResults()}>
                      {(item, index) => (
                        <a
                          href={item.href}
                          role="option"
                          aria-selected={index() === selectedIndex()}
                          data-result-index={index()}
                          class={`block rounded-lg p-3 transition-colors duration-150 ${
                            index() === selectedIndex()
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                          }`}
                          onClick={() => {
                            setIsSearchOpen(false);
                          }}
                          onMouseEnter={() => setSelectedIndex(index())}
                        >
                          <div class="flex items-center gap-3">
                            <FileIcon />
                            <span class="font-medium">{item.title}</span>
                          </div>
                          <Show when={item.description}>
                            <div
                              class={`mt-1 pl-8 text-sm ${index() === selectedIndex() ? "text-indigo-100" : "text-gray-400"}`}
                            >
                              <p class="line-clamp-2">{item.description}</p>
                            </div>
                          </Show>
                        </a>
                      )}
                    </For>
                  </div>
                </Show>
              </Show>
            </div>
          </div>
        </div>
      </Show>

      {/* Sidebar Navigation */}
      <aside
        class={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gray-900 text-gray-300 transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 lg:border-r lg:border-gray-800 ${
          isMobileMenuOpen() ? "translate-x-0" : "-translate-x-full"
        } ${isMobileMenuOpen() ? "mt-16 lg:mt-0" : "mt-16 lg:mt-0"} flex h-screen flex-col lg:h-auto lg:max-h-screen`}
      >
        {/* Desktop Header */}
        <div class="hidden items-center border-b border-gray-800 p-4 lg:flex">
          <div class="mr-2 text-teal-300">
            <ZahrawiIcon />
          </div>
          <a href="/" class="text-xl font-bold text-white">
            Zahrawi
          </a>
          {/* Desktop Search Trigger + Hint */}
          <div class="ml-auto flex items-center gap-2">
            <button
              onClick={toggleSearch}
              class="rounded-full p-2 text-gray-300 hover:bg-gray-800"
              aria-label="Open Search"
            >
              <SearchIcon />
            </button>
            {/* Add '/' hint for desktop */}
            <Kbd aria-hidden="true">/</Kbd>
          </div>
        </div>

        {/* Navigation Links */}
        <nav class="flex-grow overflow-y-auto p-4">
          {/* ... rest of the navigation UL/For logic ... */}
          <ul class="space-y-2">
            <For each={navItems()}>
              {(item) => (
                <li>
                  <a
                    href={item.href}
                    class={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors duration-150 ${
                      (activeNavItem() === item.href || (item.href !== "/" && activeNavItem().startsWith(item.href))) &&
                      item.href !== "#"
                        ? "bg-gray-800 text-white"
                        : "hover:bg-gray-800 hover:text-white"
                    }`}
                    onClick={(e) => {
                      if (item.children) {
                        e.preventDefault();
                        toggleCategory(item.title);
                      } else {
                        if (isMobileMenuOpen()) toggleMobileMenu();
                      }
                    }}
                    aria-expanded={item.children ? openedCategory() === item.title : undefined}
                    aria-controls={item.children ? `submenu-${item.title.replace(/\s+/g, "-")}` : undefined}
                  >
                    <span class="font-medium">{item.title}</span>
                    <Show when={item.children}>
                      <span
                        class={`transform transition-transform duration-200 ${openedCategory() === item.title ? "rotate-180" : ""}`}
                      >
                        <ChevronDownIcon />
                      </span>
                    </Show>
                  </a>

                  <Show when={item.children && openedCategory() === item.title}>
                    <ul
                      class="mt-2 ml-4 space-y-1 border-l border-gray-700 pl-3"
                      id={`submenu-${item.title.replace(/\s+/g, "-")}`}
                    >
                      <For each={item.children}>
                        {(child) => (
                          <li>
                            <a
                              href={child.href}
                              class={`block rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${
                                activeNavItem() === child.href
                                  ? "bg-gray-700 text-white"
                                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
                              }`}
                              onClick={() => {
                                if (isMobileMenuOpen()) toggleMobileMenu();
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

      {/* Mobile Overlay */}
      <Show when={isMobileMenuOpen()}>
        <div class="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={toggleMobileMenu} aria-hidden="true" />
      </Show>
    </div>
  );
}
