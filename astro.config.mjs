// @ts-check
import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  site: "https://zhahrawi-dent.github.io",
  integrations: [pagefind(), icon(), solidJs()],

  markdown: {},

  vite: {
    plugins: [tailwindcss()],
  },
});
