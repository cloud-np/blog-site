import { defineConfig } from 'astro/config';
import { settings } from './src/data/settings.const';
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import astroExpressiveCode, { ExpressiveCodeTheme } from 'astro-expressive-code';
import tailwind from '@astrojs/tailwind';
import fs from 'node:fs'

import icon from "astro-icon";

// Load your saved theme JSONC file here and create a theme from it
const jsoncString = fs.readFileSync(new URL(`./dark-theme.jsonc`, import.meta.url), 'utf-8')
const monokaiPro = ExpressiveCodeTheme.fromJSONString(jsoncString)

export default defineConfig({
	site: settings.url,
	integrations: [sitemap(), astroExpressiveCode({
		themeCssSelector: theme => `[color-scheme='${theme.type}']`,
		// themes: ['material-theme-darker', 'material-theme-lighter'],
		themes: [monokaiPro, 'vitesse-light'],
		// themes: [monokaiPro, 'solarized-light'],
		// useDarkModeMediaQuery: trueo
	}), mdx(), tailwind(), icon()],
	vite: {
		ssr: {
			external: ["svgo"]
		}
	},
	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex]
	},
	prefetch: {
		defaultStrategy: 'hover',
		prefetchAll: true,
	}
});