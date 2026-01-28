const CACHE_NAME = 'h3-companion-v3';

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
    './assets/newtime.avif',
    './assets/start.avif', './assets/resource.avif', './assets/artifact.avif', 
    './assets/end_turn.avif', './assets/rules.avif', './assets/win_game.avif',
    './assets/victory.avif', './assets/retreat.avif', './assets/lose.avif'
];

// Heavy audio files - Cached in background so they don't block install
const AUDIO_ASSETS = [
    './assets/ai1.mp3', './assets/ai2.MP3', './assets/ai3.MP3',
    './assets/main.MP3',
    './assets/good.mp3', './assets/evil.mp3', './assets/neutral.mp3', './assets/secret.mp3',
    './assets/castle.mp3', './assets/rampart.MP3', './assets/tower.mp3',
    './assets/inferno.mp3', './assets/dungeon.MP3', './assets/necropolis.mp3',
    './assets/fortress.mp3', './assets/stronghold.mp3',
    './assets/conflux.mp3', './assets/cove.mp3',
    './assets/battle1.mp3', './assets/battle2.mp3', './assets/battle3.mp3', './assets/battle4.mp3',
    './assets/battle5.mp3', './assets/battle6.mp3', './assets/battle7.mp3', './assets/battle8.mp3',
    './assets/combat1.MP3', './assets/combat2.MP3', './assets/combat3.MP3', './assets/combat4.MP3',
    './assets/chest.mp3', './assets/treasure.mp3',
    './assets/newday.mp3', './assets/newweek.mp3', './assets/newmonth.mp3',
    './assets/win_battle.mp3', 
    './assets/experience.mp3', './assets/lose.mp3', './assets/retreat.mp3',
    './assets/win_game.mp3'
];

self.addEventListener('install', (e) => {
  // 1. Block install only on CORE assets for speed
  const installPromise = caches.open(CACHE_NAME).then(c => {
      // Start downloading Audio in background (don't return this promise)
      c.addAll(AUDIO_ASSETS);
      // Return only Core to finish install quickly
      return c.addAll(CORE_ASSETS);
  });
  e.waitUntil(installPromise);
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});