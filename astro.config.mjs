import { defineConfig } from 'astro/config';
import { settings } from './src/data/settings.const';
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import astroExpressiveCode from 'astro-expressive-code';
import qwikdev from "@qwikdev/astro";
import tailwind from '@astrojs/tailwind';
import icon from "astro-icon";
import { getExpressiveCodeConfig } from "./config/astro-expressive-code.config.js";
import svelte from '@astrojs/svelte';

import partytown from '@astrojs/partytown';

export default defineConfig({
    site: settings.url,
    integrations: [
      sitemap(),
      astroExpressiveCode(getExpressiveCodeConfig()),
      mdx(),
      tailwind(),
      icon({
          iconDir: 'src/assets/icons',
      }),
      // qwikdev({ include: ['**/qwik/*'] }),
      // react({ include: ['**/react/*'] }),
      svelte({ extensions: ['.svelte'] }), // Yet another FE framework #this-is-fine
      qwikdev(),
      partytown({
          config: {
              forward: ["gtag", "dataLayer.push"], // Needed for GA
          }
      }),
    ],
    vite: {
        ssr: {
            external: ["svgo"]
        },
        resolve: {
            conditions: ["browser"]
        }
    },
    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex]
    },
    prefetch: {
        defaultStrategy: 'hover',
        prefetchAll: true
    },
    output: 'static',
    plugins: [],
});