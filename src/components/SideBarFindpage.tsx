import { createSignal, createEffect, For, Show, onMount, onCleanup, lazy, createResource } from "solid-js";
import { isServer } from "solid-js/web";

// Lazy load the BookmarksList component
const BookmarksList = lazy(() => import("./BookmarkList"));

// --- Icon Components (keep as they are since they're small and essential) ---
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

// Lazy load FileIcon only when search is opened
const FileIcon = lazy(() =>
  Promise.resolve({
    default: () => (
      <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    )
  })
);

// --- End Icon Components ---

interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  isOpen?: boolean;
}

// Interface for Pagefind result data
interface PagefindResultData {
  url: string;
  meta: {
    title: string;
  };
  excerpt: string;
}

interface Props {
  categories: string[];
}

// --- Lazy loaded components ---

// Keyboard Key Hint Component - loaded only when search is open
const Kbd = lazy(() =>
  Promise.resolve({
    default: (props: { children: any; class?: string }) => (
      <kbd
        class={`inline-flex items-center justify-center rounded border border-gray-600 bg-rich-black-700 px-1.5 py-0.5 text-xs font-semibold text-gray-300 ${props.class ?? ""}`}
      >
        {props.children}
      </kbd>
    )
  })
);

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

function createNavItems(categories: { title: string; href: string }[]): NavItem[] {
  return categories.map((cat) => ({
    title: cat.title,
    href: cat.href,
  }));
}

// --- Constants ---
const PAGEFIND_SCRIPT_PATH = "/pagefind/pagefind.js";
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

// --- Lazy Loading Functions ---

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

