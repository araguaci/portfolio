/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,md,mdx,ts}'],
	theme: {
		extend: {
			colors: {
				white: '#f8f9fa',
				'cyber-orange': '#ff6b35',
				'electric-cyan': '#00d9ff',
				'cyber-green': '#10b981'
			},
			fontFamily: {
				body: ['Manrope', ...defaultTheme.fontFamily.sans],
				display: ['"Bricolage Grotesque"', 'Manrope', ...defaultTheme.fontFamily.sans],
				mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono]
			},
			gridTemplateColumns: {
				list: 'repeat(auto-fill, minmax(400px, max-content))'
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
}
