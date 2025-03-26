// src/components/SearchComponent.tsx
import { createSignal, createEffect, Show, For } from "solid-js";


interface SearchResult {
  id: string;
  url: string;
  excerpt: string;
  meta: {
    title?: string;
  };
}

interface SearchComponentProps {
  placeholder?: string;
  autofocus?: boolean;
  basePath?: string; // Keep basePath for flexibility
}

function SearchComponent(props: SearchComponentProps) {
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<SearchResult[]>([]);
  const [loading, setLoading] = createSignal(false);

  createEffect(async () => {
    const currentQuery = query();
    if (!currentQuery) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Use dynamic import() to load Pagefind
      pagefind.call("search", currentQuery);

      // Pass basePath to search() if provided
      const searchOptions = props.basePath ? { basePath: props.basePath } : {};
      const searchResults = await pagefind.search(currentQuery, searchOptions);

      const mappedResults: SearchResult[] = searchResults.results.map((result) => ({
        id: result.id,
        url: result.url,
        excerpt: result.excerpt,
        meta: {
          title: result.meta.title,
        },
      }));
      setResults(mappedResults);
    } catch (error) {
      console.error("Pagefind search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div class="flex flex-col gap-2">
      <input
        type="text"
        placeholder={props.placeholder ?? "Search..."}
        value={query()}
        onInput={(e) => setQuery(e.currentTarget.value)}
        autofocus={props.autofocus ?? false}
        class="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      <Show when={loading()}>
        <div class="text-gray-500">Loading...</div>
      </Show>

      <Show when={results().length > 0}>
        <ul class="space-y-2">
          <For each={results()}>
            {(result) => (
              <li class="rounded-md border border-gray-200 p-4 transition hover:bg-gray-50">
                <a href={result.url} class="text-blue-600 hover:underline">
                  <h3 class="text-lg font-semibold">{result.meta.title}</h3>
                  <p class="text-gray-700">{result.excerpt}</p>
                </a>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <Show when={!loading() && query() && results().length === 0}>
        <div class="text-gray-500">No results found.</div>
      </Show>
    </div>
  );
}

export default SearchComponent;
