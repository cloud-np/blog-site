import { defineConfig, fontProviders } from 'astro/config';
import { settings } from './src/i18n/settings.const';
import sitemap from "@astrojs/sitemap";
import astroExpressiveCode from 'astro-expressive-code';
import { getExpressiveCodeConfig } from "./src/config/astro-expressive-code.config.js";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import svelte from '@astrojs/svelte';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import playformCompress from '@playform/compress';

export default defineConfig({
	site: settings.url,
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Inter',
			cssVariable: '--font-inter',
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/inter-v19-greek_latin-regular.woff2'],
						weight: '400',
						style: 'normal',
					},
					{
						src: ['./src/assets/fonts/inter-v19-latin-500.woff2'],
						weight: '500',
						style: 'normal',
					},
					{
						src: ['./src/assets/fonts/inter-v19-greek_latin-700.woff2'],
						weight: '700',
						style: 'normal',
					},
				],
			},
		},
	],
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
	adapter: node({
		mode: 'standalone',
	}),
});
