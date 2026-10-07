import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, extname, join, relative } from 'node:path'

const exts = new Set(['.webp', '.png', '.jpg', '.jpeg'])
const scanDirs = [
	'public/assets/img/projects',
	'public/assets/img',
	'src/assets',
	'src/assets/img/projects'
]
const destDir = 'src/assets/previews'
const publicDir = 'public/assets/img/projects'

function indexDir(dir) {
	const map = new Map()
	if (!existsSync(dir)) return map
	for (const name of readdirSync(dir)) {
		const ext = extname(name).toLowerCase()
		if (!exts.has(ext)) continue
		const key = basename(name, extname(name)).toLowerCase()
		if (!map.has(key)) map.set(key, join(dir, name))
	}
	return map
}

const maps = scanDirs.map(indexDir)

function keysFor(url) {
	const absolute = url.startsWith('http') ? url : `https://${url}`
	const parsed = new URL(absolute)
	const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
	const keys = [host]
	const label = host.split('.')[0]
	if (label && label !== host) keys.push(label)
	const segment = parsed.pathname.split('/').filter(Boolean).pop()
	if (segment) keys.push(segment.replace(/\.(html|php|md)$/i, '').toLowerCase())
	return keys
}

function findPreview(url) {
	for (const key of keysFor(url)) {
		for (const map of maps) {
			if (map.has(key)) return map.get(key)
		}
	}
	return ''
}

function toPosix(filePath) {
	return filePath.split('\\').join('/')
}

mkdirSync(destDir, { recursive: true })
mkdirSync(publicDir, { recursive: true })

function linkFile(jsonPath) {
	const data = JSON.parse(readFileSync(jsonPath, 'utf8'))
	let found = 0
	let missing = 0

	data.projetos = data.projetos.map((projeto) => {
		const source = findPreview(projeto.url)
		let thumbnail = ''
		let origem = ''

		if (source) {
			const name = basename(source)
			const srcCopy = join(destDir, name)
			if (toPosix(source) !== toPosix(srcCopy)) copyFileSync(source, srcCopy)

			const inPublic = toPosix(source).startsWith('public/')
			if (inPublic) {
				thumbnail = `/${toPosix(relative('public', source))}`
			} else {
				const published = join(publicDir, name)
				if (!existsSync(published)) copyFileSync(source, published)
				thumbnail = `/assets/img/projects/${name}`
			}
			origem = toPosix(source)
			found++
		} else {
			missing++
		}

		const next = {}
		for (const [key, value] of Object.entries(projeto)) {
			if (key === 'thumbnail' || key === 'origem') continue
			next[key] = value
			if (key === 'url') {
				next.thumbnail = thumbnail
				next.origem = origem
			}
		}
		return next
	})

	writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n')
	console.log(jsonPath, { found, missing, total: data.projetos.length })
}

linkFile('public/projetos-online.json')
linkFile('docs/projetos-online.json')
