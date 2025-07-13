const CACHE_NAME = 'angushallyapp-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/AH-logo-no-background.ico',
  '/ah-logo.jpg'
];

// Install event - cache static assets with error handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache each URL individually to handle failures gracefully
        const cachePromises = urlsToCache.map(url => {
          return cache.add(url).catch(error => {
            console.warn(`Failed to cache ${url}:`, error);
            // Don't fail the entire installation if one resource fails
            return null;
          });
        });
        
        return Promise.all(cachePromises);
      })
      .catch(error => {
        console.error('Service worker installation failed:', error);
        // Don't fail the installation - continue without caching
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(error => {
        console.warn('Fetch failed for:', event.request.url, error);
        // Return a fallback response or let the browser handle it
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 