import { defineConfig } from 'astro/config';
import { settings } from './src/data/settings';
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import astroExpressiveCode from 'astro-expressive-code'


// https://astro.build/config
export default defineConfig({
  site: settings.url,
  integrations: [
    sitemap(),
    astroExpressiveCode({
      themes: ['dracula']
    }),
    mdx()
 ],
  vite: {
    ssr: {
      external: ["svgo"]
    }
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
});