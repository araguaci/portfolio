import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const jsonPath = join(root, 'public', 'projetos-online.json')
const blogDir = join(root, 'src', 'content', 'blog')
const soft404 = /DEPLOYMENT_NOT_FOUND|404:\s*NOT_FOUND|This page could not be found|Page not found|The deployment could not be found|This page doesn't exist/i

const data = JSON.parse(readFileSync(jsonPath, 'utf8'))
const blogFiles = readdirSync(blogDir).filter((name) => name.endsWith('.md'))

const posts = blogFiles.map((file) => {
	const full = join(blogDir, file)
	const raw = readFileSync(full, 'utf8')
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
	const front = match?.[1] ?? ''
	const urls = [...front.matchAll(/url:\s*["']?(https?:\/\/[^\s"']+)/g)].map((item) => item[1])
	return { file, full, raw, urls }
})

const urls = new Set()
for (const projeto of data.projetos) urls.add(projeto.url)
for (const post of posts) post.urls.forEach((url) => urls.add(url))

async function probe(url) {
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), 12000)
	try {
		const response = await fetch(url, {
			redirect: 'follow',
			signal: controller.signal,
			headers: { 'user-agent': 'artesdosul-preview-check/1.0' }
		})
		const text = (await response.text()).slice(0, 80000)
		if (response.status === 404 || response.status === 410) {
			return { ok: false, reason: `http-${response.status}` }
		}
		if (response.status >= 500) return { ok: false, reason: `http-${response.status}` }
		if (soft404.test(text)) return { ok: false, reason: 'soft-404' }
		if (!response.ok) return { ok: false, reason: `http-${response.status}` }
		return { ok: true, reason: `http-${response.status}` }
	} catch (error) {
		return { ok: false, reason: error.name === 'AbortError' ? 'timeout' : 'network' }
	} finally {
		clearTimeout(timer)
	}
}

async function capture(url) {
	const shot = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=400&h=300`
	for (let attempt = 0; attempt < 3; attempt++) {
		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), 20000)
		try {
			const response = await fetch(shot, { signal: controller.signal })
			const type = response.headers.get('content-type') ?? ''
			const buffer = Buffer.from(await response.arrayBuffer())
			const ready = response.ok && type.startsWith('image/') && !type.includes('gif') && buffer.length > 4000
			if (ready) return { ok: true, reason: `image-${buffer.length}` }
		} catch {
			/* retry */
		} finally {
			clearTimeout(timer)
		}
		await new Promise((resolve) => setTimeout(resolve, 1800))
	}
	return { ok: false, reason: 'preview-failed' }
}

async function mapPool(items, limit, worker) {
	const results = new Map()
	let index = 0
	async function run() {
		while (index < items.length) {
			const current = items[index++]
			results.set(current, await worker(current))
		}
	}
	await Promise.all(Array.from({ length: limit }, run))
	return results
}

const list = [...urls]
console.log(`checking ${list.length} urls`)
const live = await mapPool(list, 6, async (url) => {
	const status = await probe(url)
	if (!status.ok) {
		console.log(`FAIL ${status.reason} ${url}`)
		return status
	}
	const shot = await capture(url)
	console.log(`${shot.ok ? 'OK' : 'FAIL'} ${shot.reason} ${url}`)
	return shot.ok ? { ok: true, reason: shot.reason } : shot
})

const norm = (url) => {
	const parsed = new URL(url)
	if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
		parsed.pathname = parsed.pathname.slice(0, -1)
	}
	parsed.hash = ''
	return parsed.toString()
}
const captured = new Set(
	[...live.entries()].filter(([, value]) => value.ok).map(([url]) => norm(url))
)
const failed = new Set([...live.keys()].filter((url) => !captured.has(norm(url))))

let draftedPosts = 0
for (const post of posts) {
	if (post.urls.length === 0) continue
	const broken = post.urls.every((url) => failed.has(url))
	if (!broken) continue
	if (/^draft:\s*true/m.test(post.raw)) continue
	const next = post.raw.replace(/^---\r?\n/, '---\ndraft: true\n')
	writeFileSync(post.full, next)
	draftedPosts++
	console.log(`draft post ${post.file}`)
}

let draftedProjects = 0
for (const projeto of data.projetos) {
	const mark = failed.has(projeto.url)
	if (mark) {
		projeto.draft = true
		draftedProjects++
	} else {
		delete projeto.draft
	}
}
writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n')
console.log(JSON.stringify({ checked: list.length, failed: failed.size, draftedPosts, draftedProjects }))
