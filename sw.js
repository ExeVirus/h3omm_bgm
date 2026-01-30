importScripts('config.js'); // Loads GAME_CONFIG

// Core assets required for immediate UI rendering
const CORE_ASSETS = [
    './',
    './config.js',
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

self.addEventListener('install', (e) => {
  e.waitUntil(
    // Use the variable from config.js
    caches.open(GAME_CONFIG.CORE_CACHE_NAME).then(c => c.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => {
      if (res) return res;
      
      return fetch(e.request).then(response => {
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();

        caches.open(GAME_CONFIG.CORE_CACHE_NAME).then(cache => {
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
                if (key !== GAME_CONFIG.CORE_CACHE_NAME && key !== GAME_CONFIG.AUDIO_CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});