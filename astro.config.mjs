import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import path from 'path'
import { fileURLToPath } from 'url'
import { remarkReadingTime } from './src/utils/readTime.ts'
import { siteConfig } from './src/data/site.config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://astro.build/config
export default defineConfig({
	site: siteConfig.site,
	output: 'static',
	build: {
		outDir: 'docs'
	},
	vite: {
		resolve: {
			alias: [
				{ find: '@/site-config', replacement: path.resolve(__dirname, 'src/data/site.config.ts') },
				{ find: '@', replacement: path.resolve(__dirname, 'src') }
			],
			extensions: ['.astro', '.ts', '.tsx', '.js', '.jsx', '.json', '.mjs']
		}
	},
	markdown: {
		remarkPlugins: [remarkReadingTime],
		drafts: true,
		shikiConfig: {
			theme: 'material-theme-palenight',
			wrap: true
		}
	},
	integrations: [
		mdx({
			syntaxHighlight: 'shiki',
			shikiConfig: {
				experimentalThemes: {
					light: 'vitesse-light',
					dark: 'material-theme-palenight',
				  },
				wrap: true
			},
			drafts: true
		}),
		// sitemap(), // Desabilitado: erro "destinationDir must be a relative path" no Windows
		tailwind()
	]
})
