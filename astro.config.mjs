import { defineConfig } from 'astro/config';
import { settings } from './src/data/settings.const';
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import astroExpressiveCode from 'astro-expressive-code';
import qwikdev from "@qwikdev/astro";
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import icon from "astro-icon";
import { getExpressiveCodeConfig } from "./config/astro-expressive-code.config.js";

export default defineConfig({
	site: settings.url,
	integrations: [
		sitemap(),
		astroExpressiveCode(getExpressiveCodeConfig()),
		mdx(),
		tailwind(),
		icon(),
		qwikdev({ include: ['**/qwik/*'] }),
		react({ include: ['**/react/*'] })
	],
	vite: {
		ssr: {
			external: ["svgo"]
		},
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
});