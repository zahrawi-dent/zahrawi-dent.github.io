// @ts-check
import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

import solidJs from "@astrojs/solid-js";

import mdx from "@astrojs/mdx";



// https://astro.build/config
export default defineConfig({
  site: "https://zahrawi-dent.github.io",
  integrations: [pagefind(), icon(), solidJs(), mdx()],

  markdown: {},
  redirects: {},
  prefetch: {
    prefetchAll: true,
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    build: {
      rollupOptions: {
        external: ["/pagefind/pagefind.js"],
      },
    },
  },
});
