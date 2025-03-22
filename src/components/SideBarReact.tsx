// src/components/Sidebar.tsx
import { createSignal, createEffect, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';

interface NavItem {
  id: number;
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  isOpen?: boolean;
}

interface Props {
  categories: string[];
  searchList: {title: string, url: string}[];
}


// Reusable SVG components (Optional, for cleaner code)
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ZahrawiIcon = () => (
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
);

const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

// Helper function to create NavItems from strings
function createNavItems(baseId: number, baseHref: string, titles: string[]): NavItem[] {
  return titles.map((title, index) => ({
    id: baseId + index + 1, // Ensure unique IDs
    title: title,
    href: `${baseHref}/${title.toLowerCase().replace(/\s+/g, '-')}`, // Create a URL-friendly slug
  }));
}


export default function Sidebar(props: Props) {
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [navItems, setNavItems] = createStore<NavItem[]>([
    { id: 1, title: 'Home Page', href: '/', isOpen: false },
    { id: 2, title: 'Categories', href: '/Categories', isOpen: true,
      children: createNavItems(2, '/Categories', props.categories)
    },
    { id: 3, title: 'Blog', href: '/blog', isOpen: false },
    { id: 4, title: 'About', href: '/about', isOpen: false },
    { id: 5, title: 'Resources', href: '/resources', isOpen: false },
  ]);

  const toggleCategory = (id: number) => {
    setNavItems(item => item.id === id, 'isOpen', isOpen => !isOpen);
  };

  const allItems = () => {
    const items: NavItem[] = [];
    navItems.forEach(item => {
      items.push(item);
      if (item.children) {
        items.push(...item.children);
      }
    });
    props.searchList.forEach(item => items.push({title: item.title, href: item.url, id:  items.length + 1}));
    return items;
  };

  const filteredItems = () => {
    if (!searchQuery().trim()) return [];
    return allItems().filter(item => item.title.toLowerCase().includes(searchQuery().toLowerCase()));
  };

  const toggleSearch = () => {
    setIsSearchOpen(prev => !prev);
    if (!isSearchOpen()) {
      setSearchQuery('');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <div class="flex flex-col lg:flex-row ">
      {/* Header (Mobile only) */}
      <header class="flex lg:hidden items-center justify-between p-4 border-b border-gray-800 bg-gray-900 fixed top-0 left-0 right-0 z-40">
        <div class="flex items-center">
            <div class="text-teal-300 mr-2">
                <ZahrawiIcon />
            </div>
          <div class="text-white text-xl font-bold">Zahrawi</div>
        </div>

        <div class="flex items-center gap-2">
          <button onClick={toggleSearch} class="p-2 rounded-full text-gray-300 hover:bg-gray-800" aria-label="Search">
            <SearchIcon />
          </button>
          <button onClick={toggleMobileMenu} class="p-2 rounded-full text-gray-300 hover:bg-gray-800" aria-label="Menu">
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* Search overlay */}
      <Show when={isSearchOpen()}>
        <div class="fixed inset-0 bg-gray-900 z-50 p-4">
          <div class="max-w-2xl mx-auto mt-16"> {/* Add mt-16 here */}
            <div class="relative mb-4 flex items-center">
              <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="search"
                class="w-full pl-10 pr-10 py-2 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search"
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                autofocus
              />
              <button onClick={() => setSearchQuery('')} class="absolute right-16 inset-y-0 p-2 text-gray-400" aria-label="Clear search">
                <CloseIcon />
              </button>
              <button onClick={toggleSearch} class="absolute right-3 text-indigo-500 font-medium">
                Cancel
              </button>
            </div>

            <Show when={searchQuery().trim() !== ''}>
              <div class="text-sm text-gray-400 mb-2">
                {filteredItems().length} results for {searchQuery()}
              </div>
              <div class="space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]"> {/* Add overflow-y-auto and max-h */}
                <For each={filteredItems()}>
                  {(item) => (
                    <div class="bg-gray-800 rounded-lg overflow-hidden">
                      <a href={item.href} class="block p-4 hover:bg-gray-700">
                        <div class="flex items-center gap-2 text-white">
                            <FileIcon />
                          <span class="font-medium">{item.title}</span>
                        </div>
                        <div class="mt-2 pl-7 text-gray-400 border-l-2 border-gray-700">
                          <p class="line-clamp-2">Context information would go here</p>
                        </div>
                      </a>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Sidebar Navigation */}

      <aside classList={{
        'bg-gray-900': true,
        'text-gray-300': true,
        'overflow-y-auto': true,
        'fixed': true,
        'lg:static': true,
        'inset-0': true,
        'z-30': true,  // Lower z-index than search
        'transform': true,
        'transition-transform': true,
        'duration-300': true,
        'ease-in-out': true,
        'lg:w-64': true,
        'lg:translate-x-0': true,
        '-translate-x-full': !isMobileMenuOpen(), // Use classList for dynamic classes
        'translate-x-0': isMobileMenuOpen(),
        'pt-16': true,  // Add padding-top for mobile
        'lg:pt-0': true,
        'mt-16': true, // Add margin top
        'lg:mt-0': true,
        'lg:h-auto': true, // Add this. Important for desktop!
        'h-[calc(100vh-4rem)]': true, // Add this for mobile.  Adjust 4rem as needed.
      }}>
        {/* Desktop Header */}
        <div class="hidden lg:flex items-center p-4 border-b border-gray-800">
            <div class="text-teal-300 mr-2">
                <ZahrawiIcon />
            </div>
          <div class="text-white text-xl font-bold">Zahrawi</div>
          <button onClick={toggleSearch} class="ml-auto p-2 rounded-full text-gray-300 hover:bg-gray-800" aria-label="Search">
            <SearchIcon />
          </button>
        </div>

        <nav class="p-4">
          <ul class="space-y-4">
            <For each={navItems}>
              {(item) => (
                <li>
                  <div
                    class="flex items-center justify-between py-2 px-3 hover:bg-gray-800 rounded-lg cursor-pointer"
                    onClick={() => item.children && toggleCategory(item.id)}
                  >
                    <a href={item.href} class="text-white font-medium">{item.title}</a>
                    {item.children && (
                       <span class={item.isOpen ? 'rotate-180' : ''}>
                            <ChevronDownIcon />
                       </span>
                    )}
                  </div>

                  <Show when={item.children && item.isOpen}>
                    <ul class="mt-1 ml-4 space-y-1">
                      <For each={item.children}>
                        {(child) => (
                          <li>
                            <a href={child.href} class="block py-2 px-3 hover:bg-gray-800 rounded-lg">
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
      </aside>

       {/* Mobile overlay */}
      <Show when={isMobileMenuOpen()}>
        <div
          class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"  // Ensure z-index is correct
          onClick={toggleMobileMenu}
        />
      </Show>
    </div>
  );
}
