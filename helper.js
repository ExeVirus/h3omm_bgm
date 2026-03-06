const FACTION_COLORS = {
    'castle': '#73B7EB',
    'rampart': '#228B22',
    'tower': '#909090',
    'inferno': '#B22222',
    'dungeon': '#9370C5',
    'necropolis': '#666666',
    'fortress': '#556B2F',
    'stronghold': '#A67C52',
    'conflux': '#C158C1',
    'cove': '#20B2AA',
    'factory': '#fbff04ff',
    'neutral': '#333333' // Default
};

// Cleaned up list for easier logic
const TERRAIN_NAMES = [
    'dirt', 'grass', 'lava', 'rough',
    'sand', 'snow', 'swamp', 'underground',
    'water', 'wasteland',
];

const ASSET_QUEUE = [
    // 1. Audio (Music & SFX)
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
    'assets/treasure.svg', 'assets/valuables.svg',
    'assets/artifact.mp3',
    'assets/newday.mp3', 'assets/newweek.mp3', 'assets/newmonth.mp3',
    'assets/win_battle.mp3', 
    'assets/experience.mp3', 'assets/lose.mp3', 'assets/retreat.mp3', 'assets/surrender.mp3',
    'assets/win_game.mp3', 'assets/ultimatelose.mp3',

    // Treasure
    `assets/treasure1.mp3`, `assets/treasure2.mp3`, `assets/treasure3.mp3`,
    `assets/treasure4.mp3`, `assets/treasure5.mp3`, `assets/treasure6.mp3`,
    `assets/treasure7.mp3`, `assets/gold.mp3`,

    // Terrain
    `assets/dirt.mp3`, `assets/grass.mp3`, `assets/lava.mp3`,
    `assets/rough.mp3`, `assets/sand.mp3`, `assets/snow.mp3`,
    `assets/swamp.mp3`, `assets/underground.mp3`, `assets/water.mp3`,
    `assets/wasteland.mp3`,

    // Images 
    'assets/good.avif', 'assets/evil.avif', 'assets/neutral.avif', 'assets/secret.avif',
    'assets/castle.avif', 'assets/rampart.avif', 'assets/tower.avif',
    'assets/inferno.avif', 'assets/dungeon.avif', 'assets/necropolis.avif',
    'assets/fortress.avif', 'assets/stronghold.avif',
    'assets/conflux.avif', 'assets/cove.avif', 'assets/factory.avif',
    'assets/newday.gif', 'assets/newtime.gif','assets/tile.avif',
    'assets/start.avif', 'assets/resource.avif', 'assets/artifact.svg', 
    'assets/end_turn.avif', 'assets/rules.avif', 'assets/win_game.avif',
    'assets/victory.avif', 'assets/retreat.avif', 'assets/lose.avif', 'assets/eliminated.avif', 'assets/surrender.avif',
    "assets/victory_animated.avif", "assets/retreat_animated.avif", "assets/surrender_animated.avif", "assets/eliminated_animated.avif",

    'assets/EBGaramond_Variable.ttf',

    // 'Videos'
    "assets/victory.mkv",
    "assets/defeat.mkv",

    // Terrains
    'assets/dirt.avif', 'assets/grass.avif', 'assets/lava.avif', 'assets/rough.avif',
    'assets/sand.avif', 'assets/snow.avif', 'assets/swamp.avif', 'assets/underground.avif',
    'assets/water.avif', 'assets/wasteland.avif'
];

const LANG_FLAGS = {
    'en': '🇬🇧', 
    'cs': '🇨🇿', 
    'de': '🇩🇪', 
    'es': '🇪🇸',
    'fr': '🇫🇷', 
    'he': '🇮🇱', 
    'pl': '🇵🇱', 
    'ru': '🇷🇺', 
    'ua': '🇺🇦'
};

let deferredInstallPrompt = null;

const Localization = {
    lang: 'en', // Default

    init() {
        const storedLang = localStorage.getItem('h3_lang');
        
        if (storedLang && TRANSLATIONS[storedLang]) {
            this.lang = storedLang;
        } else {
            const userLang = navigator.language || navigator.userLanguage; 
            const shortLang = userLang.split('-')[0];
            if (TRANSLATIONS[shortLang]) {
                this.lang = shortLang;
            } else {
                this.lang = 'en';
            }
        }
        
        this.updateFlagUI();
        this.renderLanguageMenu();
        this.localizePage();
    },

    setLang(newLang) {
        if (TRANSLATIONS[newLang]) {
            this.lang = newLang;
            localStorage.setItem('h3_lang', newLang);
            this.updateFlagUI();
            this.localizePage();
            
            if (typeof Game !== 'undefined' && Game.state.players.length > 0) {
                const player = Game.state.players[Game.state.currentPlayerIndex];
                if (player) {
                    const titleEl = document.getElementById('overworld-title');
                    if (titleEl) titleEl.innerText = this.get('turn_title', player.name);

                    const factionEl = document.getElementById('overworld-faction-subtitle');
                    if (factionEl) factionEl.innerText = this.get(`faction_${player.faction}`);

                    const themeLabel = document.getElementById('theme-faction-label');
                    if (themeLabel) {
                        const factionName = this.get(`faction_${player.faction}`);
                        const townLabel = this.get('btn_town');
                        themeLabel.innerText = `${factionName} (${townLabel})`;
                    }
                }
            }

            if (document.getElementById('screen-stats').style.display !== 'none') {
                Game.showStats(Game.state.statsViewIndex);
            }
            
            const submenu = document.getElementById('lang-submenu');
            if (submenu) submenu.style.display = 'none';
        }
    },

    updateFlagUI() {
        const flagIcon = LANG_FLAGS[this.lang] || '🌐';
        const btn = document.getElementById('current-lang-icon');
        if (btn) btn.innerText = flagIcon;
    },

    renderLanguageMenu() {
        const submenu = document.getElementById('lang-submenu');
        if (!submenu) return;
        
        submenu.innerHTML = '';
        
        Object.keys(TRANSLATIONS).forEach(key => {
            const flag = LANG_FLAGS[key] || key.toUpperCase();
            const div = document.createElement('div');
            div.className = 'lang-option';
            div.innerText = flag;
            div.onclick = () => this.setLang(key);
            submenu.appendChild(div);
        });
    },

    get(key, ...args) {
        let str = (TRANSLATIONS[this.lang] && TRANSLATIONS[this.lang][key]) 
                  ? TRANSLATIONS[this.lang][key] 
                  : (TRANSLATIONS['en'][key] || key);

        args.forEach((arg, index) => {
            str = str.replace(`{${index}}`, arg);
        });
        return str;
    },

    localizePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.get(key);
            if (translation) {
                el.innerHTML = translation;
            }
        });
    }
};

