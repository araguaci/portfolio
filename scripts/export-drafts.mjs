import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const blogDir = 'src/content/blog'
const posts = []

for (const file of readdirSync(blogDir).filter((name) => name.endsWith('.md')).sort()) {
	const raw = readFileSync(join(blogDir, file), 'utf8').replace(/\r\n/g, '\n')
	const front = (raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '') + '\n'
	if (!front || !/^draft:\s*true\s*$/m.test(front)) continue

	const field = (name) => {
		const match = front.match(new RegExp(`^${name}:[ \\t]*(.*)\\n((?:[ \\t]+.+\\n)*)`, 'm'))
		if (!match) return ''
		const text = [match[1], ...match[2].split('\n').map((line) => line.trim())]
			.filter(Boolean)
			.join(' ')
		return text.replace(/^["']|["']$/g, '').trim()
	}

	const inlineTags = front.match(/^tags:\s*\[(.*)\]\s*$/m)?.[1]
	const block = front.match(/^tags:\s*\n((?:[ \t]*-[ \t].+\n)+)/m)?.[1] ?? ''
	const blockTags = [...block.matchAll(/^[\t ]*-\s+(.+)$/gm)].map((item) => item[1].trim())
	const tags = inlineTags
		? inlineTags.split(',').map((tag) => tag.trim()).filter(Boolean)
		: blockTags

	posts.push({
		arquivo: `src/content/blog/${file}`,
		titulo: field('title'),
		descricao: field('description'),
		data: field('date'),
		categoria: field('category'),
		tags,
		urls: [...front.matchAll(/url:\s*["']?(https?:\/\/[^\s"']+)/g)].map((item) => item[1])
	})
}

const data = JSON.parse(readFileSync('public/projetos-online.json', 'utf8'))
const projetos = data.projetos
	.filter((projeto) => projeto.draft)
	.map(({ draft, ...projeto }) => projeto)

const payload = {
	updated: new Date().toISOString().slice(0, 10),
	motivo: 'Preview com retorno 404 ou captura sem sucesso',
	posts,
	projetos
}

writeFileSync('drafts.json', JSON.stringify(payload, null, 2) + '\n')
console.log(JSON.stringify({ posts: posts.length, projetos: projetos.length }))
