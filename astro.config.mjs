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

import { remarkModifiedTime } from './src/utils/remark-modified-time.mjs';








import reunmediaogImages from "@reunmedia/astro-og-images";



import ogImages from "@reunmedia/astro-og-images";
import { readFile } from "fs/promises";





// https://astro.build/config
export default defineConfig({
  site: "https://zahrawi-dent.github.io",
  integrations: [
    pagefind(),
    icon(),
    solidJs(),
    mdx(),
    sitemap(),
    AstroPwa(),
    yeskunallumami({ id: "39cd2b10-2385-4cd1-8883-151d28432738" }),
    reunmediaogImages(),
    ogImages({
      // At least one font is required
      fonts: [
        {
          name: "Roboto",
          data: await readFile(
            "./node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff",
          ),
        },
      ],
    }),
  ],

  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },
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
