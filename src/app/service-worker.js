// Weather PWA Service Worker with caching implementation
// This service worker enables offline functionality by caching app resources and API responses

// Define separate cache names to manage different types of cached content
const CACHE_NAME = "weather-app-cache-v1"; // For static app resources
const API_CACHE_NAME = "weather-api-cache-v1"; // For API responses

// Static app resources to pre-cache during installation
// These form the app shell - essential files needed for basic functionality
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/styles.css",
  "/main.js",
  "/assets/icons/",
];

// Patterns to identify API requests that should be cached with a different strategy
// API data is more dynamic and requires special handling
const API_PATTERNS = [
  "https://api.openweathermap.org/data/", // Weather data endpoints
  "https://api.openweathermap.org/geo/", // Geolocation endpoints
  "openweathermap.org/img/wn/", // Weather icon resources
];

/**
 * Install event - triggered when the service worker is first installed
 * This is where we cache the app shell resources
 */
self.addEventListener("install", (event) => {
  console.log("Service worker installing...");

  // Use waitUntil to tell the browser that installation isn't complete
  // until the promised chain is resolved
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        // Add all static resources to the cache
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Force activation without waiting for page reload
  );
});

/**
 * Activate event - triggered when a new service worker takes control
 * This is a good place to clean up old caches
 */
self.addEventListener("activate", (event) => {
  console.log("Service worker activating...");

  // Clean up outdated caches from previous versions
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Keep only current version caches, delete old ones
              return cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim()) // Take control of all open clients immediately
  );
});

/**
 * Fetch event - triggered whenever the application makes a network request
 * This is where we implement our caching strategies
 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Determine if this is an API request based on URL patterns
  const isApiRequest = API_PATTERNS.some((pattern) =>
    url.href.includes(pattern)
  );

  if (isApiRequest) {
    // *** Network-first strategy for API requests ***
    // Try network first for fresh data, fall back to cache when offline
    event.respondWith(
      fetch(event.request.clone())
        .then((response) => {
          // Clone the response to avoid consuming it when saving to cache
          const responseToCache = response.clone();

          // Store successful response in API cache for offline use
          caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
            console.log("Cached API response for:", url.href);
          });

          return response;
        })
        .catch(() => {
          // Network failed - try to retrieve from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log("Serving cached API response for:", url.href);

              // Add offline indicator header to the cached response
              // This allows the app to know the data is from cache
              const offlineResponse = new Response(cachedResponse.body, {
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers: cachedResponse.headers,
              });
              offlineResponse.headers.append("X-Offline", "true");

              return offlineResponse;
            }

            console.log("No cached data available for:", url.href);
            // No cached data - return a structured error response
            // This helps the app handle the offline state gracefully
            return new Response(
              JSON.stringify({
                error: true,
                message: "You are offline and this data is not cached.",
                offline: true,
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                  "X-Offline": "true",
                },
              }
            );
          });
        })
    );
  } else {
    // *** Cache-first strategy for static resources ***
    // Check cache first for better performance, fall back to network
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Resource found in cache - return it directly
          return cachedResponse;
        }

        // Not in cache - fetch from network and update cache
        return fetch(event.request)
          .then((response) => {
            // Only cache valid responses
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone response before using it
            const responseToCache = response.clone();

            // Add to app cache for future use
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Network failed and resource not in cache
            // Return appropriate fallback based on request type
            if (event.request.mode === "navigate") {
              // For page navigation, return a simple offline HTML page
              return new Response(
                "<html><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>",
                { headers: { "Content-Type": "text/html" } }
              );
            }

            // For other resource types
            return new Response("Offline content not available");
          });
      })
    );
  }
});
