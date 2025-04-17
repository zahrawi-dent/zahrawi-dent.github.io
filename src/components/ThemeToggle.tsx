// src/components/ThemeToggle.jsx
import { Show } from 'solid-js';
import sidebarStore from '../stores/sidebarStore'; // Import the store

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export default function ThemeToggle() {
  const store = sidebarStore; // Access the store

  return (
    <button
      onClick={() => store.toggleTheme()} // Call the store action
      type="button"
      aria-label={`Switch to ${store.state.theme === 'light' ? 'dark' : 'light'} mode`}
      aria-pressed={store.state.theme === 'dark'}
      class="rounded-full p-2 text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
    >
      <Show when={store.state.theme === 'light'} fallback={<MoonIcon />}>
        <SunIcon />
      </Show>
    </button>
  );
}
