import { createSignal, createEffect, For, Show, onMount, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import BookmarksList from "../BookmarksList";
import SearchModal from "./SearchModal";

// Lazy load components
// const BookmarksList = lazy(() => import("../BookmarkList"));
// const SearchModal = lazy(() => import("./SearchModal"));

// --- Icon Components ---
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

// Keyboard Key Hint Component
const Kbd = (props: { children: any; class?: string }) => (
  <kbd
    class={`inline-flex items-center justify-center rounded border border-gray-600 bg-rich-black-700 px-1.5 py-0.5 text-xs font-semibold text-gray-300 ${props.class ?? ""}`}
  >
    {props.children}
  </kbd>
);

// --- Interfaces ---
interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  isOpen?: boolean;
}

interface Props {
  categories: string[];
}

// --- Helper Functions ---
function createNavItems(categories: { title: string; href: string }[]): NavItem[] {
  return categories.map((cat) => ({
    title: cat.title,
    href: cat.href,
  }));
}

export default function Sidebar(props: Props) {
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const [activeNavItem, setActiveNavItem] = createSignal<string>("/");
  const [openedCategory, setOpenedCategory] = createSignal<string | null>(null);

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

  // --- Effects ---
  createEffect(() => {
    if (!isServer) {
      setActiveNavItem(window.location.pathname);
    }
  });

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

    // Close mobile menu on Escape
    if (e.key === "Escape" && isMobileMenuOpen()) {
      e.preventDefault();
      toggleMobileMenu();
      return;
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

      <SearchModal isOpen={isSearchOpen()} onClose={() => setIsSearchOpen(false)} />

      {/* Sidebar Navigation */}
      <div class="flex flex-col pt-16 lg:flex-row lg:pt-0">
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
                        role="button"
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

            <div class="mt-auto border-t border-gray-800">
              <BookmarksList onBookmarkClick={setIsMobileMenuOpen} />
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
