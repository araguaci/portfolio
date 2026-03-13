interface SiteConfig {
	site: string
	author: string
	title: string
	description: string
	lang: string
	ogLocale: string
	shareMessage: string
	paginationSize: number
}

export const siteConfig: SiteConfig = {
	site: 'https://artesdosul.github.io/',
	author: 'Artes do Sul',
	title: 'Portfolio Artes do Sul',
	description:
		'Transforme sua presença digital em resultados reais. Desenvolvimento de sites, e-commerce e sistemas com 25 anos de experiência. Bombinhas, SC.',
	lang: 'pt-BR',
	ogLocale: 'pt_BR',
	shareMessage: 'Compartilhe este post',
	paginationSize: 6
}
