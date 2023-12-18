import { defineConfig } from 'astro/config';
import { settings } from './src/data/settings.const';
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import astroExpressiveCode from 'astro-expressive-code';
import tailwind from '@astrojs/tailwind';


// https://astro.build/config
export default defineConfig({
    site: settings.url,
    integrations: [
        sitemap(),
        astroExpressiveCode({
            themeCssSelector: (theme) => `[color-scheme='${theme.type}']`,
            themes: ['material-theme-darker', 'material-theme-lighter'],
        }),
        mdx(),
        tailwind()
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
