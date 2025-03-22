// src/components/Sidebar.tsx
import { createSignal, createEffect, Show, For } from 'solid-js';
import type { Component } from 'solid-js';

type MenuItem = {
  title: string;
  href?: string;
  children?: MenuItem[];
  isOpen?: boolean;
};

type SidebarProps = {
  items: MenuItem[];
  title: string;
  logoSrc?: string;
};

const SolidSideBar: Component<SidebarProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [menuItems, setMenuItems] = createSignal<MenuItem[]>(
    props.items.map(item => ({
      ...item,
      isOpen: false
    }))
  );

  const toggleMenu = () => {
    setIsOpen(!isOpen());
  };

  const toggleSubmenu = (index: number) => {
    setMenuItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  createEffect(() => {
    // Close sidebar when clicking outside on mobile
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (isOpen() && sidebar && !sidebar.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  // Close sidebar when window resizes to desktop
  createEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return (
    <>
      {/* Mobile Toggle Button */}
      <div class="lg:hidden fixed top-4 right-4 z-30">
        <button 
          onClick={toggleMenu} 
          class="bg-gray-800 text-white p-2 rounded-md focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d={isOpen() ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
            />
          </svg>
        </button>
      </div>

      {/* Mobile Overlay */}
      <Show when={isOpen()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" />
      </Show>

      {/* Sidebar */}
      <aside 
        id="sidebar"
        class={`
          fixed top-0 left-0 z-30 h-full w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen() ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:z-0
        `}
      >
        {/* Logo and Title */}
        <div class="flex items-center p-4 border-b border-gray-800">
          {props.logoSrc && (
            <img src={props.logoSrc} alt="Logo" class="h-6 w-6 mr-2" />
          )}
          <span class="text-xl font-semibold">{props.title}</span>

          {/* Close button for mobile */}
          <button 
            onClick={toggleMenu} 
            class="ml-auto lg:hidden"
            aria-label="Close navigation menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Search box */}
        <div class="p-4">
          <div class="relative">
            <input 
              type="text" 
              placeholder="Search" 
              class="w-full bg-gray-800 text-white p-2 pl-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-4 w-4 absolute top-3 left-2 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>

        {/* Navigation Items */}
        <nav class="mt-2">
          <For each={menuItems()}>
            {(item, index) => (
              <div class="mb-1">
                {item.children ? (
                  <div>
                    <button 
                      onClick={() => toggleSubmenu(index())} 
                      class="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-800 focus:outline-none transition-colors"
                      aria-expanded={item.isOpen}
                    >
                      <span>{item.title}</span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        class={`h-4 w-4 transition-transform ${item.isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M19 9l-7 7-7-7" 
                        />
                      </svg>
                    </button>
                    
                    {/* Submenu */}
                    <div 
                      class={`overflow-hidden transition-all duration-300 ease-in-out ${item.isOpen ? 'max-h-96' : 'max-h-0'}`}
                    >
                      <For each={item.children}>
                        {subItem => (
                          <a 
                            href={subItem.href} 
                            class="block px-6 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                          >
                            {subItem.title}
                          </a>
                        )}
                      </For>
                    </div>
                  </div>
                ) : (
                  <a 
                    href={item.href} 
                    class="block px-4 py-2 hover:bg-gray-800 transition-colors"
                  >
                    {item.title}
                  </a>
                )}
              </div>
            )}
          </For>
        </nav>
      </aside>
    </>
  );
};

export default SolidSideBar;
