import {
  createSignal,
  createEffect,
  For,
  Show,
  onMount,
  onCleanup,
} from "solid-js";
import { isServer } from "solid-js/web";
import BookmarksList from "./BookmarkList"; // Assuming this component exists

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


interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  isOpen?: boolean;
}

// Interface for Pagefind result data (adjust based on your indexed metadata)
interface PagefindResultData {
  url: string;
  meta: {
    title: string;
    // Add other metadata fields you index (e.g., description, date)
  };
  excerpt: string; // Pagefind generates this with highlighted terms
  // Add other fields if needed (e.g., sub_results)
}

interface Props {
  categories: string[];
  // searchList is removed - Pagefind handles the data
}

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


const createNavItems = (titles: string[]): NavItem[] =>
  titles.map((title) => ({
    title: title,
    href: `/${title.toLowerCase().replace(/\s+/g, "-")}`, // Assuming category pages exist
  }));

export default function Sidebar(props: Props) {
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const [activeNavItem, setActiveNavItem] = createSignal<string>("/");
  const [openedCategory, setOpenedCategory] = createSignal<string | null>(null);

  // --- Pagefind State ---
  const [pagefind, setPagefind] = createSignal<any>(null); // To hold the Pagefind API
  const [searchResults, setSearchResults] = createSignal<PagefindResultData[]>([]);
  const [isSearching, setIsSearching] = createSignal(false);
  // --- End Pagefind State ---

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
    { title: "Resources", href: "/resources" },
  ];

  const [navItems] = createSignal(initialNavItems());
  let searchInput: HTMLInputElement | undefined;

  // --- Effects ---
  createEffect(() => {
    if (!isServer) {
      setActiveNavItem(window.location.pathname);
    }
  });

  createEffect(() => {
    if (isSearchOpen() && searchInput) {
      searchInput.focus();
      // Reset index when opening, might adjust based on preference
      setSelectedIndex(searchResults().length > 0 ? 0 : -1);
    } else {
        // Clear results when search is closed
        setSearchQuery("");
        setSearchResults([]);
        setSelectedIndex(-1);
    }
  });

  createEffect(() => {
    if (!isServer) {
      const idx = selectedIndex();
      if (idx >= 0) {
        const element = document.querySelector(`[data-result-index="${idx}"]`);
        element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  });

  // --- Pagefind Integration ---



  onMount(async () => {
    if (isServer) return;

    try {
      // Dynamically import Pagefind
      // Adjust the path if your Astro config places it elsewhere (e.g., /_pagefind/pagefind.js)
      const pagefindModule = await import(/* @vite-ignore */ "/dist/pagefind/pagefind.js");
      // Make Pagefind API available globally if it isn't already
      // @ts-ignore
      if (pagefindModule && !window.pagefind) {
         // @ts-ignore
         window.pagefind = pagefindModule;
      }
       // @ts-ignore
      if (window.pagefind) {
         // @ts-ignore
        setPagefind(() => window.pagefind); // Store the API object in state
        console.log("Pagefind loaded successfully");
      } else {
         console.error("Pagefind failed to load on window.");
      }
    } catch (e) {
      console.error("Error loading Pagefind:", e);
      // Handle error appropriately (e.g., disable search)
    }

    document.addEventListener("keydown", handleKeyDown);
  });


  onCleanup(() => {
    if (!isServer) {
      document.removeEventListener("keydown", handleKeyDown);
    }
  });

  // Debounced search function
  const debouncedSearch = debounce(async (query: string) => {
    const pf = pagefind();
    if (!pf || query.trim().length < 2) { // Only search if Pagefind is loaded and query is substantial
      setSearchResults([]);
      setSelectedIndex(-1);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSelectedIndex(-1); // Reset selection during search

    try {
      const search = await pf.search(query);
      if (search.results.length === 0) {
         setSearchResults([]);
      } else {
        // Pagefind returns stubs, fetch full data for each result
        const resultsData = await Promise.all(
          search.results.map((result: any) => result.data())
        );
        setSearchResults(resultsData as PagefindResultData[]);
        setSelectedIndex(0); // Select first result
      }
    } catch (e) {
      console.error("Pagefind search error:", e);
      setSearchResults([]); // Clear results on error
    } finally {
      setIsSearching(false);
    }
  }, 300); // Debounce for 300ms

  // Effect to trigger debounced search when query changes
  createEffect(() => {
    const query = searchQuery();
    debouncedSearch(query);
  });
  // --- End Pagefind Integration ---


  const handleKeyDown = (e: KeyboardEvent) => {
    // Focus search on '/'
    if (e.key === "/" && !isSearchOpen() && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault();
      setIsSearchOpen(true);
      return;
    }

    // Close search on Escape
    if (e.key === "Escape") {
      if (isSearchOpen()) {
        e.preventDefault();
        setIsSearchOpen(false); // This will trigger effect to clear search
      } else if (isMobileMenuOpen()) {
         e.preventDefault();
         toggleMobileMenu();
      }
      return;
    }

    // Handle navigation within search results
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
        setSelectedIndex(prev => {
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
            window.location.href = selectedResult.url; // Navigate to the result URL
          }
        }
        break;
    }
  };


  // --- Helper Functions ---
  const toggleCategory = (categoryTitle: string) => {
    setOpenedCategory(prev => prev === categoryTitle ? null : categoryTitle);
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    // Effect handles clearing search state when closing
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    if (!isServer) {
      document.body.style.overflow = isMobileMenuOpen() ? "hidden" : "";
    }
  };


  return (
    <div class="flex flex-col lg:flex-row">
      {/* Header (Mobile) */}
      <header class="sticky top-0 right-0 left-0 z-40 flex items-center justify-between border-b border-gray-800 bg-gray-900 p-4 lg:hidden">
        {/* ... (keep existing mobile header content) ... */}
         <div class="flex items-center">
            <div class="mr-2 text-teal-300">
                <ZahrawiIcon />
            </div>
            <a href="/" class="block text-xl font-bold text-white">
                Zahrawi
            </a>
        </div>
        <div class="flex items-center gap-2">
            <button onClick={toggleSearch} class="rounded-full p-2 text-gray-300 hover:bg-gray-800" aria-label="Search">
                <SearchIcon />
            </button>
            <button onClick={toggleMobileMenu} class="rounded-full p-2 text-gray-300 hover:bg-gray-800" aria-label="Menu">
                {isMobileMenuOpen() ? <CloseIcon /> : <MenuIcon />}
            </button>
        </div>
      </header>

      {/* Search Overlay - Modified for Pagefind */}
      <Show when={isSearchOpen()}>
        <div class="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm p-4 overflow-y-auto"> {/* Added slight transparency + blur */}
          <div class="mx-auto mt-4 md:mt-16 max-w-2xl"> {/* Reduced top margin on mobile */}
            <div class="relative mb-4 flex items-center">
              <div class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="search"
                class="w-full rounded-full border border-gray-700 bg-gray-800 py-2 pr-24 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none" // Adjusted padding
                placeholder="Search content..." // Updated placeholder
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                ref={searchInput}
                autocomplete="off" // Disable browser autocomplete
              />
              {/* Show clear button only if there's text */}
              <Show when={searchQuery().length > 0}>
                 <button
                    onClick={() => setSearchQuery("")}
                    class="absolute inset-y-0 right-16 p-2 text-gray-400 hover:text-white" // Adjusted position
                    aria-label="Clear search"
                 >
                    <CloseIcon />
                 </button>
              </Show>
              <button onClick={toggleSearch} class="absolute right-3 text-sm font-medium text-indigo-400 hover:text-indigo-300"> {/* Adjusted position */}
                Cancel
              </button>
            </div>

             {/* Loading/Results Area */}
            <Show when={isSearching()}>
                 <div class="p-4 text-center text-gray-400">Searching...</div>
            </Show>

            <Show when={!isSearching() && searchQuery().trim().length > 1}>
                <Show when={searchResults().length > 0} fallback={
                    <div class="p-4 text-center text-gray-400">
                        No results found for "{searchQuery()}".
                    </div>
                }>
                    <div class="mb-2 text-sm text-gray-400 px-2">
                        {searchResults().length} results
                    </div>
                    {/* Use max-h carefully, adjust based on screen real estate */}
                    <div class="space-y-2"> {/* Slightly more space between results */}
                        <For each={searchResults()}>
                            {(item, index) => (
                                <div
                                    data-result-index={index()}
                                    // Use outline for focus visibility which works better with rounded corners
                                    class={`overflow-hidden rounded-lg ring-2 transition-all duration-150 ${
                                        index() === selectedIndex() ? "ring-indigo-500 bg-gray-800/50" : "ring-transparent bg-gray-800/80"
                                    }`}
                                    // Add mouseover effect to select item
                                    onMouseEnter={() => setSelectedIndex(index())}
                                >
                                    <a
                                        href={item.url}
                                        class="block p-4 hover:bg-gray-700/50" // Subtle hover
                                        // Don't change selection on click, Enter key handles navigation
                                    >
                                        <div class="flex items-start gap-3 text-white"> {/* Align items start, adjust gap */}
                                            <div class="mt-1 shrink-0 text-gray-500"> {/* Icon styling */}
                                                <FileIcon />
                                            </div>
                                            <div>
                                                <span class="font-medium block mb-1">{item.meta.title || 'Untitled Page'}</span> {/* Title */}
                                                 {/* Pagefind excerpt contains HTML highlighting */}
                                                <div
                                                    class="text-sm text-gray-400 line-clamp-2 search-excerpt"
                                                    innerHTML={item.excerpt}
                                                />
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            )}
                        </For>
                    </div>
                </Show>
            </Show>

            <Show when={!isSearching() && searchQuery().trim().length <= 1 && searchQuery().trim().length > 0}>
                <div class="p-4 text-center text-gray-400">
                    Please enter at least 2 characters to search.
                </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Sidebar Navigation */}
      <aside
        class={`fixed lg:sticky top-0 inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:w-64 lg:translate-x-0 ${
          isMobileMenuOpen() ? "translate-x-0" : "-translate-x-full"
        } bg-gray-900 text-gray-300 overflow-y-auto lg:pt-0 pt-16 lg:mt-0 border-r border-gray-800 flex flex-col h-screen`} // Use h-screen and flex-col for full height
      >
        {/* Desktop Header */}
        <div class="hidden items-center border-b border-gray-800 p-4 lg:flex shrink-0"> {/* shrink-0 prevents header from shrinking */}
            {/* ... (keep existing desktop header content) ... */}
             <div class="mr-2 text-teal-300">
                <ZahrawiIcon />
            </div>
            <a href="/" class="text-xl font-bold text-white">
                Zahrawi
            </a>
            <button onClick={toggleSearch} class="ml-auto rounded-full p-2 text-gray-300 hover:bg-gray-800" aria-label="Search">
                <SearchIcon />
            </button>
        </div>

        {/* Scrollable Nav Area */}
        <nav class="flex-grow overflow-y-auto p-4"> {/* flex-grow makes nav take available space */}
          <ul class="space-y-1"> {/* Reduced space */}
            <For each={navItems()}>
              {(item) => (
                <li>
                  <a
                    href={item.href}
                    class={`flex items-center justify-between py-2 px-3 rounded-md text-sm transition-colors duration-150 ${ // Adjusted padding/size/rounding
                      activeNavItem() === item.href
                        ? "bg-gray-700 text-white" // Clearer active state
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                    onClick={(e) => {
                      if (item.children) {
                        e.preventDefault();
                        toggleCategory(item.title);
                      }
                      // No explicit setActiveNavItem here, effect handles it
                       if (isMobileMenuOpen() && !item.children) {
                          toggleMobileMenu(); // Close mobile menu on nav item click
                      }
                    }}
                    // Indicate current page for assistive tech
                    aria-current={activeNavItem() === item.href ? "page" : undefined}
                  >
                    <span class="font-medium">{item.title}</span> {/* Removed div */}
                    {item.children && (
                      <span class={`transform transition-transform duration-200 ${openedCategory() === item.title ? "rotate-180" : ""}`}>
                        <ChevronDownIcon />
                      </span>
                    )}
                  </a>

                  <Show when={item.children && openedCategory() === item.title}>
                    <ul class="mt-1 ml-4 pl-3 border-l border-gray-700 space-y-1"> {/* Indentation + border */}
                      <For each={item.children}>
                        {(child) => (
                          <li>
                            <a
                              href={child.href}
                              class={`block py-1.5 px-3 rounded-md text-sm transition-colors duration-150 ${ // Adjusted padding/size
                                activeNavItem() === child.href
                                  ? "bg-gray-700 text-white"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white" // Dimmer inactive children
                              }`}
                               onClick={() => {
                                   if (isMobileMenuOpen()) {
                                        toggleMobileMenu(); // Close mobile menu on sub-item click
                                    }
                               }}
                               aria-current={activeNavItem() === child.href ? "page" : undefined}
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
        </nav>

        {/* Bookmarks - ensure it doesn't push nav off-screen */}
        <div class="border-t border-gray-800 p-4 shrink-0"> {/* Added padding + shrink-0 */}
          <BookmarksList />
        </div>
      </aside>

      {/* Mobile Overlay */}
      <Show when={isMobileMenuOpen()}>
        <div class="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={toggleMobileMenu} aria-hidden="true"/>
      </Show>
    </div>
  );
}
