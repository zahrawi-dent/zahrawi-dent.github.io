// @ts-check
import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";

import preact from "@astrojs/preact";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://zhahrawi-dent.github.io",
  integrations: [preact(), pagefind(), icon(), react()],

  markdown: {},

  vite: {
    plugins: [tailwindcss()],
  },
});