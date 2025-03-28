import { createSignal, createEffect, For, onMount } from 'solid-js';
import type { Item } from '../types';
import { create, insert, search } from '@orama/orama';
import type { Orama } from '@orama/orama';

// Sample data with href added
const items: Item[] = [
  { id: 1, title: 'JavaScript', description: 'A programming language', href: '#javascript' },
  { id: 2, title: 'TypeScript', description: 'JavaScript with types', href: '#typescript' },
  { id: 3, title: 'Python', description: 'A versatile programming language', href: '#python' },
  { id: 4, title: 'Rust', description: 'A systems programming language', href: '#rust' },
  { id: 5, title: 'Go', description: 'A language by Google', href: '#go' },
];

type SearchSchema = {
  title: 'string';
  description: 'string';
  href: 'string';
};

export default function SearchComponent() {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [searchResults, setSearchResults] = createSignal<Item[]>(items);
  const [db, setDb] = createSignal<Orama<SearchSchema> | null>(null);

  // Initialize Orama on mount
  onMount(async () => {
    const db = await create<SearchSchema>({
      schema: {
        title: 'string',
        description: 'string',
        href: 'string'
      }
    });

    // Add items to the database
    for (const item of items) {
      await insert(db, {
        title: item.title,
        description: item.description,
        href: item.href
      });
    }

    setDb(db);
  });

  // Search effect
  createEffect(async () => {
    const term = searchQuery();
    const currentDb = db();

    if (!currentDb) {
      return;
    }

    if (term === '') {
      setSearchResults(items);
      return;
    }

    // Search in both title and description
    const results = await search(currentDb, {
      term,
      properties: ['title', 'description'],
      limit: 10
    });

    // Map results back to original items
    const searchResults = results.hits.map(hit => items.find(item => item.href === hit.document.href));
    setSearchResults(searchResults.filter(Boolean) as Item[]);
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
