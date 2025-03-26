import { createSignal, createEffect } from 'solid-js';
import FlexSearch from 'flexsearch';

interface Post {
  title: string;
  slug: string;
  content: string;
}

interface SearchProps {
  posts: Post[];
}

export default function Search(props: SearchProps) {
  const [searchTerm, setSearchTerm] = createSignal('');
  const [results, setResults] = createSignal<Post[]>([]);
  const [index] = createSignal(new FlexSearch.Document({
    document: {
      id: "id",
      index: ["title", "content"]
    }
  }));

  createEffect(() => {
    // Index all posts
    props.posts.forEach((post, idx) => {
      index().add({
        id: idx,
        title: post.title,
        content: post.content
      });
    });
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setResults([]);
      return;
    }

    const searchResults = index().search({
      query: value,
      limit: 10
    });

    const matchedPosts = searchResults
      .flatMap(result => result.result)
      .map(idx => props.posts[idx as number])
      .filter(Boolean);
    
    setResults(matchedPosts);
  };

  return (
    <div class="w-full max-w-2xl mx-auto">
      <div class="relative">
        <input
          type="text"
          value={searchTerm()}
          onInput={(e) => handleSearch(e.currentTarget.value)}
          placeholder="Search posts..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div class="mt-4">
        {results().length > 0 ? (
          <ul class="space-y-4">
            {results().map((post) => (
              <li class="bg-white p-4 rounded-lg shadow">
                <a
                  href={`/blog/${post.slug}`}
                  class="block hover:text-blue-600"
                >
                  <h3 class="text-lg font-semibold">{post.title}</h3>
                  <p class="text-gray-600 mt-1">
                    {post.content.substring(0, 150)}...
                  </p>
                </a>
              </li>
            ))}
          </ul>
        ) : searchTerm().length > 0 ? (
          <p class="text-center text-gray-500">No results found</p>
        ) : null}
      </div>
    </div>
  );
}