const Game = {
    state: {
        currentScreen: 'screen-start',
        players: [], 
        currentPlayerIndex: 0,
        round: 1,
        selectedTheme: null,
        playerCount: 3,
        lastAiIdx: -1,
        lastBattleIdx: -1,
        lastCombatIdx: -1,
        lastTreasureIdx: -1,
        musicTimer: null,
        currentOverworldName: null, // Holds 'castle', 'dirt', 'lava', etc.
        trackPositions: {},
        pendingGameOver: null,
        tempPlayerName: "",
        isAutoplay: true,
        lastTerrain: null,
        statsViewIndex: 0,
        
        // --- EVENT BASED STATS SYSTEM ---
        history: [], // The Timeline
        appLoadedAt: 0,
        
        // Timer Logic
        timerMode: 'setup', // 'setup', 'overworld', 'battle', 'rules', 'paused', 'ended'
        lastTick: 0,
        // Active accumulators for the current ongoing event (reset after logging event)
        activeDurations: {
            setup: 0,
            turn: 0,
            battle: 0,
            rules: 0
        }
    },

    audio: {
        ch1: new Audio(),
        ch2: new Audio(),
        activeChannel: 'ch1',
        sfx: new Audio(),
        currentBgUrl: null,
        fadeInterval: null,
        masterVolume: 1.0,
        isMuted: false
    },

    // --- LOGGING ENGINE ---
    
    // Core function to push events to history
    logEvent(type, data = {}) {
        const player = this.state.players[this.state.currentPlayerIndex];
        const entry = {
            timestamp: Date.now(),
            type: type,
            round: this.state.round,
            // If we are in setup/pregame, player might be undefined
            playerId: player ? player.id : null,
            faction: player ? player.faction : null,
            data: data
        };
        this.state.history.push(entry);
    },

    // --- TIMER ENGINE ---

    // Calculate time since lastTick and add to correct accumulator
    commitTime() {
        if (!this.state.lastTick) return;
        const now = Date.now();
        const delta = now - this.state.lastTick;
        this.state.lastTick = now;

        if (delta <= 0) return;

        // Add delta to the bucket corresponding to the current mode
        switch (this.state.timerMode) {
            case 'setup':
                this.state.activeDurations.setup += delta;
                break;
            case 'overworld':
                this.state.activeDurations.turn += delta;
                break;
            case 'battle':
                this.state.activeDurations.battle += delta;
                break;
            case 'rules':
                this.state.activeDurations.rules += delta;
                break;
            // 'paused' or 'ended' adds to nothing
        }
    },

    setTimerMode(newMode) {
        this.commitTime(); // Save progress of previous mode
        this.state.timerMode = newMode;
        this.state.lastTick = Date.now();
    },

    // --- AUDIO ENGINE ---
    playBg(url, fade = true, loop = true) {
        const fullUrl = url.includes('/') ? url : `assets/${url}`;
        if (this.audio.currentBgUrl === fullUrl && !this.state.isAutoplay) return;

        if (this.state.musicTimer) {
            clearTimeout(this.state.musicTimer);
            this.state.musicTimer = null;
        }

        if (this.audio.currentBgUrl) {
            const currentActiveChannel = this.audio[this.audio.activeChannel];
            this.state.trackPositions[this.audio.currentBgUrl] = currentActiveChannel.currentTime;
        }

        if (this.audio.fadeInterval) {
            clearInterval(this.audio.fadeInterval);
            this.audio.fadeInterval = null;
        }

        const outgoing = this.audio[this.audio.activeChannel];
        const nextChannelName = (this.audio.activeChannel === 'ch1') ? 'ch2' : 'ch1';
        const incoming = this.audio[nextChannelName];

        incoming.src = fullUrl;
        incoming.load();
        const savedTime = this.state.trackPositions[fullUrl] || 0;
        incoming.currentTime = savedTime;
        incoming.loop = loop;
        incoming.muted = this.audio.isMuted;
        
        // iOS: Initialize at target volume immediately in case volume prop is locked
        // If fade works, we set it to 0 momentarily.
        incoming.volume = this.audio.masterVolume;
        
        this.audio.currentBgUrl = fullUrl;
        this.audio.activeChannel = nextChannelName;

        if ('mediaSession' in navigator) {
            const trackName = url.split('/').pop().replace('.mp3', '');
            this.updateMediaMetadata(trackName);
        }

        const playPromise = incoming.play();
        if (playPromise) playPromise.catch(e => console.error("Audio Play Err:", e));

        if (!fade) {
            incoming.volume = this.audio.masterVolume;
            outgoing.pause();
            outgoing.volume = 0;
        } else {
            // Set start volume for fade
            incoming.volume = 0;
            
            let safetyCounter = 0; // Prevent infinite loops

            this.audio.fadeInterval = setInterval(() => {
                const step = 0.05;
                const targetVol = this.audio.masterVolume;
                let incomingDone = false;
                let outgoingDone = false;
                safetyCounter++;

                // 1. Fade Incoming
                if (incoming.volume < targetVol) {
                    const prevIn = incoming.volume;
                    incoming.volume = Math.min(targetVol, incoming.volume + step);
                    
                    // iOS Check: If volume didn't change, we can't fade.
                    if (incoming.volume === prevIn) {
                        incoming.volume = targetVol; // Force max
                        incomingDone = true;
                    }
                } else {
                    incomingDone = true;
                }

                // 2. Fade Outgoing
                if (outgoing.volume > 0 && !outgoing.paused) {
                    const prevOut = outgoing.volume;
                    outgoing.volume = Math.max(0, outgoing.volume - step);
                    
                    // iOS Check: If volume didn't drop, force stop immediately
                    if (outgoing.volume === prevOut) {
                        outgoing.pause();
                        outgoing.volume = 0; // Try to set 0, but it might fail silently
                        outgoingDone = true;
                    }
                } else {
                    outgoingDone = true;
                }

                // 3. Cleanup logic
                // If safety counter hits ~40 (2 seconds), force stop to prevent overlap
                if ((incomingDone && outgoingDone) || safetyCounter > 40) {
                    clearInterval(this.audio.fadeInterval);
                    this.audio.fadeInterval = null;
                    outgoing.pause();
                    
                    // Ensure final states
                    incoming.volume = targetVol;
                    if (outgoing.volume > 0) outgoing.volume = 0;
                }
            }, 50);
        }
    },

    stopBg(hardStop = false) {
        if (this.state.musicTimer) {
            clearTimeout(this.state.musicTimer);
            this.state.musicTimer = null;
        }

        if (this.audio.fadeInterval) {
            clearInterval(this.audio.fadeInterval);
            this.audio.fadeInterval = null;
        }

        if (this.audio.currentBgUrl) {
            this.state.trackPositions[this.audio.currentBgUrl] = this.audio[this.audio.activeChannel].currentTime;
        }

        if (hardStop !== 'pause') {
            this.audio.currentBgUrl = null;
        }

        const c1 = this.audio.ch1;
        const c2 = this.audio.ch2;

        if (hardStop) {
            c1.pause();
            c2.pause();
            
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = "paused";
            }

            if (hardStop !== 'pause') {
                c1.volume = 0;
                c2.volume = 0;
            }
            return;
        }

        // Faded Stop
        let safetyCounter = 0;
        this.audio.fadeInterval = setInterval(() => {
            let activeVol = false;
            safetyCounter++;

            // Fade Channel 1
            if (c1.volume > 0 && !c1.paused) {
                const prev = c1.volume;
                c1.volume = Math.max(0, c1.volume - 0.1);
                // iOS check
                if (c1.volume === prev) {
                    c1.pause(); 
                } else {
                    activeVol = true;
                }
            }

            // Fade Channel 2
            if (c2.volume > 0 && !c2.paused) {
                const prev = c2.volume;
                c2.volume = Math.max(0, c2.volume - 0.1);
                // iOS check
                if (c2.volume === prev) {
                    c2.pause();
                } else {
                    activeVol = true;
                }
            }
            
            // If loops too long (> 0.5s), force kill
            if (!activeVol || safetyCounter > 10) {
                clearInterval(this.audio.fadeInterval);
                this.audio.fadeInterval = null;
                c1.pause();
                c2.pause();
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = "paused";
                }
            }
        }, 50);
    },

    resumeBg() {
        const active = this.audio[this.audio.activeChannel];
        if (this.audio.currentBgUrl && active.paused) {
            active.volume = this.audio.masterVolume;
            active.play().catch(e => console.log("Resume err", e));
        }
    },

    playSfx(filename, onComplete = null) {
        this.audio.sfx.pause();
        this.audio.sfx.onended = null;
        this.audio.sfx.onerror = null;

        this.audio.sfx.src = `assets/${filename}`;
        this.audio.sfx.loop = false;
        this.audio.sfx.volume = this.audio.masterVolume;
        this.audio.sfx.muted = this.audio.isMuted;
        if (onComplete) {
            const handleDone = () => {
                this.audio.sfx.onended = null;
                this.audio.sfx.onerror = null;
                onComplete();
            };
            this.audio.sfx.onended = handleDone;
            this.audio.sfx.onerror = handleDone;
        }

        this.audio.sfx.play().catch(e => {
            this.audio.sfx.onended = null;
            this.audio.sfx.onerror = null;
            if(onComplete) onComplete();
        });
    },

    setVolume(val) {
        const volume = parseFloat(val);
        this.audio.masterVolume = volume;
        this.audio.sfx.volume = volume;
        if (!this.audio.fadeInterval) {
            this.audio.ch1.volume = volume;
            this.audio.ch2.volume = volume;
        }
    },

    toggleMute() {
        this.audio.isMuted = !this.audio.isMuted;
        this.audio.ch1.muted = this.audio.isMuted;
        this.audio.ch2.muted = this.audio.isMuted;
        this.audio.sfx.muted = this.audio.isMuted;
        document.getElementById('mute-btn').innerText = this.audio.isMuted ? '🔇' : '🔊';
        document.getElementById('mute-btn').classList.toggle('is-muted', this.audio.isMuted);
    },

    initPreloader() {
        let qIndex = 0;
        const loadNext = () => {
            if (qIndex >= ASSET_QUEUE.length) return;
            const url = ASSET_QUEUE[qIndex];
            qIndex++;
            fetch(url).then(() => loadNext()).catch(() => loadNext());
        };
        loadNext();
    },

    // --- GAME LOGIC ---

    init() {
        this.state.appLoadedAt = Date.now();
        this.state.lastTick = Date.now();
        this.state.timerMode = 'setup';

        this.setupMediaSession();

        // Support IOS aggressive shutdown
        [this.audio.ch1, this.audio.ch2, this.audio.sfx].forEach(track => {
            track.play().then(() => {
                track.pause();
                track.currentTime = 0;
            }).catch(e => console.log("Priming hindered:", e));
        });

        document.getElementById('click-overlay').style.display = 'none';
        this.playBg('assets/main.mp3');
        this.showScreen('screen-start');
        this.updateFactionColor('neutral');
        this.initPreloader(); 

        this.audio.ch1.onended = () => this.handleAudioEnd();
        this.audio.ch2.onended = () => this.handleAudioEnd();
    },

    updatePWAButtons() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (deferredInstallPrompt) {
            installBtn.style.display = 'block';
            installBtn.onclick = () => {
                deferredInstallPrompt.prompt();
                deferredInstallPrompt.userChoice.then((choice) => {
                    if (choice.outcome === 'accepted') {
                        installBtn.style.display = 'none';
                    }
                    deferredInstallPrompt = null;
                });
            };
        } else {
            installBtn.style.display = 'none';
        }
    },

    forceUpdate() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(regs => {
                for(let reg of regs) reg.unregister();
                window.location.reload();
            });
        } else {
            window.location.reload();
        }
    },

    toggleOptionsMenu() {
        const menu = document.getElementById('options-menu');
        const isMobile = window.innerWidth <= 1024;
        
        if (isMobile) {
            if (menu.style.display === 'flex') {
                menu.style.display = 'none';
                document.getElementById('lang-submenu').style.display = 'none';
            } else {
                menu.style.display = 'flex';
            }
        }
    },

    toggleLanguageMenu() {
        const submenu = document.getElementById('lang-submenu');
        const isHidden = submenu.style.display === 'none' || submenu.style.display === '';
        submenu.style.display = isHidden ? 'grid' : 'none';
    },

    toggleAutoplay() {
        this.state.isAutoplay = !this.state.isAutoplay;
        const btn = document.getElementById('autoplay-toggle');
        
        if (this.state.isAutoplay) {
            btn.classList.add('active');
            if (this.state.currentScreen === 'screen-overworld') {
                const active = this.audio[this.audio.activeChannel];
                if (active && active.loop) {
                   this.playBg(this.getCurrentOverworldMusic(), true, false); 
                }
            }
        } else {
            btn.classList.remove('active');
            if (this.state.currentScreen === 'screen-overworld') {
                const active = this.audio[this.audio.activeChannel];
                if (active) active.loop = true;
            }
        }
    },

    handleAudioEnd() {
        if (!this.state.isAutoplay) return;
        if (this.state.currentScreen !== 'screen-overworld') return;

        const player = this.state.players[this.state.currentPlayerIndex];
        const faction = player.faction;
        
        let nextTheme = '';

        if (this.state.currentOverworldName === faction) {
            let nextTerrain;
            do {
                const randIndex = Math.floor(Math.random() * TERRAIN_NAMES.length);
                nextTerrain = TERRAIN_NAMES[randIndex];
            } while (nextTerrain === this.state.lastTerrain && TERRAIN_NAMES.length > 1);
            
            this.state.lastTerrain = nextTerrain;
            nextTheme = nextTerrain;
        } else {
            nextTheme = faction;
        }

        this.state.currentOverworldName = nextTheme;
        this.updateThemeButtonUI();
        const nextUrl = `assets/${nextTheme}.mp3`;
        this.state.trackPositions[nextUrl] = 0;

        this.playBg(nextUrl, true, false);
    },

    updateFactionColor(faction) {
        const color = FACTION_COLORS[faction] || FACTION_COLORS['neutral'];
        document.documentElement.style.setProperty('--faction-color', color);
    },

    selectTheme(theme) {
        this.state.selectedTheme = theme;
        this.playBg(`assets/${theme}.mp3`);
        this.showScreen('screen-players');
    },

    confirmPlayerCount(count) {
        this.state.playerCount = count;
        this.state.players = [];
        this.startFactionSelection(0);
    },

    startFactionSelection(playerIndex) {
        if (playerIndex >= this.state.playerCount) {
            this.showPreGame();
            return;
        }
        
        const defaultName = Localization.get('default_player_name', playerIndex + 1);

        this.state.tempPlayerName = defaultName;
        document.getElementById('faction-player-title').innerText = defaultName;
        
        this.showScreen('screen-factions');
        
        const takenFactions = this.state.players.map(p => p.faction);
        
        const buttons = document.querySelectorAll('.faction-btn');
        buttons.forEach(btn => {
            const faction = btn.dataset.faction;
            if (takenFactions.includes(faction)) {
                btn.classList.add('disabled');
                btn.onclick = null;
            } else {
                btn.classList.remove('disabled');
                btn.onclick = () => {
                    this.state.players.push({ 
                        id: playerIndex, 
                        faction: faction, 
                        name: this.state.tempPlayerName,
                        eliminated: false
                    });
                    this.startFactionSelection(playerIndex + 1);
                };
            }
        });
    },

    editName() {
        const newName = prompt("Enter Player Name:", this.state.tempPlayerName);
        if (newName && newName.trim() !== "") {
            this.state.tempPlayerName = newName.trim();
            document.getElementById('faction-player-title').innerText = this.state.tempPlayerName;
        }
    },

    showPreGame() {
        this.showScreen('screen-pregame');
        this.updateFactionColor('neutral');
    },

    startGame() {
        this.commitTime(); // Commit setup time
        // Log setup end / Game Start
        this.logEvent('GAME_START', { setupTime: this.state.activeDurations.setup });
        
        this.state.round = 1;
        this.state.currentPlayerIndex = 0;
        this.startTurn(false); 
    },

    startTurn(isTransition = true, musicDelay = 0) {
        if (this.state.musicTimer) {
            clearTimeout(this.state.musicTimer);
            this.state.musicTimer = null;
        }
        
        this.setTimerMode('overworld');
        this.logEvent('TURN_START');

        const player = this.state.players[this.state.currentPlayerIndex];
        
        if (player.eliminated) {
            this.endTurn();
            return;
        }

        this.state.trackPositions = {};
        this.state.currentOverworldName = player.faction;
        
        document.getElementById('overworld-title').innerText = Localization.get('turn_title', player.name);
        
        const factionKey = `faction_${player.faction}`;
        document.getElementById('overworld-faction-subtitle').innerText = Localization.get(factionKey);

        this.updateFactionColor(player.faction);
        this.updateThemeButtonUI();
        
        this.showScreen('screen-overworld');
        
        const overworldMusic = `assets/${this.state.currentOverworldName}.mp3`;
        const shouldLoop = !this.state.isAutoplay;

        if (this.state.isAutoplay) {
             this.state.trackPositions[overworldMusic] = 0;
        }

        if (!isTransition) {
            this.playBg(overworldMusic, true, shouldLoop);
        } else {
            setTimeout(() => {
                if(this.state.currentScreen === 'screen-overworld') {
                    this.playBg(overworldMusic, true, shouldLoop);
                }
            }, musicDelay);
        }
    },

    openThemeSelector() {
        const player = this.state.players[this.state.currentPlayerIndex];
        const faction = player.faction;

        const factionBtn = document.getElementById('theme-faction-btn');
        const factionLabel = document.getElementById('theme-faction-label');
        
        const factionName = Localization.get(`faction_${faction}`);
        const townLabel = Localization.get('btn_town');
        factionLabel.innerText = `${factionName} (${townLabel})`;
        
        factionBtn.style.backgroundImage = `url('assets/${faction}.avif')`;
        
        factionBtn.onclick = () => {
            this.applyThemeSelection(faction);
        };
        this.showScreen('screen-theme-select');
    },

    applyThemeSelection(themeName) {
        this.state.currentOverworldName = themeName;
        this.updateThemeButtonUI();
        
        const shouldLoop = !this.state.isAutoplay;
        const url = `assets/${themeName}.mp3`;
        
        if (this.state.isAutoplay) {
             this.state.trackPositions[url] = 0;
        }

        this.playBg(url, true, shouldLoop);
        this.showScreen('screen-overworld');
    },

    updateThemeButtonUI() {
        const btn = document.getElementById('btn-theme-toggle');
        const currentName = this.state.currentOverworldName;
        btn.style.backgroundImage = `url('assets/${currentName}.avif')`;
    },

    getCurrentOverworldMusic() {
        return `assets/${this.state.currentOverworldName}.mp3`;
    },

    skipEventOverlay() {
        if (this.state.eventCallback) {
            const cb = this.state.eventCallback;
            this.state.eventCallback = null; // Prevent double execution
            this.audio.sfx.pause();
            this.audio.sfx.onended = null;
            document.getElementById('event-overlay').style.display = 'none';
            cb();
        }
    },

    endTurn() {
        // Commit turn time
        this.commitTime();
        // Log end with duration
        this.logEvent('TURN_END', { duration: this.state.activeDurations.turn });
        // Reset turn accumulator
        this.state.activeDurations.turn = 0;

        let nextIndex = this.state.currentPlayerIndex;
        let loopCount = 0;
        let found = false;
        let nextRound = this.state.round;
        let isNewRound = false;

        while(loopCount < this.state.players.length) {
            nextIndex++;
            if (nextIndex >= this.state.players.length) {
                nextIndex = 0;
                isNewRound = true;
            }

            if (!this.state.players[nextIndex].eliminated) {
                found = true;
                break;
            }
            loopCount++;
        }

        if (!found) {
            this.finishGameSequence('assets/lose.avif', Localization.get('msg_defeat'), 'assets/ultimatelose.mp3', false);
            return;
        }
        
        if (isNewRound) {
            nextRound++;
        }

        let sfxToPlay = 'newday.mp3';
        let overlayText = Localization.get('event_new_day');
        let image = "assets/newday.gif";
        let roundType = 'new_day';

        if (isNewRound) {
            if (nextRound % 2 === 0) {
                sfxToPlay = 'newmonth.mp3';
                overlayText = Localization.get('event_astrologers');
                roundType = 'new_month';
            } else {
                sfxToPlay = 'newweek.mp3';
                overlayText = Localization.get('event_resource_round');
                roundType = 'new_week';
            }
            image = "assets/newtime.gif";
        }

        this.stopBg(true);

        const currentOl = document.getElementById('event-overlay');
        const eventText = document.getElementById('event-text');

        if (currentOl) {
            const uniqueUrl = `${image}?v=${Date.now()}`;
            currentOl.style.backgroundImage = 'none';
            void currentOl.offsetWidth;
            currentOl.style.backgroundImage = `url('${uniqueUrl}')`;
            currentOl.style.display = 'flex';
        }

        if (eventText) {
            eventText.innerHTML = overlayText;
        }
        
        if (isNewRound) {
            this.logEvent('ROUND_START', { roundType: roundType, newRoundNumber: nextRound });
        }

        // Define the transition logic
        const proceed = () => {
            const overlay = document.getElementById('event-overlay');
            if (overlay) overlay.style.display = 'none';
            this.state.currentPlayerIndex = nextIndex;
            this.state.round = nextRound;
            this.startTurn(true, 0);
            this.state.eventCallback = null;
        };

        this.state.eventCallback = proceed;
        this.playSfx(sfxToPlay, () => {
            if (this.state.eventCallback) this.skipEventOverlay();
        });
    },

    handleResource() {
        document.getElementById('resource-popup').style.display = 'flex';
    },

    handleResourceChoice(type) {
        document.getElementById('resource-popup').style.display = 'none';
        
        // Log pickup
        this.logEvent('PICKUP', { type: type });

        this.audio.ch1.pause();
        this.audio.ch2.pause();

        if (type === 'gold') {
            this.playSfx('gold.mp3', () => this.resumeBg());
        } else if (type === 'valuable') {
            let introNum;
            do {
                introNum = Math.floor(Math.random() * 7) + 1;
            } while (introNum === this.state.lastTreasureIdx);
            
            this.state.lastTreasureIdx = introNum;
            this.playSfx(`treasure${introNum}.mp3`, () => this.resumeBg());
        } else if (type === 'artifact') {
            this.playSfx('artifact.mp3', () => this.resumeBg());
        }
    },

    askEliminate() {
        const player = this.state.players[this.state.currentPlayerIndex];
        this.state.pendingGameOver = 'eliminate';
        document.getElementById('confirm-msg').innerText = Localization.get('msg_eliminate_confirm', player.name);
        document.getElementById('confirm-overlay').style.display = 'flex';
    },

    startCombat() {
        this.stopBg();
        
        // Switch to Battle Timer
        this.setTimerMode('battle'); 
        this.logEvent('BATTLE_START');

        document.getElementById('combat-title').innerText = Localization.get('combat_title', this.state.players[this.state.currentPlayerIndex].name);

        let introNum;
        do {
            introNum = Math.floor(Math.random() * 8) + 1;
        } while (introNum === this.state.lastBattleIdx && introNum !== 0);
        this.state.lastBattleIdx = introNum;
        
        let combatNum;
        do {
            combatNum = Math.floor(Math.random() * 4) + 1;
        } while (combatNum === this.state.lastCombatIdx);
        this.state.lastCombatIdx = combatNum;

        const introFile = `battle${introNum}.mp3`;
        const combatFile = `assets/combat${combatNum}.mp3`;

        this.showScreen('screen-combat');

        this.playSfx(introFile, () => {
            this.playBg(combatFile, false); 
        });
    },

    combatVictory() {
        this.finishCombat('win', Localization.get('msg_victory'), "assets/victory_animated.avif", 'win_battle.mp3');
    },

    combatRetreat() {
        this.finishCombat('retreat', Localization.get('msg_retreat'), "assets/retreat_animated.avif", 'retreat.mp3');
    },

    combatSurrender() {
        this.finishCombat('surrender', Localization.get('msg_surrender'), "assets/surrender_animated.avif", 'surrender.mp3');
    },

    combatLose() {
        this.finishCombat('lose', Localization.get('msg_defeat'), "assets/eliminated_animated.avif", 'lose.mp3');
    },

    finishCombat(result, text, bgImageUrl, sfxFile) {
        // Commit battle time
        this.commitTime();
        this.logEvent('BATTLE_END', { result: result, duration: this.state.activeDurations.battle });
        this.state.activeDurations.battle = 0;

        this.stopBg();
        this.showCombatOverlay(text, bgImageUrl);
        this.playSfx(sfxFile, () => this.returnToOverworld());
    },

    showCombatOverlay(text, bgImageUrl) {
        document.getElementById('combat-title').innerText = text;
        const overlay = document.getElementById('combat-event-overlay');
        const uniqueUrl = `${bgImageUrl}?v=${Date.now()}`;
        overlay.style.backgroundImage = 'none';
        void overlay.offsetWidth;
        overlay.style.backgroundImage = `url('${uniqueUrl}')`;
        overlay.style.display = 'flex';
        document.getElementById('combat-event-text').innerText = text;
    },

    hideCombatOverlay() {
        document.getElementById('combat-event-overlay').style.display = 'none';
    },

    returnToOverworld() {
        this.setTimerMode('overworld');
        this.state.trackPositions = {};
        this.audio.sfx.pause();
        this.audio.sfx.onended = null;
        this.hideCombatOverlay();
        this.showScreen('screen-overworld');
        
        const shouldLoop = !this.state.isAutoplay;
        this.playBg(this.getCurrentOverworldMusic(), true, shouldLoop);
    },

    showRules(fromScreen) {
        this.state.previousScreen = fromScreen;
        this.state.previousMusic = this.audio.currentBgUrl;
        this.state.previousTimerMode = this.state.timerMode;
        
        this.setTimerMode('rules');
        this.logEvent('RULES_START', { fromScreen: fromScreen });

        let introNum;
        do {
            introNum = Math.floor(Math.random() * 3) + 1;
        } while (introNum === this.state.lastAiIdx && introNum !== 0);
        this.state.lastAiIdx = introNum;
        let aiFile = `assets/ai${introNum}.mp3`;

        this.playBg(aiFile);
        this.showScreen('screen-rules');
    },

    exitRules() {
        this.commitTime();
        this.logEvent('RULES_END', { duration: this.state.activeDurations.rules });
        this.state.activeDurations.rules = 0;

        this.setTimerMode(this.state.previousTimerMode);
        this.showScreen(this.state.previousScreen);
        if (this.state.currentScreen === 'screen-overworld') {
            const shouldLoop = !this.state.isAutoplay;
            this.playBg(this.getCurrentOverworldMusic(), true, shouldLoop);
        } else if (this.state.previousMusic) {
            this.playBg(this.state.previousMusic);
        }
    },

    winGame() {
        this.state.pendingGameOver = 'win';
        document.getElementById('confirm-msg').innerText = Localization.get('msg_win_confirm');
        document.getElementById('confirm-overlay').style.display = 'flex';
    },

    loseGame() {
        this.state.pendingGameOver = 'lose';
        document.getElementById('confirm-msg').innerText = Localization.get('msg_lose_confirm');
        document.getElementById('confirm-overlay').style.display = 'flex';
    },

    confirmAction(isConfirmed) {
        const action = this.state.pendingGameOver;
        document.getElementById('confirm-overlay').style.display = 'none';
        this.state.pendingGameOver = null;

        if (isConfirmed) {
            if (action === 'win') {
                const playerName = this.state.players[this.state.currentPlayerIndex].name;
                // Set stats view to winner
                this.state.statsViewIndex = this.state.currentPlayerIndex;
                this.finishGameSequence('assets/win_game.avif', Localization.get('msg_victory_title', playerName), 'assets/win_game.mp3', true);
            } else if (action === 'lose') {
                this.state.statsViewIndex = 0; // Default view
                this.finishGameSequence('assets/lose.avif', Localization.get('msg_defeat'), 'assets/ultimatelose.mp3', false);
            } else if (action === 'eliminate') {
                const player = this.state.players[this.state.currentPlayerIndex];
                player.eliminated = true;
                this.logEvent('ELIMINATED');

                const activePlayers = this.state.players.filter(p => !p.eliminated);
                if (activePlayers.length === 0) {
                    this.state.statsViewIndex = this.state.currentPlayerIndex;
                    this.finishGameSequence('assets/lose.avif', Localization.get('msg_defeat'), 'assets/ultimatelose.mp3', false);
                } else {
                    this.endTurn();
                }
            }
        }
    },

    finishGameSequence(imgUrl, titleText, audioUrl, loop) {
        this.commitTime();
        this.logEvent('GAME_END', { winner: titleText });
        this.state.timerMode = 'ended';

        if (this.audio.fadeInterval) clearInterval(this.audio.fadeInterval);
        this.audio.ch1.pause();
        this.audio.ch2.pause();
        this.audio.ch1.volume = 0; 
        this.audio.ch2.volume = 0;
        
        this.updateFactionColor('neutral');

        document.getElementById('endgame-title').innerText = titleText;
        
        const winBtn = document.getElementById('win-theme-btn');
        winBtn.style.backgroundImage = `url('${imgUrl}')`;

        const videoEl = document.getElementById('endgame-video');
        if (videoEl) {
            const isWin = titleText != Localization.get('msg_defeat');
            videoEl.src = isWin ? 'assets/victory.mkv' : 'assets/defeat.mkv';
            videoEl.load();
            setTimeout(() => {
                videoEl.play().catch(e => console.log("Autoplay blocked", e));
            }, 50);
        }

        this.showScreen('screen-win');

        if (loop) {
            const active = this.audio.ch1;
            this.audio.activeChannel = 'ch1';
            active.src = audioUrl;
            active.loop = true;
            active.volume = this.audio.masterVolume;
            active.play().catch(e => console.log("Win play err", e));
            this.audio.currentBgUrl = audioUrl;
        } else {
            this.playSfx(audioUrl.replace('assets/', ''));
        }
    },

    // --- STATISTICS SCREEN LOGIC ---
    
    // Format ms to "Xm Ys"
    fmtTime(ms) {
        if (!ms || ms < 0) ms = 0;
        const totalSeconds = Math.floor(ms / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return Localization.get('time_fmt_m_s', mins, secs);
    },

    // Calculate aggregated stats from the Event History on the fly
    calculateStatsFromHistory() {
        const stats = {
            global: {
                setupTime: 0,
                totalGameTime: 0,
                rulesTime: 0
            },
            players: {}
        };

        // Initialize player entries
        this.state.players.forEach(p => {
            stats.players[p.id] = {
                turnDurations: [],
                battleTime: 0,
                combat: { wins: 0, losses: 0, retreats: 0, surrenders: 0 },
                loot: { gold: 0, valuable: 0, artifact: 0 }
            };
        });

        let gameStartTime = 0;
        let gameEndTime = Date.now(); // Default to now if not ended

        this.state.history.forEach(ev => {
            if (ev.type === 'GAME_START') {
                gameStartTime = ev.timestamp;
                if (ev.data && ev.data.setupTime) stats.global.setupTime = ev.data.setupTime;
            }
            if (ev.type === 'GAME_END') {
                gameEndTime = ev.timestamp;
            }
            if (ev.type === 'RULES_END') {
                stats.global.rulesTime += (ev.data.duration || 0);
            }
            
            // Player Specific
            if (ev.playerId !== null && stats.players[ev.playerId]) {
                const pStat = stats.players[ev.playerId];
                
                if (ev.type === 'TURN_END') {
                    pStat.turnDurations.push(ev.data.duration || 0);
                }
                if (ev.type === 'BATTLE_END') {
                    pStat.battleTime += (ev.data.duration || 0);
                    const res = ev.data.result;
                    if (res === 'win') pStat.combat.wins++;
                    else if (res === 'loss') pStat.combat.losses++;
                    else if (res === 'retreat') pStat.combat.retreats++;
                    else if (res === 'surrender') pStat.combat.surrenders++;
                }
                if (ev.type === 'PICKUP') {
                    const t = ev.data.type;
                    if (t === 'gold') pStat.loot.gold++;
                    else if (t === 'valuable') pStat.loot.valuable++;
                    else if (t === 'artifact') pStat.loot.artifact++;
                }
            }
        });

        if (gameStartTime > 0) {
            stats.global.totalGameTime = gameEndTime - gameStartTime;
        } else {
            // If viewing stats before game starts
            stats.global.totalGameTime = 0;
            // Approximate setup time if not logged yet
            stats.global.setupTime = Date.now() - this.state.appLoadedAt; 
        }

        return stats;
    },

    showStats(playerIdx) {
        // Validation
        if (playerIdx < 0) playerIdx = this.state.players.length - 1;
        if (playerIdx >= this.state.players.length) playerIdx = 0;
        this.state.statsViewIndex = playerIdx;

        const player = this.state.players[playerIdx];

        // 1. Calculate Data
        const data = this.calculateStatsFromHistory();
        const pData = data.players[player.id];

        // 2. Set Background & Header
        this.updateFactionColor(player.faction);
        
        // 3. Global Stats UI
        document.getElementById('stat-setup').innerText = this.fmtTime(data.global.setupTime);
        document.getElementById('stat-game-total').innerText = this.fmtTime(data.global.totalGameTime);
        document.getElementById('stat-rules').innerText = this.fmtTime(data.global.rulesTime);

        // 4. Player Card UI
        document.getElementById('stat-p-name').innerText = player.name;
        document.getElementById('stat-p-faction').innerText = Localization.get(`faction_${player.faction}`);
        const pImg = document.getElementById('stat-p-img');
        pImg.style.backgroundImage = `url('assets/${player.faction}.avif')`;

        // Player Time Calcs
        let totalTurnTime = 0;
        let fastestTurn = Infinity;
        let slowestTurn = 0;
        
        pData.turnDurations.forEach(t => {
            totalTurnTime += t;
            if (t < fastestTurn) fastestTurn = t;
            if (t > slowestTurn) slowestTurn = t;
        });

        const avgTurn = pData.turnDurations.length > 0 ? (totalTurnTime / pData.turnDurations.length) : 0;
        
        document.getElementById('stat-avg-turn').innerText = this.fmtTime(avgTurn);
        document.getElementById('stat-battle-total').innerText = this.fmtTime(pData.battleTime);
        
        // Highlights
        document.getElementById('stat-fast-turn').innerText = fastestTurn === Infinity ? "-" : this.fmtTime(fastestTurn);
        document.getElementById('stat-slow-turn').innerText = slowestTurn === 0 ? "-" : this.fmtTime(slowestTurn);

        // Counters
        const c = pData.combat;
        const l = pData.loot;
        document.getElementById('stat-combat-rec').innerText = `${c.wins} / ${c.losses} / ${c.retreats} / ${c.surrenders}`;
        document.getElementById('stat-loot-rec').innerText = `${l.gold} / ${l.valuable} / ${l.artifact}`;

        this.showScreen('screen-stats');
    },

    cycleStatsPlayer(direction) {
        this.showStats(this.state.statsViewIndex + direction);
    },

    exportStats() {
        const now = new Date();
        const data = {
            exportDate: now.toLocaleDateString(),
            exportTime: now.toLocaleTimeString(),
            rawTimestamp: now.toISOString(),
            // Export the raw history now
            history: this.state.history,
            // Also export player metadata for context
            players: this.state.players.map(p => ({
                id: p.id,
                name: p.name,
                faction: p.faction,
                eliminated: p.eliminated
            }))
        };

        const jsonStr = JSON.stringify(data, null, 2);
        const fileName = `${now.toISOString().split('T')[0]}_${now.getHours()}-${now.getMinutes()}_h3timeline.json`;

        if (navigator.share && navigator.canShare) {
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const file = new File([blob], fileName, { type: 'application/json' });

            if (navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: 'HoMM3 Timeline Stats',
                }).catch(() => this.downloadDesktop(jsonStr, fileName));
                return;
            }
        }

        this.downloadDesktop(jsonStr, fileName);
    },

    downloadDesktop(content, fileName) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    },

    resetGame() {
        this.state.players = [];
        this.state.currentPlayerIndex = 0;
        this.state.round = 1;
        this.state.selectedTheme = null;
        this.state.playerCount = 3;
        
        // Reset Stats State
        this.state.history = [];
        this.state.activeDurations = { setup: 0, turn: 0, battle: 0, rules: 0 };
        this.state.appLoadedAt = Date.now();
        this.state.lastTick = Date.now();
        this.state.timerMode = 'setup';

        document.querySelectorAll('.faction-btn').forEach(btn => btn.classList.remove('disabled'));
        
        this.stopBg(true); 
        this.audio.sfx.pause();
        this.audio.sfx.currentTime = 0;
        this.audio.sfx.onended = null;
        this.audio.sfx.onerror = null;
        this.audio.currentBgUrl = null;
        this.state.trackPositions = {};

        const videoEl = document.getElementById('endgame-video');
        if (videoEl) {
            videoEl.pause();
            videoEl.src = "";
            videoEl.load();
        }

        document.getElementById('options-menu').style.display = ''; 
        const langMenu = document.getElementById('lang-submenu');
        if(langMenu) langMenu.style.display = 'none';

        setTimeout(() => this.init(), 100);
    },

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
        document.getElementById(id).style.display = 'flex';
        this.state.currentScreen = id;
    },

    // --- TIMELINE VISUALIZATION ---
    showTimeline() {
        const overlay = document.getElementById('timeline-overlay');
        const content = document.getElementById('timeline-content');
        content.innerHTML = '';
        overlay.style.display = 'flex';
        
        const history = this.state.history;
        if (!history || history.length === 0) return;

        // 1. Calculate Start Time including Setup
        const firstEv = history[0];
        // Ensure we handle setup time if present to draw the "pre-game" line
        const setupDuration = (firstEv.type === 'GAME_START' && firstEv.data.setupTime) ? firstEv.data.setupTime : 0;
        const absoluteStart = firstEv.timestamp - setupDuration; // This defines T=0 at the very bottom
        
        // Calculate average turn time for scaling distance
        let totalTurnMs = 0;
        let turnCount = 0;
        history.forEach(ev => { if (ev.type === 'TURN_END' && ev.data.duration) { totalTurnMs += ev.data.duration; turnCount++; }});
        const avgTurnMs = turnCount > 0 ? (totalTurnMs / turnCount) : 30000;
        const pxPerMs = 120 / (avgTurnMs || 30000); 

        // Helper to create nodes
        const createNode = (y, imgUrl, className = '', customStyle = '') => {
            const node = document.createElement('div');
            node.className = `t-node ${className}`;
            node.style.bottom = `${y}px`;
            node.style.backgroundImage = `url('${imgUrl}')`;
            if (customStyle) node.style.cssText += customStyle;
            content.appendChild(node);
        };

        const createBar = (startY, endY, color) => {
            if (endY <= startY) return;
            const bar = document.createElement('div');
            bar.className = 't-bar';
            bar.style.bottom = `${startY}px`;
            bar.style.height = `${endY - startY}px`;
            bar.style.backgroundColor = color;
            content.appendChild(bar);
        };

        let lastY = 0;
        let maxY = 0;
        let lastColor = '#999'; // Default grey for setup phase
        let battleStartY = null;

        // 2. Draw Setup Phase Line (Grey/White)
        if (setupDuration > 0) {
            const setupEndY = setupDuration * pxPerMs;
            createBar(0, setupEndY, '#ccc'); // The non-colored setup line
            lastY = setupEndY;
        }

        history.forEach(ev => {
            const t = ev.timestamp - absoluteStart;
            const y = t * pxPerMs;
            
            if (y > maxY) maxY = y;

            // Draw segment from lastY to current Y
            if (y > lastY) {
                createBar(lastY, y, lastColor);
            }

            if (ev.type === 'GAME_START') {
                createNode(y, 'assets/start.avif', 't-center t-large'); 
            } 
            else if (ev.type === 'TURN_START') {
                if (ev.faction) lastColor = FACTION_COLORS[ev.faction] || '#555';
            }
            else if (ev.type === 'ROUND_START') {
                const isMonth = ev.data.roundType === 'new_month';
                const isWeek = ev.data.roundType === 'new_week';
                const img = (isMonth || isWeek) ? 'assets/newtime.gif' : 'assets/newday.gif';
                createNode(y, img, 't-center t-small');
            }
            else if (ev.type === 'PICKUP') {
                const type = ev.data.type;
                const img = type === 'gold' ? 'assets/treasure.svg' : (type === 'artifact' ? 'assets/artifact.svg' : 'assets/valuables.svg');
                
                // Offsets: Gold (Farthest Left), Valuable (Mid), Artifact (Inner)
                let multiplier = 200; // Base 300% (Artifact)
                if (type === 'gold') multiplier = 400;
                else if (type === 'valuable') multiplier = 300;

                // 1. Create Horizontal Line connecting node to timeline
                // Since translate % is relative to the node width (40px), 100% = 40px.
                const pixelOffset = (multiplier / 100) * 40; 
                
                const hLine = document.createElement('div');
                hLine.style.cssText = `
                    position: absolute;
                    left: 50%;
                    bottom: ${y}px;
                    width: ${pixelOffset}px;
                    height: 2px;
                    background-color: ${lastColor};
                    transform: translateX(-100%); /* Grow to the left from center */
                    z-index: 3;
                `;
                content.appendChild(hLine);

                // 2. Create Node on the Left
                // translate(-X%, 50%) -> Negative X moves left. Positive Y (50%) moves "down" relative to bottom anchor.
                createNode(y, img, 't-leaf', `left: 50%; bottom: ${y}px; transform: translate(-${multiplier}%, 50%);`);
            }
            else if (ev.type === 'BATTLE_START') {
                battleStartY = y;
            }
            else if (ev.type === 'BATTLE_END') {
                if (battleStartY !== null) {
                    const h = y - battleStartY;
                    const visualH = Math.max(h, 20); 
                    const mid = battleStartY + (visualH/2);
                    
                    const res = ev.data.result;
                    let img = 'assets/victory.avif';
                    if (res === 'loss') img = 'assets/eliminated.avif';
                    else if (res === 'retreat') img = 'assets/retreat.avif';
                    else if (res === 'surrender') img = 'assets/surrender.avif';
                    
                    const bracket = document.createElement('div');
                    bracket.className = 't-battle-bracket';
                    bracket.style.bottom = `${battleStartY}px`;
                    bracket.style.height = `${visualH}px`;
                    content.appendChild(bracket);

                    createNode(mid, img, 't-leaf t-right');
                    battleStartY = null;
                }
            }
            else if (ev.type === 'ELIMINATED') {
                // Right side, further out than battle, 20% larger (scale 1.2)
                createNode(y, 'assets/eliminated.avif', 't-leaf', `left: 50%; bottom: ${y}px; transform: translate(200%, 50%) scale(1.2);`);
            }
            else if (ev.type === 'GAME_END') {
                const winner = ev.data.winner || "";
                const img = winner.includes('Defeat') ? 'assets/lose.avif' : 'assets/win_game.avif';
                createNode(y, img, 't-center t-large');
            }

            lastY = y;
        });

        content.style.height = `${maxY + 150}px`;
        
        // Scroll to the bottom (Start of Timeline)
        setTimeout(() => { 
            overlay.scrollTop = overlay.scrollHeight; 
        }, 10);
    },

    hideTimeline() {
        document.getElementById('timeline-overlay').style.display = 'none';
    },

    setupMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {
                this.resumeBg();
                navigator.mediaSession.playbackState = "playing";
            });
            navigator.mediaSession.setActionHandler('pause', () => this.stopBg('pause'));
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                if (this.state.currentScreen === 'screen-overworld') this.handleAudioEnd();
            });

            // Volume handlers
            [['volumeup', 0.1], ['volumedown', -0.1]].forEach(([action, change]) => {
                try {
                    navigator.mediaSession.setActionHandler(action, () => {
                        const current = parseFloat(this.audio.masterVolume);
                        const newVol = Math.min(1, Math.max(0, current + change));
                        this.setVolume(newVol);
                    });
                } catch (e) {}
            });
        }
    },

    getLocalizedTrackName(trackId) {
        const MUSIC_TRANSLATION_MAP = {
            // Themes
            'good': 'btn_good',
            'evil': 'btn_evil',
            'neutral': 'btn_neutral',
            'secret': 'btn_secret',
            
            // Factions
            'castle': 'faction_castle',
            'rampart': 'faction_rampart',
            'tower': 'faction_tower',
            'inferno': 'faction_inferno',
            'dungeon': 'faction_dungeon',
            'necropolis': 'faction_necropolis',
            'fortress': 'faction_fortress',
            'stronghold': 'faction_stronghold',
            'conflux': 'faction_conflux',
            'cove': 'faction_cove',
            'factory': 'faction_factory',

            // Terrains
            'dirt': 'terrain_dirt',
            'grass': 'terrain_grass',
            'lava': 'terrain_lava',
            'rough': 'terrain_rough',
            'sand': 'terrain_sand',
            'snow': 'terrain_snow',
            'swamp': 'terrain_swamp',
            'underground': 'terrain_underground',
            'water': 'terrain_water',
            'wasteland': 'terrain_wasteland',

            // Game States
            'combat': 'combat_title_generic',
            'win': 'victory_title',
            'lose': 'btn_lose_scenario'
        };
        const key = MUSIC_TRANSLATION_MAP[trackId];
        if (key && Localization.get(key)) {
            return Localization.get(key);
        }
        console.error("No localization found for BG music track name: " + trackId)
        // Fallback: Capitalize the ID if no translation found (e.g. "Castle")
        return trackId.charAt(0).toUpperCase() + trackId.slice(1);
    },

    updateMediaMetadata(title, artist = "HoMM3 Companion") {
        if ('mediaSession' in navigator) {
            const potentialImage = `assets/${title}.avif`;
            const hasImage = ASSET_QUEUE.includes(potentialImage);
            const finalImage = hasImage ? potentialImage : 'assets/good.avif';
            navigator.mediaSession.metadata = new MediaMetadata({
                title: this.getLocalizedTrackName(title), // You might want to capitalize this for display (e.g., 'Castle' vs 'castle')
                artist: artist,
                artwork: [
                    { src: finalImage, sizes: '512x512', type: 'image/avif' }
                ]
            });
        }
    },
};

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (Game && Game.updatePWAButtons) Game.updatePWAButtons();
});

window.addEventListener('DOMContentLoaded', () => {
    Localization.init();
});

window.Game = Game;
