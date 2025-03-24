// Service Worker for CreativeCrowdChallenge PWA
const CACHE_NAME = 'ccc-app-v1';
const DATA_CACHE_NAME = 'ccc-data-v1';
const SYNC_QUEUE_NAME = 'ccc-sync-queue';

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

// Background sync event - process queued requests when online
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background Sync event triggered', event.tag);
  
  if (event.tag === 'sync-votes') {
    console.log('Service Worker: Processing queued votes');
    event.waitUntil(processQueuedVotes());
  } else if (event.tag === 'sync-submissions') {
    console.log('Service Worker: Processing queued submissions');
    event.waitUntil(processQueuedSubmissions());
  }
});

// Process queued votes when back online
async function processQueuedVotes() {
  try {
    // Open the IndexedDB store
    const db = await openDB();
    const store = db.transaction('votes', 'readwrite').objectStore('votes');
    const votes = await store.getAll();
    
    console.log('Service Worker: Found queued votes:', votes.length);
    
    // Process each queued vote
    const successfulVotes = [];
    
    for (const vote of votes) {
      try {
        // Attempt to send the vote to the server
        const response = await fetch('/api/vote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(vote)
        });
        
        if (response.ok) {
          console.log('Service Worker: Successfully processed vote for submission:', vote.submissionId);
          successfulVotes.push(vote.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to process vote:', error);
      }
    }
    
    // Delete successful votes from the queue
    const tx = db.transaction('votes', 'readwrite');
    const voteStore = tx.objectStore('votes');
    
    for (const voteId of successfulVotes) {
      await voteStore.delete(voteId);
    }
    
    await tx.done;
    console.log('Service Worker: Removed processed votes from queue');
    
    return true;
  } catch (error) {
    console.error('Service Worker: Error processing vote queue:', error);
    return false;
  }
}

// Process queued submissions when back online
async function processQueuedSubmissions() {
  try {
    // Open the IndexedDB store
    const db = await openDB();
    const store = db.transaction('submissions', 'readwrite').objectStore('submissions');
    const submissions = await store.getAll();
    
    console.log('Service Worker: Found queued submissions:', submissions.length);
    
    // Process each queued submission
    const successfulSubmissions = [];
    
    for (const submission of submissions) {
      try {
        // Create FormData for file uploads
        const formData = new FormData();
        
        // Add all submission data to formData
        for (const [key, value] of Object.entries(submission.data)) {
          formData.append(key, value);
        }
        
        // Add file if it exists
        if (submission.file) {
          formData.append('file', submission.file);
        }
        
        // Attempt to send the submission to the server
        const response = await fetch('/api/submissions', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          console.log('Service Worker: Successfully processed submission for competition:', submission.data.competitionId);
          successfulSubmissions.push(submission.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to process submission:', error);
      }
    }
    
    // Delete successful submissions from the queue
    const tx = db.transaction('submissions', 'readwrite');
    const submissionStore = tx.objectStore('submissions');
    
    for (const submissionId of successfulSubmissions) {
      await submissionStore.delete(submissionId);
    }
    
    await tx.done;
    console.log('Service Worker: Removed processed submissions from queue');
    
    return true;
  } catch (error) {
    console.error('Service Worker: Error processing submission queue:', error);
    return false;
  }
}

// Helper function to open IndexedDB
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cccOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('votes')) {
        db.createObjectStore('votes', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

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