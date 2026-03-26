const CACHE_NAME = 'noshowkiller-v2'
const DYNAMIC_CACHE = 'noshowkiller-dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon.png',
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

  // API requests: Stale-while-revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone())
            return networkResponse
          })
          return cachedResponse || fetchPromise
        })
      })
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
