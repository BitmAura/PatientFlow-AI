const CACHE_NAME = 'noshowkiller-v3'
const DYNAMIC_CACHE = 'noshowkiller-dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon',
  '/offline',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key)
          }
        })
      )
    })
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  // API requests: Only apply caching to safe GET requests.
  // Avoid caching POST/PUT/DELETE to prevent storing sensitive data or
  // causing inconsistent state. For non-GET requests, use network-first
  // and fall back to the offline page on failure.
  if (url.pathname.startsWith('/api/')) {
    if (request.method !== 'GET') {
      event.respondWith(
        fetch(request).catch(() => caches.match('/offline'))
      )
      return
    }

    // For GET requests, use stale-while-revalidate but only cache
    // successful responses. Protect against caching non-OK responses.
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              try {
                if (networkResponse && networkResponse.ok) {
                  // Only cache successful GET responses
                  cache.put(request, networkResponse.clone())
                }
              } catch (err) {
                // Ignore cache put errors (e.g. non-cacheable requests)
              }
              return networkResponse
            })
            .catch(() => {
              // Network failed; prefer cachedResponse if available
              return cachedResponse || Promise.reject('network-error')
            })

          return cachedResponse || fetchPromise
        })
      }).catch(() => fetch(request))
    )
    return
  }

  // Navigation: Network first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/offline')
      })
    )
    return
  }

  // Static assets: Cache first
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request)
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
