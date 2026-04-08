const CACHE_NAME = 'noshowkiller-v4'
const DYNAMIC_CACHE = 'noshowkiller-dynamic-v1'
const OFFLINE_URL = '/offline'

const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/offline',
]

self.addEventListener('install', (event) => {
  console.log('[SW] Install event fired')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets')
      // Try to cache all assets, but don't fail if some fail
      return Promise.allSettled(
        STATIC_ASSETS.map((url) => cache.add(url).catch((err) => {
          console.warn(`[SW] Failed to cache ${url}:`, err)
        }))
      )
    }).catch((err) => {
      console.error('[SW] Install failed:', err)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event fired')
  event.waitUntil(
    caches.keys().then((keys) => {
      console.log('[SW] Cleaning up old caches:', keys)
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key)
            return caches.delete(key)
          })
      )
    }).catch((err) => {
      console.error('[SW] Activate failed:', err)
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  
  try {
    const url = new URL(request.url)
    
    // Skip browser extensions and chrome internal URLs
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
      return
    }

    // API requests: Network first with cache fallback
    if (url.pathname.startsWith('/api/')) {
      if (request.method !== 'GET') {
        // Non-GET requests: Network only, no caching
        event.respondWith(
          fetch(request)
            .catch(() => {
              return new Response(
                JSON.stringify({ error: 'offline' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
              )
            })
        )
        return
      }

      // GET requests: Stale-while-revalidate
      event.respondWith(
        caches.open(DYNAMIC_CACHE).then((cache) => {
          return cache.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
              .then((networkResponse) => {
                // Only cache successful responses
                if (networkResponse && networkResponse.ok && networkResponse.status === 200) {
                  cache.put(request, networkResponse.clone())
                }
                return networkResponse
              })
              .catch(() => {
                // Network failed; use cached response if available
                if (cachedResponse) {
                  return cachedResponse
                }
                // Return offline error response
                return new Response(
                  JSON.stringify({ error: 'offline' }),
                  { status: 503, headers: { 'Content-Type': 'application/json' } }
                )
              })

            // Return cached response if available, otherwise wait for network
            return cachedResponse || fetchPromise
          })
        }).catch(() => {
          // Cache operation failed, try network directly
          return fetch(request).catch(() => {
            return new Response(
              JSON.stringify({ error: 'offline' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
          })
        })
      )
      return
    }

    // Navigation: Network first, fallback to offline page
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .catch(() => {
            return caches.match(OFFLINE_URL) || 
              new Response('Offline - Please try again later', { status: 503 })
          })
      )
      return
    }

    // Static assets: Cache first, network fallback
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response
          }
          return fetch(request).then((response) => {
            // Cache successful responses for next time
            if (response && response.ok && response.status === 200) {
              const cacheName = request.method === 'GET' ? DYNAMIC_CACHE : undefined
              if (cacheName) {
                const cloned = response.clone()
                caches.open(cacheName).then((cache) => {
                  cache.put(request, cloned)
                }).catch(() => {
                  // Ignore cache errors
                })
              }
            }
            return response
          })
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL) || 
              new Response('Offline', { status: 503 })
          }
          return new Response('Offline', { status: 503 })
        })
    )
  } catch (error) {
    console.error('[SW] Fetch handler error:', error)
    // Return offline response
    event.respondWith(
      new Response('Error processing request', { status: 500 })
    )
  }
})


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
