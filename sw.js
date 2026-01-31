const CACHE_NAME = `h3omm3_core_1.2.0`

// Core assets required for immediate UI rendering
const CORE_ASSETS = [
    // --- CORE ---
    './',
    './index.html',
    './manifest.json',
    './favicon.ico',
    './helper.js',
    './192.png',
    './512.png',

    // --- IMAGES ---
    './assets/good.avif', './assets/evil.avif', './assets/neutral.avif', './assets/secret.avif',
    './assets/castle.avif', './assets/rampart.avif', './assets/tower.avif',
    './assets/inferno.avif', './assets/dungeon.avif', './assets/necropolis.avif',
    './assets/fortress.avif', './assets/stronghold.avif',
    './assets/conflux.avif', './assets/cove.avif',
    './assets/newday.avif', './assets/newtime.avif','./assets/tile.avif',
    './assets/gold.avif', './assets/valuable.avif',
    './assets/start.avif', './assets/resource.avif', './assets/artifact.avif', 
    './assets/end_turn.avif', './assets/rules.avif', './assets/win_game.avif',
    './assets/victory.avif', './assets/retreat.avif', './assets/lose.avif', './assets/surrender.avif', './assets/eliminated.avif',
    './assets/dirt.avif', './assets/grass.avif', './assets/lava.avif', './assets/rough.avif',
    './assets/sand.avif', './assets/snow.avif', './assets/swamp.avif', './assets/underground.avif',
    './assets/water.avif', './assets/wasteland.avif',

    // --- AUDIO (MUSIC) ---
    './assets/main.mp3',
    './assets/good.mp3', './assets/evil.mp3', './assets/neutral.mp3', './assets/secret.mp3',
    './assets/castle.mp3', './assets/rampart.mp3', './assets/tower.mp3',
    './assets/inferno.mp3', './assets/dungeon.mp3', './assets/necropolis.mp3',
    './assets/fortress.mp3', './assets/stronghold.mp3',
    './assets/conflux.mp3', './assets/cove.mp3',
    './assets/battle1.mp3', './assets/battle2.mp3', './assets/battle3.mp3', './assets/battle4.mp3',
    './assets/battle5.mp3', './assets/battle6.mp3', './assets/battle7.mp3', './assets/battle8.mp3',
    './assets/combat1.mp3', './assets/combat2.mp3', './assets/combat3.mp3', './assets/combat4.mp3',
    './assets/ai1.mp3', './assets/ai2.mp3', './assets/ai3.mp3',
    './assets/artifact.mp3',
    './assets/newday.mp3', './assets/newweek.mp3', './assets/newmonth.mp3',
    './assets/win_battle.mp3', 
    './assets/experience.mp3', './assets/lose.mp3', './assets/retreat.mp3', './assets/surrender.mp3',
    './assets/win_game.mp3', './assets/ultimatelose.mp3',

    // --- AUDIO (TREASURE) ---
    './assets/treasure1.mp3', './assets/treasure2.mp3', './assets/treasure3.mp3', './assets/treasure4.mp3',
    './assets/treasure5.mp3', './assets/treasure6.mp3', './assets/treasure7.mp3', './assets/gold.mp3',

    // --- AUDIO (TERRAIN) ---
    './assets/dirt.mp3', './assets/grass.mp3', './assets/lava.mp3', './assets/rough.mp3',
    './assets/sand.mp3', './assets/snow.mp3', './assets/swamp.mp3', './assets/underground.mp3',
    './assets/water.mp3', './assets/wasteland.mp3'
];

self.addEventListener('install', (e) => {
    // This phase is now "heavy". It will download ~50MB before completing.
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CORE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(response => {
            // Hit? Return cache.
            if (response) return response;
            // Miss? Fetch from network.
            return fetch(e.request);
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                // Delete any cache that doesn't match the current config version
                if (key !== CACHE_NAME) {
                    console.log('Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});
