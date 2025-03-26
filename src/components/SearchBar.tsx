import { createSignal, createEffect, For, onMount } from 'solid-js';
import type { Item } from './types';

// Sample data with href added
const items: Item[] = [
  { id: 1, title: 'JavaScript', description: 'A programming language', href: '#javascript' },
  { id: 2, title: 'TypeScript', description: 'JavaScript with types', href: '#typescript' },
  { id: 3, title: 'Python', description: 'A versatile programming language', href: '#python' },
  { id: 4, title: 'Rust', description: 'A systems programming language', href: '#rust' },
  { id: 5, title: 'Go', description: 'A language by Google', href: '#go' },
];

export default function SearchComponent() {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [searchResults, setSearchResults] = createSignal<Item[]>(items);
  const [index, setIndex] = createSignal<any>(null);
  const [descIndex, setDescIndex] = createSignal<any>(null);

  // Initialize FlexSearch on mount
  onMount(async () => {
    const FlexSearch = (await import('flexsearch')).default;
    
    const titleIdx = new FlexSearch.Index({
      preset: 'match',
      tokenize: 'forward'
    });

    const descriptionIdx = new FlexSearch.Index({
      preset: 'match',
      tokenize: 'forward'
    });

    // Add items to the indexes
    items.forEach((item, idx) => {
      titleIdx.add(idx, item.title);
      descriptionIdx.add(idx, item.description);
    });

    setIndex(titleIdx);
    setDescIndex(descriptionIdx);
  });

  // Search effect
  createEffect(() => {
    const term = searchQuery();
    const currentIndex = index();
    const currentDescIndex = descIndex();

    if (!currentIndex || !currentDescIndex) {
      return;
    }

    if (term === '') {
      setSearchResults(items);
      return;
    }

    // Search in both title and description
    const titleResults = currentIndex.search(term);
    const descResults = currentDescIndex.search(term);
    
    // Combine and deduplicate results
    const resultIndexes = [...new Set([...titleResults, ...descResults])];
    
    // Map back to original items
    const results = resultIndexes.map(idx => items[idx as number]);
    setSearchResults(results);
  });

  return (
    <div class="max-w-2xl mx-auto p-4">
      <div class="mb-6">
        <input
          type="text"
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          placeholder="Search..."
          class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="space-y-4">
        <For each={searchResults()}>
          {(item) => (
            <div class="bg-white p-4 rounded-lg shadow">
              <h3 class="text-lg font-semibold text-gray-800">{item.title}</h3>
              <p class="text-gray-600">{item.description}</p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
