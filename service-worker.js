// Service Worker for CreativeCrowdChallenge PWA
const CACHE_NAME = 'ccc-app-v1';

// Files to cache for offline use
const CACHE_ASSETS = [
  '/',
  '/simple-test.html',
  '/manifest.json',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png',
  // Add CSS, JS, and other essential files
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
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching');
  
  event.respondWith(
    // Try network first, then cache
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone();
        
        // Open cache
        caches.open(CACHE_NAME).then((cache) => {
          // Add response to cache for future offline use
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // If network fails, serve from cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          // Return default offline page for HTML requests
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});