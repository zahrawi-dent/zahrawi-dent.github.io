// @ts-check

import fs from "fs";


import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

import solidJs from "@astrojs/solid-js";

import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import AstroPwa from "@vite-pwa/astro";



import yeskunallumami from "@yeskunall/astro-umami";



import opengraphImages, { presets } from "astro-opengraph-images";



// https://astro.build/config
export default defineConfig({
  site: "https://zahrawi-dent.github.io",
  integrations: [
    pagefind(),
    icon(), solidJs(), mdx(), sitemap(), AstroPwa(), yeskunallumami({ id: "39cd2b10-2385-4cd1-8883-151d28432738" }),

    opengraphImages({
      options: {
        fonts: [
          {
            name: "Roboto",
            weight: 400,
            style: "normal",
            data: fs.readFileSync("node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff"),
          },
        ],
      },
      render: presets.blackAndWhite,
    }),

  ],

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
      }
    },
  },
});
