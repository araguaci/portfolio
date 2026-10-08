// Service Worker Artes do Sul — Produção Vercel & PWA
const CACHE_NAME = 'artesdosul-v2'
const PRECACHE_URLS = ['/', '/favicon.svg', '/manifest.webmanifest']

// Instalação: Cache dos arquivos essenciais
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(PRECACHE_URLS))
			.then(() => self.skipWaiting())
	)
})

// Ativação: Limpeza de caches antigos
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.map((key) => {
						if (key !== CACHE_NAME) {
							return caches.delete(key)
						}
					})
				)
			)
			.then(() => self.clients.claim())
	)
})

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
	// Apenas requisições GET
	if (event.request.method !== 'GET') return

	const url = new URL(event.request.url)

	// Apenas requisições HTTP/HTTPS da mesma origem
	if (!url.protocol.startsWith('http') || url.origin !== self.location.origin) {
		return
	}

	// 1. Navegação (HTML da página): Network-First com fallback para cache
	if (event.request.mode === 'navigate') {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					if (response && response.status === 200) {
						const clone = response.clone()
						caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
					}
					return response
				})
				.catch(async () => {
					const cached = await caches.match(event.request)
					if (cached) return cached
					const fallback = await caches.match('/')
					return fallback || new Response('Offline', { status: 503, statusText: 'Offline' })
				})
		)
		return
	}

	// 2. Assets estáticos (Scripts, Fontes, CSS, Imagens): Cache-First com atualização em background
	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				// Atualiza em background sem travar a resposta
				fetch(event.request)
					.then((networkResponse) => {
						if (networkResponse && networkResponse.status === 200) {
							const clone = networkResponse.clone()
							caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
						}
					})
					.catch(() => {})
				return cachedResponse
			}

			// Se não estiver no cache, busca na rede e guarda no cache se for bem-sucedido
			return fetch(event.request)
				.then((networkResponse) => {
					if (networkResponse && networkResponse.status === 200) {
						const clone = networkResponse.clone()
						caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
					}
					return networkResponse
				})
				.catch(() => {
					// NUNCA retorne undefined para o respondWith!
					return new Response('', { status: 408, statusText: 'Network request failed' })
				})
		})
	)
})