export default function Sidebar(props: Props) {
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const [activeNavItem, setActiveNavItem] = createSignal<string>("/");
  const [openedCategory, setOpenedCategory] = createSignal<string | null>(null);
  const [searchResults, setSearchResults] = createSignal<PagefindResultData[]>([]);
  const [isSearching, setIsSearching] = createSignal(false);

  // Use createResource for lazy loading Pagefind API
  const [pagefindApi, { mutate: setPagefindApi }] = createResource(
    () => isSearchOpen() ? true : false, // Only load when search is opened
    loadPagefindApi,
    {
      initialValue: null,
    }
  );

  const initialNavItems = (): NavItem[] => [
    { title: "Home Page", href: "/" },
    {
      title: "Categories",
      href: "#",
      isOpen: false,
      children: createNavItems(props.categories),
    },
    { title: "Blog", href: "/blog" },
    { title: "About", href: "/about" },
  ];

  const [navItems] = createSignal(initialNavItems());
  let searchInput: HTMLInputElement | undefined;

  // --- Effects ---
  createEffect(() => {
    if (!isServer) {
      setActiveNavItem(window.location.pathname);
    }
  });

  // Effect to handle focusing input when search opens
  createEffect(() => {
    if (isSearchOpen()) {
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
    if (!isServer && isSearchOpen()) {
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
      document.body.style.overflow = "";
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    // Focus search on '/' (if not already in an input)
    if (
      e.key === "/" &&
      !isSearchOpen() &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName || "")
    ) {
      e.preventDefault();
      setIsSearchOpen(true);
      return;
    }

    // Close modals on Escape
    if (e.key === "Escape") {
      if (isSearchOpen()) {
        e.preventDefault();
        setIsSearchOpen(false);
      } else if (isMobileMenuOpen()) {
        e.preventDefault();
        toggleMobileMenu();
      }
      return;
    }

    // Handle navigation within search results only if search is open
    if (!isSearchOpen()) return;

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
            setIsSearchOpen(false);
          }
        }
        break;
    }
  };

  // --- Helper Functions ---
  const toggleCategory = (categoryTitle: string) => {
    setOpenedCategory((prev) => (prev === categoryTitle ? null : categoryTitle));
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    const nextState = !isMobileMenuOpen();
    setIsMobileMenuOpen(nextState);
    if (!isServer) {
      document.body.style.overflow = nextState ? "hidden" : "";
    }
  };

  // --- Render ---
  return (
    <>
      {/* Header (Mobile) */}
      <header class="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-gray-800 bg-rich-black-900 p-4 lg:hidden">
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
          <button
            onClick={toggleSearch}
            class="rounded-full p-2 text-gray-300 hover:bg-rich-black-800"
            aria-label="Open Search"
          >
            <SearchIcon />
          </button>
          <button
            onClick={toggleMobileMenu}
            class="rounded-full p-2 text-gray-300 hover:bg-rich-black-800"
            aria-label="Toggle Menu"
          >
            <Show when={isMobileMenuOpen()} fallback={<MenuIcon />}>
              <CloseIcon />
            </Show>
          </button>
        </div>
      </header>

      {/* Search Overlay - Lazily loaded when opened */}
      <div class="flex flex-col pt-16 lg:flex-row lg:pt-0">
        <Show when={isSearchOpen()}>
          <div
            class="fixed inset-0 z-50 overflow-y-auto bg-rich-black-900/90 p-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) toggleSearch();
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
                  onClick={toggleSearch}
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

        {/* Sidebar Navigation */}
        <aside
          class={`fixed inset-y-0 left-0 z-30 w-64 transform bg-rich-black-900 text-gray-300 transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 lg:border-r lg:border-gray-800 ${isMobileMenuOpen() ? "translate-x-0" : "-translate-x-full"
            } ${isMobileMenuOpen() ? "mt-16 lg:mt-0" : "mt-16 lg:mt-0"} flex h-screen flex-col lg:h-auto lg:max-h-screen`}
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
                class="rounded-full p-2 text-gray-300 hover:bg-rich-black-800"
                aria-label="Search"
              >
                <SearchIcon />
              </button>
              <Kbd aria-hidden="true">/</Kbd>
            </div>
          </div>

          {/* Scrollable Nav Area */}
          <nav class="flex-grow overflow-y-auto p-4">
            <ul class="space-y-2">
              <For each={navItems()}>
                {(item) => (
                  <li>
                    {item.children ? (
                      <div
                        class={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors duration-150 ${(activeNavItem() === item.href ||
                            (item.href !== "/" && activeNavItem().startsWith(item.href))) &&
                            item.href !== "#"
                            ? "bg-rich-black-800 text-white"
                            : "hover:bg-rich-black-800 hover:text-white"
                          }`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleCategory(item.title);
                        }}
                        aria-expanded={openedCategory() === item.title}
                        aria-controls={`submenu-${item.title.replace(/\s+/g, "-")}`}
                      >
                        <span class="font-medium">{item.title}</span>
                        <span
                          class={`transform transition-transform duration-200 ${openedCategory() === item.title ? "rotate-180" : ""
                            }`}
                        >
                          <ChevronDownIcon />
                        </span>
                      </div>
                    ) : (
                      <a
                        href={item.href}
                        class={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors duration-150 ${(activeNavItem() === item.href ||
                            (item.href !== "/" && activeNavItem().startsWith(item.href))) &&
                            item.href !== "#"
                            ? "bg-rich-black-800 text-white"
                            : "hover:bg-rich-black-800 hover:text-white"
                          }`}
                        onClick={() => {
                          if (isMobileMenuOpen()) toggleMobileMenu();
                        }}
                      >
                        <span class="font-medium">{item.title}</span>
                      </a>
                    )}

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
                                class={`block rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${activeNavItem() === child.href
                                    ? "bg-rich-black-700 text-white"
                                    : "text-gray-400 hover:bg-rich-black-700 hover:text-white"
                                  }`}
                                onClick={() => {
                                  setActiveNavItem(child.href);
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

            {/* Bookmarks Section - Lazily loaded */}
            <div class="mt-auto border-t border-gray-800">
              <BookmarksList />
            </div>
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        <Show when={isMobileMenuOpen()}>
          <div class="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={toggleMobileMenu} aria-hidden="true" />
        </Show>
      </div>
    </>
  );
}
