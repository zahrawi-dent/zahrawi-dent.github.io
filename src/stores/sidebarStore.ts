// src/stores/sidebarStore.js
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

// Function to get the initial theme preference
function getInitialThemePreference() {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    return localStorage.getItem('theme');
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// Helper function to create navigation items from categories
function createNavItems(categories) {
  return categories.map((cat) => ({
    title: cat.title,
    href: cat.href || `/${cat.title.toLowerCase().replace(/\s+/g, '-')}`,
  }));
}

// Create a persisted store
const [state, setState] = createStore({
  // Search state
  isSearchOpen: false,
  searchQuery: "",
  searchResults: [],
  selectedIndex: -1,
  isSearching: false,

  // Navigation state
  isMobileMenuOpen: false,
  activeNavItem: "/",
  openedCategory: null,
  categories: [],

  // Pagefind state
  pagefindApi: null,
  pagefindLoadError: null,

  // Navigation items
  navItems: [
    { title: "Home Page", href: "/" },
    {
      title: "Categories",
      href: "#",
      isOpen: false,
      children: [],
    },
    { title: "Blog", href: "/blog" },
    { title: "About", href: "/about" },
  ],

  // Theme state
  theme: isServer ? 'dark' : getInitialThemePreference(),
});

// Actions to modify state
const actions = {
  // Search actions
  toggleSearch: () => setState("isSearchOpen", (prev) => !prev),
  setSearchQuery: (query) => setState("searchQuery", query),
  setSearchResults: (results) => setState("searchResults", results),
  setSelectedIndex: (index) => setState("selectedIndex", index),
  setIsSearching: (isSearching) => setState("isSearching", isSearching),
  setPagefindApi: (api) => setState("pagefindApi", api),
  setPagefindLoadError: (error) => setState("pagefindLoadError", error),

  // Navigation actions
  toggleMobileMenu: () => {
    setState("isMobileMenuOpen", (prev) => !prev);
    // Prevent body scroll when mobile menu is open
    if (!isServer) {
      document.body.style.overflow = state.isMobileMenuOpen ? "hidden" : "";
    }
  },
  setActiveNavItem: (path) => setState("activeNavItem", path),
  toggleCategory: (categoryTitle) => {
    setState("openedCategory", (current) =>
      current === categoryTitle ? null : categoryTitle
    );
  },

  // Category actions
  updateCategories: (categories) => {
    if (!categories || categories.length === 0) return;

    setState("categories", categories);

    // Update children of the Categories nav item
    const categoryItems = createNavItems(categories);
    setState("navItems", (items) => {
      const categoriesIndex = items.findIndex(item => item.title === "Categories");
      if (categoriesIndex >= 0) {
        items[categoriesIndex].children = categoryItems;
      }
      return [...items];
    });

    // Update active item and potentially open category based on current path
    if (!isServer) {
      const currentPath = window.location.pathname;
      actions.setActiveNavItem(currentPath);

      // Check if any category corresponds to the current path
      const matchingCategory = categories.find(cat =>
        currentPath.startsWith(`/${cat.title.toLowerCase().replace(/\s+/g, '-')}`)
      );

      if (matchingCategory) {
        actions.toggleCategory("Categories");
      }
    }
  },

  // Theme actions
  toggleTheme: () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    actions.setTheme(newTheme);
  },
  setTheme: (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') return;

    setState('theme', newTheme);

    if (!isServer) {
      // Update local storage
      localStorage.setItem('theme', newTheme);

      // Update document class
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
  initializeTheme: () => {
    if (!isServer) {
      const initialTheme = getInitialThemePreference();
      setState('theme', initialTheme);
      console.log("SidebarStore: Theme initialized to:", initialTheme);
    }
  }
};

export { state, actions };

// // src/stores/sidebarStore.js
// import { createStore } from "solid-js/store";
// import { isServer } from "solid-js/web";
//
// // Singleton instance for the sidebar state
// let [state, setState] = createStore({
//   isSearchOpen: false,
//   isMobileMenuOpen: false,
//   searchQuery: "",
//   selectedIndex: -1,
//   activeNavItem: "/",
//   openedCategory: null,
//   categories: [],
//
//   // Pagefind State
//   pagefindApi: null,
//   searchResults: [],
//   isSearching: false,
//   pagefindLoadError: null,
//
//   // Navigation
//   navItems: [],
//   theme: 'dark',
// });
//
// let initialized = false;
//
// function getInitialThemePreference() {
//   if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
//     return localStorage.getItem('theme');
//   }
//   if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
//     return 'dark';
//   }
//   return 'light';
// }
//
//
// const actions = {
//   // --- Existing Actions ---
//   toggleMobileMenu: () => {
//     setState("isMobileMenuOpen", (o) => !o);
//     // Prevent body scroll when mobile menu is open
//     if (!isServer) {
//       document.body.style.overflow = state.isMobileMenuOpen ? "hidden" : "";
//     }
//   },
//   toggleSearch: () => setState("isSearchOpen", (o) => !o),
//   setSearchQuery: (query) => setState("searchQuery", query),
//   setSearchResults: (results) => setState("searchResults", results),
//   setSelectedIndex: (index) => setState("selectedIndex", index),
//   setIsSearching: (searching) => setState("isSearching", searching),
//   setPagefindApi: (api) => setState("pagefindApi", api),
//   setPagefindLoadError: (error) => setState("pagefindLoadError", error),
//   setActiveNavItem: (path) => setState("activeNavItem", path),
//   toggleCategory: (categoryTitle) => {
//     setState("openedCategory", (current) =>
//       current === categoryTitle ? null : categoryTitle
//     );
//   },
//   updateCategories: (categories) => {
//     // Basic nav items structure (adjust if needed)
//     const homeItem = { href: "/", title: "Home" };
//     const categoryItems = categories.map(cat => ({
//       href: `/${cat.title.toLowerCase()}`, // Assuming category routes are like /category-name
//       title: cat.title,
//       // children: cat.children || [] // Add children if categories have sub-items
//     }));
//     setState("navItems", [homeItem, ...categoryItems]);
//
//     // Update active item and potentially open category based on current path
//     if (!isServer) {
//       const currentPath = window.location.pathname;
//       setState("activeNavItem", currentPath);
//       const activeTopLevel = categoryItems.find(item => currentPath.startsWith(item.href) && item.href !== '/');
//       if (activeTopLevel) {
//         setState("openedCategory", activeTopLevel.title);
//       }
//     }
//   },
//
//   // --- New Theme Actions ---
//   setTheme: (newTheme) => {
//     if (newTheme !== 'light' && newTheme !== 'dark') return; // Validate
//     setState('theme', newTheme);
//     if (!isServer) {
//       // Update local storage
//       localStorage.setItem('theme', newTheme);
//       // IMPORTANT: The inline script in BaseLayout.astro handles the *initial*
//       // class setting. This action only updates the class *after* hydration
//       // if the user explicitly changes it via the toggle.
//       // The initial sync happens in initializeTheme.
//       if (newTheme === 'dark') {
//         document.documentElement.classList.add('dark');
//       } else {
//         document.documentElement.classList.remove('dark');
//       }
//     }
//   },
//   toggleTheme: () => {
//     const currentTheme = state.theme;
//     actions.setTheme(currentTheme === 'light' ? 'dark' : 'light');
//   },
//   initializeTheme: () => {
//     if (!isServer) {
//       // Read the actual theme set by the inline script or user preference
//       const initialTheme = getInitialThemePreference();
//       // Sync the store state without re-applying the class or saving to localStorage again
//       setState('theme', initialTheme);
//       console.log("SidebarStore: Initial theme synchronized to:", initialTheme);
//     }
//   }
// };
//

// // Create singleton store for sidebar
// export const sidebarStore = (() => {
//   // Initialize functions
//   function updateCategories(categories) {
//     if (categories && categories.length > 0) {
//       setState("categories", categories);
//
//       // Update navItems with new categories
//       const navItems = [
//         { title: "Home Page", href: "/" },
//         {
//           title: "Categories",
//           href: "#",
//           isOpen: false,
//           children: createNavItems(categories),
//         },
//         { title: "Blog", href: "/blog" },
//         { title: "About", href: "/about" },
//       ];
//
//       setState("navItems", navItems);
//     }
//   }
//
//   function createNavItems(categories) {
//     return categories.map((cat) => ({
//       title: cat.title,
//       href: cat.href,
//     }));
//   }
//
//   // Toggle functions
//   function toggleSearch() {
//     setState("isSearchOpen", !state.isSearchOpen);
//   }
//
//   function toggleCategory(categoryTitle) {
//     setState("openedCategory", (prev) => (prev === categoryTitle ? null : categoryTitle));
//   }
//
//   function toggleMobileMenu() {
//     setState("isMobileMenuOpen", !state.isMobileMenuOpen);
//
//     if (typeof document !== 'undefined') {
//       document.body.style.overflow = state.isMobileMenuOpen ? "hidden" : "";
//     }
//   }
//
//   // Search functions
//   function setSearchQuery(query) {
//     setState("searchQuery", query);
//   }
//
//   function setSelectedIndex(index) {
//     setState("selectedIndex", index);
//   }
//
//   function setSearchResults(results) {
//     setState("searchResults", results);
//   }
//
//   function setIsSearching(isSearching) {
//     setState("isSearching", isSearching);
//   }
//
//   function setPagefindApi(api) {
//     setState("pagefindApi", api);
//   }
//
//   function setPagefindLoadError(error) {
//     setState("pagefindLoadError", error);
//   }
//
//   function setActiveNavItem(path) {
//     setState("activeNavItem", path);
//   }
//
//   // Initialize if running in browser
//   if (!initialized && typeof window !== 'undefined') {
//     // Set active nav item based on current path
//     setActiveNavItem(window.location.pathname);
//     initialized = true;
//   }
//
//   return {
//     // Expose state as getters
//     get state() {
//       return state;
//     },
//
//     // Expose methods
//     updateCategories,
//     toggleSearch,
//     toggleCategory,
//     toggleMobileMenu,
//     setSearchQuery,
//     setSelectedIndex,
//     setSearchResults,
//     setIsSearching,
//     setPagefindApi,
//     setPagefindLoadError,
//     setActiveNavItem,
//   };
// })();

// --- Initialize Theme on Client ---
// This ensures the store state matches the actual theme after hydration
// if (!isServer) {
//   actions.initializeTheme();
// }
//
// const sidebarStore = { state, ...actions };
// export default sidebarStore;
