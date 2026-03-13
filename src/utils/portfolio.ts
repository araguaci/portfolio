export interface Projeto {
	titulo: string
	descricao: string
	tags: string[]
	url: string
	thumbnail?: string
}

export interface ProjetosData {
	updated: string
	fonte: string
	projetos: Projeto[]
}

/**
 * Carrega os projetos do JSON
 */
export async function getProjetos(): Promise<Projeto[]> {
	const { readFileSync } = await import('fs')
	const { join } = await import('path')

	// process.cwd() = raiz do projeto durante build
	const filePath = join(process.cwd(), 'public', 'projetos-online.json')
	const raw = readFileSync(filePath, 'utf-8')
	const data: ProjetosData = JSON.parse(raw)
	return data.projetos
}

/**
 * Extrai tags que aparecem em mais de um projeto, ordenadas alfabeticamente
 */
export function getPortfolioCategories(projetos: Projeto[]): string[] {
	const tagCount = new Map<string, number>()
	projetos.forEach((p) =>
		p.tags.forEach((t) => {
			const key = t.toLowerCase()
			tagCount.set(key, (tagCount.get(key) ?? 0) + 1)
		})
	)
	return Array.from(tagCount.entries())
		.filter(([, count]) => count > 1)
		.map(([tag]) => tag)
		.sort((a, b) => a.localeCompare(b))
}

/**
 * Filtra projetos por tag (case-insensitive)
 */
export function filterProjetosByTag(projetos: Projeto[], tag: string): Projeto[] {
	const tagLower = tag.toLowerCase()
	return projetos.filter((p) => p.tags.some((t) => t.toLowerCase() === tagLower))
}

/**
 * Gera URL de thumbnail via screenshot do site (WordPress mshots - gratuito)
 */
export function getThumbnailUrl(url: string, width = 400, height = 300): string {
	return `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=${width}&h=${height}`
}
