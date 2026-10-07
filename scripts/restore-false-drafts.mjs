import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const log = readFileSync(
	'C:/Users/aragu/.cursor/projects/d-app-aragua-portfolio-portfolio-astro/terminals/575845.txt',
	'utf8'
)

const norm = (url) => {
	const parsed = new URL(url)
	if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
		parsed.pathname = parsed.pathname.slice(0, -1)
	}
	parsed.hash = ''
	return parsed.toString()
}

const ok = new Set()
for (const line of log.split(/\r?\n/)) {
	const match = line.match(/^(OK|FAIL) \S+ (\S+)$/)
	if (match && match[1] === 'OK') ok.add(norm(match[2]))
}

const blogDir = 'src/content/blog'
let restored = 0
for (const file of readdirSync(blogDir).filter((name) => name.endsWith('.md'))) {
	const full = join(blogDir, file)
	let raw = readFileSync(full, 'utf8')
	if (!/^---\r?\ndraft: true\r?\n/.test(raw)) continue
	const front = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]
	const urls = [...front.matchAll(/url:\s*["']?(https?:\/\/[^\s"']+)/g)].map((item) => item[1])
	if (urls.some((url) => ok.has(norm(url)))) {
		raw = raw.replace(/^---\r?\ndraft: true\r?\n/, '---\n')
		writeFileSync(full, raw)
		restored++
		console.log('restore', file)
	}
}

const jsonPath = 'public/projetos-online.json'
const data = JSON.parse(readFileSync(jsonPath, 'utf8'))
let restoredProjects = 0
for (const projeto of data.projetos) {
	if (projeto.draft && ok.has(norm(projeto.url))) {
		delete projeto.draft
		restoredProjects++
		console.log('restore project', projeto.titulo)
	}
}
writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n')
const still = data.projetos.filter((projeto) => projeto.draft)
console.log(JSON.stringify({ restored, restoredProjects, stillDraftProjects: still.length }, null, 2))
for (const projeto of still) console.log(projeto.titulo, projeto.url)
