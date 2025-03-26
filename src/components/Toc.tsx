import { createSignal, createEffect, onMount, Show } from 'solid-js';

export default function TableOfContents() {
  const [headings, setHeadings] = createSignal([]);
  const [activeId, setActiveId] = createSignal("");
  const [isOpen, setIsOpen] = createSignal(false);

  onMount(() => {
    // Get all headings from the content
    const contentHeadings = Array.from(
      document.querySelectorAll('article h2, article h3, article h4')
    );
    // Process headings to create TOC items
    const tocItems = contentHeadings.map((heading) => {
      // If heading doesn't have an id, create one based on text content
      if (!heading.id) {
        heading.id = heading.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return {
        id: heading.id,
        text: heading.textContent,
        level: parseInt(heading.tagName.charAt(1), 10)
      };
    });
    setHeadings(tocItems);
    
    // Set up IntersectionObserver to highlight active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -70% 0px' }
    );
    contentHeadings.forEach((heading) => observer.observe(heading));
    
    // Clean up observers on component unmount
    return () => {
      contentHeadings.forEach((heading) => observer.unobserve(heading));
    };
  });
  
  const toggleTOC = () => setIsOpen(!isOpen());
  
  return (
    <div class="toc-container w-full">
      {/* "On this page" header with toggle button for mobile */}
      <div class="flex items-center justify-between mb-2 md:mb-4">
        <h3 class="text-lg font-medium text-white">On this page</h3>
        <button 
          onClick={toggleTOC}
          class="md:hidden flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white"
        >
          <svg 
            class={`w-5 h-5 transition-transform ${isOpen() ? 'transform rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      {/* TOC Content */}
      <div 
        class={`border-b border-gray-800 pb-4 mb-4 md:border-b-0 md:pb-0 md:mb-0
                ${isOpen() ? 'block' : 'hidden md:block'}`}
      >
        <nav class="toc max-h-[50vh] overflow-y-auto pr-1">
          <Show when={headings().length > 0}>
            <ul class="space-y-2 pr-2">
              {headings().map((heading) => (
                <li>
                  <a 
                    href={`#${heading.id}`}
                    class={`block py-1 text-sm transition-colors ${
                      activeId() === heading.id
                        ? 'text-blue-400 font-medium'
                        : 'text-gray-400 hover:text-gray-300'
                    } ${heading.level === 2 ? 'ml-0' : 
                       heading.level === 3 ? 'ml-3' : 'ml-6'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(heading.id).scrollIntoView({
                        behavior: 'smooth'
                      });
                      // Close TOC on mobile after clicking
                      if (window.innerWidth < 768) {
                        setIsOpen(false);
                      }
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </Show>
          <Show when={headings().length === 0}>
            <p class="text-sm text-gray-400 p-2">No headings found</p>
          </Show>
        </nav>
      </div>
    </div>
  );
}
