const CACHE_NAME = 'h3omm3_bgm_v0.9.8';

// Core assets required for immediate UI rendering
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './helper.js',
    './192.png',
    './512.png',

    // UI Images
    './assets/good.avif', './assets/evil.avif', './assets/neutral.avif', './assets/secret.avif',
    './assets/castle.avif', './assets/rampart.avif', './assets/tower.avif',
    './assets/inferno.avif', './assets/dungeon.avif', './assets/necropolis.avif',
    './assets/fortress.avif', './assets/stronghold.avif',
    './assets/conflux.avif', './assets/cove.avif',
    './assets/newtime.avif','./assets/tile.avif',
    './assets/start.avif', './assets/resource.avif', './assets/artifact.avif', 
    './assets/end_turn.avif', './assets/rules.avif', './assets/win_game.avif',
    './assets/victory.avif', './assets/retreat.avif', './assets/lose.avif'
];

// Audio is no longer blocked here. 
// helper.js will fetch() them sequentially, which triggers the fetch listener below
// to cache them in the background one by one.

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      // Only cache core assets to allow instant installation
      return c.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => {
      // Return cached if found
      if (res) return res;
      
      // If not, fetch network and cache it (Dynamic Caching)
      return fetch(e.request).then(response => {
        // Check if valid response
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone response to put in cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, responseToCache);
        });

        return response;
      });
    })
  );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});