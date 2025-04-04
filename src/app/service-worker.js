// Weather PWA Service Worker with caching implementation
const CACHE_NAME = "weather-app-cache-v1";
const API_CACHE_NAME = "weather-api-cache-v1";

// URLs we want to cache
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/styles.css",
  "/main.js",
  "/assets/icons/",
];

// API URL patterns to cache separately
const API_PATTERNS = [
  "https://api.openweathermap.org/data/",
  "https://api.openweathermap.org/geo/",
  "openweathermap.org/img/wn/", // For weather icons
];

self.addEventListener("install", (event) => {
  console.log("Service worker installing...");

  // Pre-cache app shell
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activating...");

  // Clean up old caches
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Check if the request is for an API endpoint
  const isApiRequest = API_PATTERNS.some((pattern) =>
    url.href.includes(pattern)
  );

  if (isApiRequest) {
    // For API requests - try network first, then cache
    event.respondWith(
      fetch(event.request.clone())
        .then((response) => {
          // Clone the response since we'll use it twice
          const responseToCache = response.clone();

          // Store in API cache
          caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
            console.log("Cached API response for:", url.href);
          });

          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log("Serving cached API response for:", url.href);

              // Add offline header to cached response
              const offlineResponse = new Response(cachedResponse.body, {
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers: cachedResponse.headers,
              });
              offlineResponse.headers.append("X-Offline", "true");

              return offlineResponse;
            }

            console.log("No cached data available for:", url.href);
            // For API requests, return a meaningful JSON response
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
    // For non-API requests - cache first, then network
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, get from network
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to cache
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Return a simple offline page for navigation requests
            if (event.request.mode === "navigate") {
              return new Response(
                "<html><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>",
                { headers: { "Content-Type": "text/html" } }
              );
            }

            return new Response("Offline content not available");
          });
      })
    );
  }
});
