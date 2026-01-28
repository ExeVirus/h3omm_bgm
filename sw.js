const CACHE_NAME = 'h3-companion-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './helper.js',
    './192.png',
    './512.png',
    
    // Audio - AI/Themes
    './ai1.mp3', './ai2.MP3', './ai3.MP3',
    './main.MP3',
    './good.mp3', './evil.mp3', './neutral.mp3', './secret.mp3',
    
    // Audio - Factions
    './castle.mp3', './rampart.MP3', './tower.mp3',
    './inferno.mp3', './dungeon.MP3', './necropolis.mp3',
    './fortress.mp3', './stronghold.mp3',
    './conflux.mp3', './cove.mp3',

    // Audio - Battle
    './battle1.mp3', './battle2.mp3', './battle3.mp3', './battle4.mp3',
    './battle5.mp3', './battle6.mp3', './battle7.mp3', './battle8.mp3',
    './combat1.MP3', './combat2.MP3', './combat3.MP3', './combat4.MP3',
    
    // Audio - SFX/Events
    './chest.mp3', './treasure.mp3',
    './newday.mp3', './newweek.mp3', './newmonth.mp3',
    './win_battle.mp3', './victory.avif',
    './experience.mp3', './lose.mp3', './retreat.mp3',
    './win_game.mp3',

    // Images
    './artifact.avif', './castle.avif', './conflux.avif', './cove.avif',
    './dungeon.avif', './end_turn.avif', './evil.avif', './fortress.avif',
    './good.avif', './inferno.avif', './lose.avif', './necropolis.avif',
    './neutral.avif', './rampart.avif', './resource.avif', './retreat.avif',
    './rules.avif', './secret.avif', './start.avif', './stronghold.avif',
    './tower.avif', './victory.avif', './win_game.avif'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});