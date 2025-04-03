// Basic service worker for the Weather PWA
self.addEventListener("install", (event) => {
  console.log("Service worker installing...");
  // Skip waiting forces the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activating...");
});

// Handle fetch events to provide offline functionality
self.addEventListener("fetch", (event) => {
  // For simplicity, we're just passing through network requests
  // A real implementation would include caching strategies
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response(
        "You appear to be offline. Please check your connection."
      );
    })
  );
});
