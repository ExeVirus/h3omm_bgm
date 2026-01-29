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
    'neutral': '#333333' // Default
};

const TERRAIN_TRACKS = [
    'assets/dirt.mp3', 'assets/grass.mp3', 'assets/highlands.mp3', 
    'assets/lava.mp3', 'assets/rough.mp3', 'assets/sand.mp3', 
    'assets/snow.mp3', 'assets/swamp.mp3', 'assets/underground.mp3', 
    'assets/wasteland.mp3', 'assets/water.mp3'
];

const ASSET_QUEUE = [
    // 1. Audio (Music & SFX)
    'assets/main.mp3',
    'assets/good.mp3', 'assets/evil.mp3', 'assets/neutral.mp3', 'assets/secret.mp3',
    'assets/castle.mp3', 'assets/rampart.mp3', 'assets/tower.mp3',
    'assets/inferno.mp3', 'assets/dungeon.mp3', 'assets/necropolis.mp3',
    'assets/fortress.mp3', 'assets/stronghold.mp3',
    'assets/conflux.mp3', 'assets/cove.mp3',
    'assets/battle1.mp3', 'assets/battle2.mp3', 'assets/battle3.mp3', 'assets/battle4.mp3',
    'assets/battle5.mp3', 'assets/battle6.mp3', 'assets/battle7.mp3', 'assets/battle8.mp3',
    'assets/combat1.mp3', 'assets/combat2.mp3', 'assets/combat3.mp3', 'assets/combat4.mp3',
    'assets/ai1.mp3', 'assets/ai2.mp3', 'assets/ai3.mp3',
    'assets/chest.mp3', 'assets/treasure.mp3',
    'assets/newday.mp3', 'assets/newweek.mp3', 'assets/newmonth.mp3',
    'assets/win_battle.mp3', 
    'assets/experience.mp3', 'assets/lose.mp3', 'assets/retreat.mp3',
    'assets/win_game.mp3', 'assets/ultimatelose.mp3',

    // Terrain
    `assets/dirt.mp3`,
    `assets/grass.mp3`,
    `assets/highlands.mp3`,
    `assets/lava.mp3`,
    `assets/rough.mp3`,
    `assets/sand.mp3`,
    `assets/snow.mp3`,
    `assets/swamp.mp3`,
    `assets/underground.mp3`,
    `assets/wasteland.mp3`,
    `assets/water.mp3`,

    // 2. Images (AVIFs fetched after music starts loading)
    'assets/good.avif', 'assets/evil.avif', 'assets/neutral.avif', 'assets/secret.avif',
    'assets/castle.avif', 'assets/rampart.avif', 'assets/tower.avif',
    'assets/inferno.avif', 'assets/dungeon.avif', 'assets/necropolis.avif',
    'assets/fortress.avif', 'assets/stronghold.avif',
    'assets/conflux.avif', 'assets/cove.avif',
    'assets/newtime.avif','./assets/tile.avif',
    'assets/start.avif', 'assets/resource.avif', 'assets/artifact.avif', 
    'assets/end_turn.avif', 'assets/rules.avif', 'assets/win_game.avif',
    'assets/victory.avif', 'assets/retreat.avif', 'assets/lose.avif'
];

