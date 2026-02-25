import { defineConfig } from 'astro/config';
import { settings } from './src/i18n/settings.const';
import sitemap from "@astrojs/sitemap";
import astroExpressiveCode from 'astro-expressive-code';
import { getExpressiveCodeConfig } from "./src/config/astro-expressive-code.config.js";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import svelte from '@astrojs/svelte';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import partytown from '@astrojs/partytown';

import tailwindcss from '@tailwindcss/vite';
import playformCompress from '@playform/compress';

export default defineConfig({
	site: settings.url,
	integrations: [
		sitemap({
			filter: (page) => !page.includes('/privacy-policy'),
		}),
		// To allow code blocks on MDX pages to use astro-expressive-code, please move astroExpressiveCode()
		//  before mdx() in the "integrations" array of your Astro config file.
		astroExpressiveCode(getExpressiveCodeConfig()),
		mdx(),
		icon({
			iconDir: 'src/assets/icons',
		}),
		svelte({ extensions: ['.svelte'] }),
		partytown({
			config: {
				forward: ["gtag", "dataLayer.push"], // Needed for GA
			}
		}),
		playformCompress(),
	],
	vite: {
		ssr: {
			external: ["svgo"]
		},
		resolve: {
			conditions: ["browser"]
		},
		markdown: {
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex]
		},
		plugins: [tailwindcss()],
	},
	prefetch: {
		defaultStrategy: 'hover',
		prefetchAll: true
	},
	output: 'static',
	plugins: [],
});
