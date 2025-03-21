// @ts-check
import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";

import preact from "@astrojs/preact";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://zhahrawi-dent.github.io",
  integrations: [preact(), pagefind(), icon()],

  markdown: {},

  vite: {
    plugins: [tailwindcss()],
  },
});