const Game = {
    state: {
        currentScreen: 'screen-start',
        players: [], 
        currentPlayerIndex: 0,
        round: 1,
        selectedTheme: null,
        playerCount: 3,
        lastBattleIdx: -1, 
        lastCombatIdx: -1,
        overworldTheme: 'town', // 'town' or 'tile'
        currentTerrainMusic: null, // Track the specific terrain for this turn
        lastTerrainMusic: null,    // Track the previous turn's terrain to avoid repeats
        pendingGameOver: null, // Stores 'win' or 'lose
        // Helper state for setup
        tempPlayerName: ""
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

    // --- AUDIO ENGINE ---

    playBg(url, fade = true) {
        const fullUrl = url.includes('/') ? url : `assets/${url}`;
        if (this.audio.currentBgUrl === fullUrl) return;

        if (this.audio.fadeInterval) {
            clearInterval(this.audio.fadeInterval);
            this.audio.fadeInterval = null;
        }

        const outgoing = this.audio[this.audio.activeChannel];
        const nextChannelName = (this.audio.activeChannel === 'ch1') ? 'ch2' : 'ch1';
        const incoming = this.audio[nextChannelName];

        incoming.src = fullUrl;
        incoming.loop = true;
        incoming.volume = 0;
        incoming.muted = this.audio.isMuted;
        this.audio.currentBgUrl = fullUrl;
        this.audio.activeChannel = nextChannelName;

        const playPromise = incoming.play();
        if (playPromise) playPromise.catch(e => console.error("Audio Play Err:", e));

        if (!fade) {
            incoming.volume = 1;
            outgoing.pause();
            outgoing.volume = 0;
            outgoing.currentTime = 0;
        } else {
            this.audio.fadeInterval = setInterval(() => {
                const step = 0.05;
                let isDone = true;
                const targetVol = this.audio.masterVolume;

                if (incoming.volume < targetVol) {
                    incoming.volume = Math.min(targetVol, incoming.volume + step);
                    isDone = false;
                }
                if (outgoing.volume > 0) {
                    outgoing.volume = Math.max(0, outgoing.volume - step);
                    isDone = false;
                }
                if (isDone) {
                    clearInterval(this.audio.fadeInterval);
                    this.audio.fadeInterval = null;
                    outgoing.pause();
                    outgoing.currentTime = 0;
                }
            }, 50);
        }
    },

    stopBg(hardStop = false) {
        if (this.audio.fadeInterval) {
            clearInterval(this.audio.fadeInterval);
            this.audio.fadeInterval = null;
        }

        this.audio.currentBgUrl = null;
        const c1 = this.audio.ch1;
        const c2 = this.audio.ch2;

        if (hardStop) {
            c1.pause();
            c2.pause();
            c1.volume = 0;
            c2.volume = 0;
            c1.currentTime = 0;
            c2.currentTime = 0;
            return;
        }

        this.audio.fadeInterval = setInterval(() => {
            let activeVol = false;
            
            if (c1.volume > 0) {
                c1.volume = Math.max(0, c1.volume - 0.1);
                activeVol = true;
            }
            if (c2.volume > 0) {
                c2.volume = Math.max(0, c2.volume - 0.1);
                activeVol = true;
            }

            if (!activeVol) {
                clearInterval(this.audio.fadeInterval);
                this.audio.fadeInterval = null;
                c1.pause();
                c2.pause();
            }
        }, 50);
    },

    resumeBg() {
        const active = this.audio[this.audio.activeChannel];
        if (this.audio.currentBgUrl && active.paused) {
            active.volume = 1;
            active.play().catch(e => console.log("Resume err", e));
        }
    },

    playSfx(filename, onComplete = null) {
        // 1. Stop any current SFX and wipe existing callbacks
        this.audio.sfx.pause();
        this.audio.sfx.onended = null;
        this.audio.sfx.onerror = null;

        this.audio.sfx.src = `assets/${filename}`;
        this.audio.sfx.loop = false;
        this.audio.sfx.volume = this.audio.masterVolume;
        this.audio.sfx.muted = this.audio.isMuted;
        // 2. Set the callback if provided
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
            console.error(`SFX Play Blocked (${filename}):`, e);
            if(onComplete) onComplete();
        });
    },

    setVolume(val) {
        this.audio.masterVolume = parseFloat(val);
        
        // Update currently active background channel volume
        // (Fade logic will automatically use this value as it runs)
        this.audio[this.audio.activeChannel].volume = this.audio.masterVolume;
    },

    toggleMute() {
        this.audio.isMuted = !this.audio.isMuted;
        
        // Apply mute instantly to all channels
        this.audio.ch1.muted = this.audio.isMuted;
        this.audio.ch2.muted = this.audio.isMuted;
        this.audio.sfx.muted = this.audio.isMuted;

        // Update UI
        document.getElementById('mute-btn').innerText = this.audio.isMuted ? '🔇' : '🔊';
        document.getElementById('mute-btn').classList.toggle('is-muted', this.audio.isMuted);
    },

    // --- PRELOADER ---
    
    initPreloader() {
        let qIndex = 0;
        const loadNext = () => {
            if (qIndex >= ASSET_QUEUE.length) {
                console.log("Preload Complete");
                return;
            }
            const url = ASSET_QUEUE[qIndex];
            qIndex++;
            
            fetch(url)
                .then(r => r.blob())
                .then(() => loadNext())
                .catch(err => {
                    console.log("Preload skip:", url);
                    loadNext();
                });
        };
        loadNext();
    },

    // --- GAME LOGIC ---

    init() {
        document.getElementById('click-overlay').style.display = 'none';
        this.playBg('assets/main.mp3');
        this.showScreen('screen-start');
        this.updateFactionColor('neutral');
        this.initPreloader(); 
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
        
        // Setup UI for current player
        const defaultName = `Player ${playerIndex + 1}`;
        this.state.tempPlayerName = defaultName;
        document.getElementById('faction-player-title').innerText = defaultName;
        
        this.showScreen('screen-factions');
        
        // Identify which factions are already taken
        const takenFactions = this.state.players.map(p => p.faction);
        
        const buttons = document.querySelectorAll('.faction-btn');
        buttons.forEach(btn => {
            const faction = btn.dataset.faction;
            
            if (takenFactions.includes(faction)) {
                // Faction is already picked: Apply disabled style and remove click
                btn.classList.add('disabled');
                btn.onclick = null;
            } else {
                // Faction is available: Remove disabled style and attach click
                btn.classList.remove('disabled');
                btn.onclick = () => {
                    this.state.players.push({ 
                        id: playerIndex, 
                        faction: faction, 
                        name: this.state.tempPlayerName 
                    });
                    // Proceed to next player
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
        this.state.round = 1;
        this.state.currentPlayerIndex = 0;
        this.startTurn(false); 
    },

    startTurn(isTransition = true, musicDelay = 0) {
        const player = this.state.players[this.state.currentPlayerIndex];
        
        // --- NEW LOGIC: Pick a unique terrain for this turn ---
        const availableTerrains = TERRAIN_TRACKS.filter(t => t !== this.state.lastTerrainMusic);
        const randomTerrain = availableTerrains[Math.floor(Math.random() * availableTerrains.length)];
        
        this.state.currentTerrainMusic = randomTerrain;
        this.state.lastTerrainMusic = randomTerrain;
        // ------------------------------------------------------

        // Reset to Town Theme for new turn
        this.state.overworldTheme = 'town';
        this.updateThemeButtonUI();
        
        const overworldMusic = this.getCurrentOverworldMusic();
        document.getElementById('overworld-title').innerText = `${player.name}'s Turn`;
        this.updateFactionColor(player.faction);
        this.showScreen('screen-overworld');
        
        if (!isTransition) {
            this.playBg(overworldMusic);
        } else {
            setTimeout(() => {
                if(this.state.currentScreen === 'screen-overworld') {
                    this.playBg(overworldMusic);
                }
            }, musicDelay);
        }
    },

    getFactionMusic(faction) {
        const map = {
            'castle': 'assets/castle.mp3',
            'rampart': 'assets/rampart.mp3',
            'tower': 'assets/tower.mp3',
            'inferno': 'assets/inferno.mp3',
            'dungeon': 'assets/dungeon.mp3',
            'necropolis': 'assets/necropolis.mp3',
            'fortress': 'assets/fortress.mp3',
            'stronghold': 'assets/stronghold.mp3',
            'conflux': 'assets/conflux.mp3',
            'cove': 'assets/cove.mp3'
        };
        return map[faction];
    },

    toggleOverworldTheme() {
        this.state.overworldTheme = (this.state.overworldTheme === 'town') ? 'tile' : 'town';
        this.updateThemeButtonUI();
        
        // Play the appropriate music immediately
        const music = this.getCurrentOverworldMusic();
        this.playBg(music);
    },

    updateThemeButtonUI() {
        const player = this.state.players[this.state.currentPlayerIndex];
        const btn = document.getElementById('btn-theme-toggle');
        const label = document.getElementById('label-theme-toggle');
        
        if (this.state.overworldTheme === 'town') {
            label.innerText = "Town Theme";
            btn.style.backgroundImage = `url('assets/${player.faction}.avif')`;
        } else {
            label.innerText = "Tile Theme";
            btn.style.backgroundImage = `url('assets/tile.avif')`;
        }
    },

    getCurrentOverworldMusic() {
        if (this.state.overworldTheme === 'tile') {
            return this.state.currentTerrainMusic; // Use the one selected at start of turn
        }
        const player = this.state.players[this.state.currentPlayerIndex];
        return this.getFactionMusic(player.faction);
    },

    endTurn() {
        let nextIndex = this.state.currentPlayerIndex + 1;
        let nextRound = this.state.round;
        let isSpecialEvent = false;
        let sfxToPlay = 'newday.mp3';
        let overlayText = null;

        if (nextIndex >= this.state.players.length) {
            nextIndex = 0;
            nextRound++;
            isSpecialEvent = true;
            
            // Even rounds (2, 4...) are Month (Astrologers)
            // Odd rounds (3, 5...) are Week (Resource)
            if (nextRound % 2 === 0) {
                sfxToPlay = 'newmonth.mp3';
                overlayText = "Astrologers Proclaim!";
            } else {
                sfxToPlay = 'newweek.mp3';
                overlayText = "Resource Round";
            }
        }

        this.stopBg(true);

        if (isSpecialEvent) {
            const ol = document.getElementById('event-overlay');
            document.getElementById('event-text').innerText = overlayText;
            ol.style.display = 'flex';

            this.playSfx(sfxToPlay, () => {
                document.getElementById('event-overlay').style.display = 'none';
                this.state.currentPlayerIndex = nextIndex;
                this.state.round = nextRound;
                this.startTurn(true, 0);
            });

        } else {
            this.playSfx(sfxToPlay);
            this.state.currentPlayerIndex = nextIndex;
            this.state.round = nextRound;
            this.startTurn(true, 3000);
        }
    },

    handleResource() {
        this.audio.ch1.pause();
        this.audio.ch2.pause();
        this.playSfx('chest.mp3', () => this.resumeBg());
    },

    handleArtifact() {
        this.audio.ch1.pause();
        this.audio.ch2.pause();
        this.playSfx('treasure.mp3', () => this.resumeBg());
    },

    startCombat() {
        this.stopBg();
        // Use custom name
        document.getElementById('combat-title').innerText = `${this.state.players[this.state.currentPlayerIndex].name}'s Combat`;

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

    // --- COMBAT RESULTS ---
    combatVictory() {
        this.stopBg();
        this.showCombatOverlay("Victory", "assets/victory.avif");
        this.playSfx('win_battle.mp3', () => this.returnToOverworld());
    },

    combatRetreat() {
        this.stopBg();
        this.showCombatOverlay("Retreat", "assets/retreat.avif");
        this.playSfx('retreat.mp3', () => this.returnToOverworld());
    },

    combatLose() {
        this.stopBg();
        this.showCombatOverlay("Defeat", "assets/lose.avif");
        this.playSfx('lose.mp3', () => this.returnToOverworld());
    },

    // --- OVERLAY HELPERS ---
    showCombatOverlay(text, bgImageUrl) {
        // Update Title
        document.getElementById('combat-title').innerText = text;
        
        // Update Overlay
        const overlay = document.getElementById('combat-event-overlay');
        overlay.style.backgroundImage = `url('${bgImageUrl}')`;
        overlay.style.display = 'flex';
        
        // Update Overlay Text
        document.getElementById('combat-event-text').innerText = text;
    },

    hideCombatOverlay() {
        document.getElementById('combat-event-overlay').style.display = 'none';
    },

    returnToOverworld() {
        this.audio.sfx.pause();
        this.audio.sfx.onended = null;
        this.hideCombatOverlay();
        
        // Instead of startTurn(true), we just switch screen and play the correct current music
        this.showScreen('screen-overworld');
        this.playBg(this.getCurrentOverworldMusic());
    },

    showRules(fromScreen) {
        this.state.previousScreen = fromScreen;
        this.state.previousMusic = this.audio.currentBgUrl;
        
        const aiNum = Math.floor(Math.random() * 3) + 1;
        let aiFile = `assets/ai${aiNum}.mp3`;

        this.playBg(aiFile);
        this.showScreen('screen-rules');
    },

    exitRules() {
        this.showScreen(this.state.previousScreen);
        if (this.state.currentScreen === 'screen-overworld') {
            this.playBg(this.getCurrentOverworldMusic());
        } else if (this.state.previousMusic) {
            this.playBg(this.state.previousMusic);
        }
    },

    winGame() {
        this.state.pendingGameOver = 'win';
        document.getElementById('confirm-msg').innerText = "Proclaim Victory?";
        document.getElementById('confirm-overlay').style.display = 'flex';
    },

    loseGame() {
        this.state.pendingGameOver = 'lose';
        document.getElementById('confirm-msg').innerText = "Really Lost Scenario?";
        document.getElementById('confirm-overlay').style.display = 'flex';
    },

    // Handles the Yes/No logic
    confirmAction(isConfirmed) {
        const action = this.state.pendingGameOver;
        
        // Hide overlay immediately
        document.getElementById('confirm-overlay').style.display = 'none';
        this.state.pendingGameOver = null;

        if (isConfirmed) {
            if (action === 'win') {
                const playerName = this.state.players[this.state.currentPlayerIndex].name;
                this.finishGameSequence('assets/win_game.avif', `${playerName}'s Victory!`, 'assets/win_game.mp3', true);
            } else if (action === 'lose') {
                this.finishGameSequence('assets/lose.avif', 'Defeat', 'assets/ultimatelose.mp3', false);
            }
        }
    },

    finishGameSequence(imgUrl, titleText, audioUrl, loop) {
        if (this.audio.fadeInterval) clearInterval(this.audio.fadeInterval);
        this.audio.ch1.pause();
        this.audio.ch2.pause();
        this.audio.ch1.volume = 0; 
        this.audio.ch2.volume = 0;
        
        this.updateFactionColor('neutral');

        document.getElementById('endgame-title').innerText = titleText;
        
        const winBtn = document.getElementById('win-theme-btn');
        winBtn.style.backgroundImage = `url('${imgUrl}')`;

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

    resetGame() {
        // 1. Clear game state
        this.state.players = [];
        this.state.currentPlayerIndex = 0;
        this.state.round = 1;
        this.state.selectedTheme = null;
        this.state.playerCount = 3;
        this.state.lastTerrainMusic = null;
        document.querySelectorAll('.faction-btn').forEach(btn => btn.classList.remove('disabled'));
        
        // 2. Stop sounds and music
        this.stopBg(true); 
        this.audio.sfx.pause();
        this.audio.sfx.currentTime = 0;
        this.audio.sfx.onended = null;
        this.audio.sfx.onerror = null;
        this.audio.currentBgUrl = null;

        // 3. Return to Main Menu
        setTimeout(() => this.init(), 100);
    },
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
        document.getElementById(id).style.display = 'flex';
        this.state.currentScreen = id;
    }
};

window.Game = Game;