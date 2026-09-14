const CACHE_NAME = "northend-static-v1";
const RUNTIME_CACHE = "northend-runtime-v1";
const PRECACHE_URLS = [
  "/",
  "/admin",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only intercept GET requests
  if (request.method !== "GET") {
    return;
  }

  // 2. NEVER intercept API routes, SSE streams, or file downloads - let network handle directly
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/erp/stream") || url.pathname.startsWith("/push/")) {
    return;
  }

  // 3. For SPA page navigations: try network first, fallback to cached index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedIndex = await caches.match("/index.html");
        const cachedRoot = await caches.match("/");
        return cachedIndex || cachedRoot || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      })
    );
    return;
  }

  // 4. For static assets on same origin
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone).catch(() => {}));
          }
          return response;
        }).catch(() => {
          // Return a 404 response instead of undefined
          return new Response("Resource not available offline", { status: 404, headers: { "Content-Type": "text/plain" } });
        });
      })
    );
    return;
  }
});


self.addEventListener("push", (event) => {
  let payload = { title: "Northend Admin", body: "You have a new notification." };
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload.body = event.data.text();
    }
  }
  const options = {
    body: payload.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: payload.data || {},
  };
  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/admin" && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow("/admin");
    })
  );
});
