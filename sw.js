const CACHE_NAME = 'h3-companion-v2';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './helper.js',
    './192.png',
    './512.png',
    
    // Audio - AI/Themes (Mixed casing in your structure)
    './assets/ai1.mp3', './assets/ai2.MP3', './assets/ai3.MP3',
    './assets/main.MP3',
    './assets/good.mp3', './assets/evil.mp3', './assets/neutral.mp3', './assets/secret.mp3',
    
    // Audio - Factions
    './assets/castle.mp3', './assets/rampart.MP3', './assets/tower.mp3',
    './assets/inferno.mp3', './assets/dungeon.MP3', './assets/necropolis.mp3',
    './assets/fortress.mp3', './assets/stronghold.mp3',
    './assets/conflux.mp3', './assets/cove.mp3',

    // Audio - Battle
    './assets/battle1.mp3', './assets/battle2.mp3', './assets/battle3.mp3', './assets/battle4.mp3',
    './assets/battle5.mp3', './assets/battle6.mp3', './assets/battle7.mp3', './assets/battle8.mp3',
    './assets/combat1.MP3', './assets/combat2.MP3', './assets/combat3.MP3', './assets/combat4.MP3',
    
    // Audio - SFX/Events
    './assets/chest.mp3', './assets/treasure.mp3',
    './assets/newday.mp3', './assets/newweek.mp3', './assets/newmonth.mp3',
    './assets/win_battle.mp3', 
    './assets/experience.mp3', './assets/lose.mp3', './assets/retreat.mp3',
    './assets/win_game.mp3',

    // Images
    './assets/artifact.avif', './assets/castle.avif', './assets/conflux.avif', './assets/cove.avif',
    './assets/dungeon.avif', './assets/end_turn.avif', './assets/evil.avif', './assets/fortress.avif',
    './assets/good.avif', './assets/inferno.avif', './assets/lose.avif', './assets/necropolis.avif',
    './assets/neutral.avif', './assets/rampart.avif', './assets/resource.avif', './assets/retreat.avif',
    './assets/rules.avif', './assets/secret.avif', './assets/start.avif', './assets/stronghold.avif',
    './assets/tower.avif', './assets/victory.avif', './assets/win_game.avif'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});