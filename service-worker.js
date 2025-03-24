// Service Worker for CreativeCrowdChallenge PWA
const CACHE_NAME = 'ccc-app-v2';
const DATA_CACHE_NAME = 'ccc-data-v2';
const SYNC_QUEUE_NAME = 'ccc-sync-queue';
const NOTIFICATION_BADGE_COUNT = 'ccc-notification-badge-count';

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

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  let notificationData = {
    title: 'New Update',
    body: 'Something new happened in CreativeCrowdChallenge',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/icon-192x192.png',
    data: {
      url: '/'
    }
  };
  
  // Try to parse the push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Service Worker: Error parsing push notification data', error);
    }
  }
  
  // Show notification and increment badge count
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        data: notificationData.data,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        actions: [
          {
            action: 'view',
            title: 'View'
          }
        ]
      }),
      updateBadgeCount(1) // Increment badge count by 1
    ])
  );
});

// Notification click event - handle user clicking on a notification
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  // Close the notification
  event.notification.close();
  
  // Get the notification data
  const url = event.notification.data?.url || '/';
  
  // Open the app and navigate to the specified URL
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no open window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url).then(() => updateBadgeCount(-1)); // Decrement badge count by 1
      }
    })
  );
});

// Process queued votes when back online
async function processQueuedVotes() {
  try {
    // Open the IndexedDB store
    const db = await openDB();
    const store = db.transaction('pendingVotes', 'readwrite').objectStore('pendingVotes');
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
        } else {
          const responseData = await response.json();
          console.error('Service Worker: Server rejected vote:', responseData.error);
        }
      } catch (error) {
        console.error('Service Worker: Failed to process vote:', error);
      }
    }
    
    // Delete successful votes from the queue
    const tx = db.transaction('pendingVotes', 'readwrite');
    const voteStore = tx.objectStore('pendingVotes');
    
    for (const voteId of successfulVotes) {
      await voteStore.delete(voteId);
    }
    
    await tx.done;
    console.log('Service Worker: Removed processed votes from queue:', successfulVotes.length);
    
    // Notify the client if available
    if (successfulVotes.length > 0) {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETED',
          data: {
            type: 'votes',
            count: successfulVotes.length
          }
        });
      });
    }
    
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
    const store = db.transaction('pendingSubmissions', 'readwrite').objectStore('pendingSubmissions');
    const submissions = await store.getAll();
    
    console.log('Service Worker: Found queued submissions:', submissions.length);
    
    // Process each queued submission
    const successfulSubmissions = [];
    
    for (const submission of submissions) {
      try {
        // In a real production app, we would handle file uploads using FormData,
        // but for simplicity in this demo, we'll send the JSON directly
        // since our server endpoint is set up to handle JSON submissions

        // Send the submission data to the server
        const response = await fetch('/api/submission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          console.log('Service Worker: Successfully processed submission for competition:', submission.data.competitionId);
          successfulSubmissions.push(submission.id);
        } else {
          const responseData = await response.json();
          console.error('Service Worker: Server rejected submission:', responseData.error);
        }
      } catch (error) {
        console.error('Service Worker: Failed to process submission:', error);
      }
    }
    
    // Delete successful submissions from the queue
    const tx = db.transaction('pendingSubmissions', 'readwrite');
    const submissionStore = tx.objectStore('pendingSubmissions');
    
    for (const submissionId of successfulSubmissions) {
      await submissionStore.delete(submissionId);
    }
    
    await tx.done;
    console.log('Service Worker: Removed processed submissions from queue:', successfulSubmissions.length);
    
    // Notify the client if available
    if (successfulSubmissions.length > 0) {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETED',
          data: {
            type: 'submissions',
            count: successfulSubmissions.length
          }
        });
      });
    }
    
    return true;
  } catch (error) {
    console.error('Service Worker: Error processing submission queue:', error);
    return false;
  }
}

// Helper function to open IndexedDB
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CreativeCrowdChallenge', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('pendingVotes')) {
        db.createObjectStore('pendingVotes', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pendingSubmissions')) {
        db.createObjectStore('pendingSubmissions', { keyPath: 'id', autoIncrement: true });
      }
      
      // Create a store for app metadata (including badge count)
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };
  });
}

// Update badge count for notifications
async function updateBadgeCount(change) {
  try {
    // Open the metadata store
    const db = await openDB();
    const tx = db.transaction('metadata', 'readwrite');
    const store = tx.objectStore('metadata');
    
    // Get current badge count
    let countRecord = await store.get(NOTIFICATION_BADGE_COUNT);
    let currentCount = countRecord?.value || 0;
    
    // Update count (ensure it's not negative)
    const newCount = Math.max(0, currentCount + change);
    
    // Save updated count
    await store.put({ key: NOTIFICATION_BADGE_COUNT, value: newCount });
    await tx.done;
    
    // Notify clients about the badge count update
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      client.postMessage({
        type: 'BADGE_COUNT_UPDATED',
        data: {
          count: newCount
        }
      });
    });
    
    console.log('App badge updated:', newCount);
    return newCount;
  } catch (error) {
    console.error('Error updating badge count:', error);
    return null;
  }
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