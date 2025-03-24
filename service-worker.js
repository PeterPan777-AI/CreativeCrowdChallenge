// Service Worker for CreativeCrowdChallenge PWA
const CACHE_NAME = 'ccc-app-v1';
const DATA_CACHE_NAME = 'ccc-data-v1';

// Files to cache for offline use
const CACHE_ASSETS = [
  '/',
  '/simple-test.html',
  '/offline.html',
  '/manifest.json',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png',
  // CSS and other assets would be listed here
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DATA_CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Now ready to handle fetches!');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle API and static requests differently
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests - network first, then cached
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response
          const responseClone = response.clone();
          
          // Cache API responses separately
          caches.open(DATA_CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
              console.log('Service Worker: API Response Cached', url.pathname);
            });
            
          return response;
        })
        .catch(() => {
          console.log('Service Worker: Fetching API from cache for', url.pathname);
          return caches.match(event.request)
            .then(cachedResponse => {
              // Return cached response or default data
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If we don't have a cached API response, return a default offline message
              return new Response(
                JSON.stringify({
                  status: 'offline',
                  message: 'You are currently offline. Please check your connection.'
                }),
                { 
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
  } 
  // Handle static assets - cache first, then network
  else {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return from cache if available
            console.log('Service Worker: Fetching resource from cache:', url.pathname);
            return cachedResponse;
          }
          
          // If not in cache, get from network
          return fetch(event.request)
            .then(response => {
              // Clone the response
              const responseClone = response.clone();
              
              // Open static cache and cache the fetched response
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone);
                  console.log('Service Worker: Resource cached for offline use:', url.pathname);
                });
                
              return response;
            })
            .catch(() => {
              // Return offline page for HTML requests if network fails
              if (event.request.headers.get('accept').includes('text/html')) {
                console.log('Service Worker: Serving offline page for:', url.pathname);
                return caches.match('/offline.html');
              }
            });
        })
    );
  }
});