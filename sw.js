const CACHE_NAME = `h3omm3_core_1.9.4`

// Core assets required for immediate UI rendering
const CORE_ASSETS = [
    // --- CORE ---
    'index.html',
    'manifest.json',
    'favicon.ico',
    'locale.js',
    'helper.js',
    '192.png',
    '512.png',

    // --- IMAGES ---
    'assets/good.avif', 'assets/evil.avif', 'assets/neutral.avif', 'assets/secret.avif',
    'assets/castle.avif', 'assets/rampart.avif', 'assets/tower.avif',
    'assets/inferno.avif', 'assets/dungeon.avif', 'assets/necropolis.avif',
    'assets/fortress.avif', 'assets/stronghold.avif',
    'assets/conflux.avif', 'assets/cove.avif', 'assets/factory.avif',
    'assets/newday.gif', 'assets/newtime.gif','assets/tile.avif',
    'assets/treasure.svg', 'assets/valuables.svg',
    'assets/start.avif', 'assets/resource.avif', 'assets/artifact.svg', 
    'assets/end_turn.avif', 'assets/rules.avif', 'assets/win_game.avif',
    'assets/victory.avif', 'assets/retreat.avif', 'assets/lose.avif', 'assets/surrender.avif', 'assets/eliminated.avif',
    'assets/dirt.avif', 'assets/grass.avif', 'assets/lava.avif', 'assets/rough.avif',
    'assets/sand.avif', 'assets/snow.avif', 'assets/swamp.avif', 'assets/underground.avif',
    'assets/water.avif', 'assets/wasteland.avif',
    "assets/victory_animated.avif", "assets/retreat_animated.avif", "assets/surrender_animated.avif", "assets/eliminated_animated.avif",

    // --- AUDIO (MUSIC) ---
    'assets/main.mp3',
    'assets/good.mp3', 'assets/evil.mp3', 'assets/neutral.mp3', 'assets/secret.mp3',
    'assets/castle.mp3', 'assets/rampart.mp3', 'assets/tower.mp3',
    'assets/inferno.mp3', 'assets/dungeon.mp3', 'assets/necropolis.mp3',
    'assets/fortress.mp3', 'assets/stronghold.mp3',
    'assets/conflux.mp3', 'assets/cove.mp3', 'assets/factory.mp3',
    'assets/battle1.mp3', 'assets/battle2.mp3', 'assets/battle3.mp3', 'assets/battle4.mp3',
    'assets/battle5.mp3', 'assets/battle6.mp3', 'assets/battle7.mp3', 'assets/battle8.mp3',
    'assets/combat1.mp3', 'assets/combat2.mp3', 'assets/combat3.mp3', 'assets/combat4.mp3',
    'assets/ai1.mp3', 'assets/ai2.mp3', 'assets/ai3.mp3',
    'assets/artifact.mp3',
    'assets/newday.mp3', 'assets/newweek.mp3', 'assets/newmonth.mp3',
    'assets/win_battle.mp3', 
    'assets/experience.mp3', 'assets/lose.mp3', 'assets/retreat.mp3', 'assets/surrender.mp3',
    'assets/win_game.mp3', 'assets/ultimatelose.mp3',

     // 'Videos'
    "assets/victory.mkv",
    "assets/defeat.mkv",

    // --- AUDIO (TREASURE) ---
    'assets/treasure1.mp3', 'assets/treasure2.mp3', 'assets/treasure3.mp3', 'assets/treasure4.mp3',
    'assets/treasure5.mp3', 'assets/treasure6.mp3', 'assets/treasure7.mp3', 'assets/gold.mp3',

    // --- AUDIO (TERRAIN) ---
    'assets/dirt.mp3', 'assets/grass.mp3', 'assets/lava.mp3', 'assets/rough.mp3',
    'assets/sand.mp3', 'assets/snow.mp3', 'assets/swamp.mp3', 'assets/underground.mp3',
    'assets/water.mp3', 'assets/wasteland.mp3'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            const cachePromises = CORE_ASSETS.map(url => {
                // If one fails, we catch the error so the main process doesn't stop.
                return cache.add(url).catch(error => {
                    console.warn(`Failed to cache: ${url}`, error);
                });
            });
            // Promise.allSettled waits for all downloads to finish (success or fail)
            return Promise.allSettled(cachePromises);
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request, { ignoreSearch: true }).then(cachedResponse => {
            if (cachedResponse) {
                const rangeHeader = e.request.headers.get('range');
                
                // If there's no range header, just return the file
                if (!rangeHeader) return cachedResponse;

                // Handle Range Requests (Required for Mobile Audio)
                return cachedResponse.arrayBuffer().then(buffer => {
                    const start = Number(rangeHeader.replace(/\D/g, ''));
                    const end = buffer.byteLength - 1;
                    const slicedBuffer = buffer.slice(start, end + 1);

                    return new Response(slicedBuffer, {
                        status: 206,
                        statusText: 'Partial Content',
                        headers: {
                            ...Object.fromEntries(cachedResponse.headers),
                            'Content-Range': `bytes ${start}-${end}/${buffer.byteLength}`,
                            'Content-Length': slicedBuffer.byteLength,
                        }
                    });
                }).catch(() => {
                    // Fallback to full response if slicing fails
                    return cachedResponse;
                });
            }
            return fetch(e.request);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request, { ignoreSearch: true }).then(cachedResponse => {
            if (cachedResponse) {
                const rangeHeader = e.request.headers.get('range');
                if (rangeHeader && cachedResponse.headers.get('content-type')?.includes('audio')) {
                    return cachedResponse.arrayBuffer().then(buffer => {
                        const bytes = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
                        const start = parseInt(bytes[1], 10);
                        const end = bytes[2] ? parseInt(bytes[2], 10) : buffer.byteLength - 1;

                        return new Response(buffer.slice(start, end + 1), {
                            status: 206,
                            statusText: 'Partial Content',
                            headers: {
                                ...Object.fromEntries(cachedResponse.headers),
                                'Content-Range': `bytes ${start}-${end}/${buffer.byteLength}`,
                                'Content-Length': end - start + 1,
                            }
                        });
                    });
                }
                return cachedResponse;
            }
            return fetch(e.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request, responseToCache);
                });

                return networkResponse;
            }).catch(err => {
                if (e.request.mode === 'navigate') {
                    return caches.match('index.html');
                }
                console.log('Offline fetch failed:', e.request.url);
            });
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});
