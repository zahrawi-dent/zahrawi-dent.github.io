// src/stores/sidebarStore.js
import { createStore } from "solid-js/store";

// Singleton instance for the sidebar state
let [state, setState] = createStore({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  searchQuery: "",
  selectedIndex: -1,
  activeNavItem: "/",
  openedCategory: null,
  categories: [],

  // Pagefind State
  pagefindApi: null,
  searchResults: [],
  isSearching: false,
  pagefindLoadError: null,

  // Navigation
  navItems: []
});

let initialized = false;

// Create singleton store for sidebar
export const sidebarStore = (() => {
  // Initialize functions
  function updateCategories(categories) {
    if (categories && categories.length > 0) {
      setState("categories", categories);

      // Update navItems with new categories
      const navItems = [
        { title: "Home Page", href: "/" },
        {
          title: "Categories",
          href: "#",
          isOpen: false,
          children: createNavItems(categories),
        },
        { title: "Blog", href: "/blog" },
        { title: "About", href: "/about" },
      ];

      setState("navItems", navItems);
    }
  }

  function createNavItems(categories) {
    return categories.map((cat) => ({
      title: cat.title,
      href: cat.href,
    }));
  }

  // Toggle functions
  function toggleSearch() {
    setState("isSearchOpen", !state.isSearchOpen);
  }

  function toggleCategory(categoryTitle) {
    setState("openedCategory", (prev) => (prev === categoryTitle ? null : categoryTitle));
  }

  function toggleMobileMenu() {
    setState("isMobileMenuOpen", !state.isMobileMenuOpen);

    if (typeof document !== 'undefined') {
      document.body.style.overflow = state.isMobileMenuOpen ? "hidden" : "";
    }
  }

  // Search functions
  function setSearchQuery(query) {
    setState("searchQuery", query);
  }

  function setSelectedIndex(index) {
    setState("selectedIndex", index);
  }

  function setSearchResults(results) {
    setState("searchResults", results);
  }

  function setIsSearching(isSearching) {
    setState("isSearching", isSearching);
  }

  function setPagefindApi(api) {
    setState("pagefindApi", api);
  }

  function setPagefindLoadError(error) {
    setState("pagefindLoadError", error);
  }

  function setActiveNavItem(path) {
    setState("activeNavItem", path);
  }

  // Initialize if running in browser
  if (!initialized && typeof window !== 'undefined') {
    // Set active nav item based on current path
    setActiveNavItem(window.location.pathname);
    initialized = true;
  }

  return {
    // Expose state as getters
    get state() {
      return state;
    },

    // Expose methods
    updateCategories,
    toggleSearch,
    toggleCategory,
    toggleMobileMenu,
    setSearchQuery,
    setSelectedIndex,
    setSearchResults,
    setIsSearching,
    setPagefindApi,
    setPagefindLoadError,
    setActiveNavItem,
  };
})();

export default sidebarStore;
