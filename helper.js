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

// Cleaned up list for easier logic
const TERRAIN_NAMES = [
    'dirt', 'grass', 'lava', 'rough',
    'sand', 'snow', 'swamp', 'underground',
    'water'
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
    'assets/gold.avif', 'assets/valuable.avif',
    'assets/artifact.mp3',
    'assets/newday.mp3', 'assets/newweek.mp3', 'assets/newmonth.mp3',
    'assets/win_battle.mp3', 
    'assets/experience.mp3', 'assets/lose.mp3', 'assets/retreat.mp3',
    'assets/win_game.mp3', 'assets/ultimatelose.mp3',

    // Treasure
    `assets/treasure1.mp3`, `assets/treasure2.mp3`, `assets/treasure3.mp3`,
    `assets/treasure4.mp3`, `assets/treasure5.mp3`, `assets/treasure6.mp3`,
    `assets/treasure7.mp3`, `assets/gold.mp3`,

    // Terrain
    `assets/dirt.mp3`, `assets/grass.mp3`, `assets/lava.mp3`,
    `assets/rough.mp3`, `assets/sand.mp3`, `assets/snow.mp3`,
    `assets/swamp.mp3`, `assets/underground.mp3`, `assets/water.mp3`,

    // 2. Images 
    'assets/good.avif', 'assets/evil.avif', 'assets/neutral.avif', 'assets/secret.avif',
    'assets/castle.avif', 'assets/rampart.avif', 'assets/tower.avif',
    'assets/inferno.avif', 'assets/dungeon.avif', 'assets/necropolis.avif',
    'assets/fortress.avif', 'assets/stronghold.avif',
    'assets/conflux.avif', 'assets/cove.avif',
    'assets/newday.avif', 'assets/newtime.avif','./assets/tile.avif',
    'assets/start.avif', 'assets/resource.avif', 'assets/artifact.avif', 
    'assets/end_turn.avif', 'assets/rules.avif', 'assets/win_game.avif',
    'assets/victory.avif', 'assets/retreat.avif', 'assets/lose.avif',
    // Terrains
    'assets/dirt.avif', 'assets/grass.avif', 'assets/lava.avif', 'assets/rough.avif',
    'assets/sand.avif', 'assets/snow.avif', 'assets/swamp.avif', 'assets/underground.avif',
    'assets/water.avif'
];

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
        const savedTime = this.state.trackPositions[fullUrl] || 0;
        incoming.currentTime = savedTime;
        incoming.loop = true;
        incoming.volume = 0;
        incoming.muted = this.audio.isMuted;
        this.audio.currentBgUrl = fullUrl;
        this.audio.activeChannel = nextChannelName;

        const playPromise = incoming.play();
        if (playPromise) playPromise.catch(e => console.error("Audio Play Err:", e));

        if (!fade) {
            incoming.volume = this.audio.masterVolume;
            outgoing.pause();
            outgoing.volume = 0;
        } else {
            this.audio.fadeInterval = setInterval(() => {
                const step = 0.05;
                let isDone = true;
                const targetVol = this.audio.masterVolume; // Dynamic target

                if (incoming.volume < targetVol) {
                    incoming.volume = Math.min(targetVol, incoming.volume + step);
                    isDone = false;
                } else if (incoming.volume > targetVol) {
                    incoming.volume = targetVol; // Clamp if user lowered slider mid-fade
                }

                if (outgoing.volume > 0) {
                    outgoing.volume = Math.max(0, outgoing.volume - step);
                    isDone = false;
                }
                
                if (isDone) {
                    clearInterval(this.audio.fadeInterval);
                    this.audio.fadeInterval = null;
                    outgoing.pause();
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

        this.audio.currentBgUrl = null;
        const c1 = this.audio.ch1;
        const c2 = this.audio.ch2;

        if (hardStop) {
            c1.pause();
            c2.pause();
            c1.volume = 0;
            c2.volume = 0;
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
            if(onComplete) onComplete();
        });
    },

    setVolume(val) {
        const volume = parseFloat(val);
        this.audio.masterVolume = volume;
        this.audio.sfx.volume = volume;
        // Update music channels
        // If we are NOT fading, set them to master volume immediately.
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
        
        const defaultName = `Player ${playerIndex + 1}`;
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
                        name: this.state.tempPlayerName 
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
        this.state.round = 1;
        this.state.currentPlayerIndex = 0;
        this.startTurn(false); 
    },

    startTurn(isTransition = true, musicDelay = 0) {
        if (this.state.musicTimer) {
            clearTimeout(this.state.musicTimer);
            this.state.musicTimer = null;
        }
        const player = this.state.players[this.state.currentPlayerIndex];
        this.state.trackPositions = {};

        this.state.currentOverworldName = player.faction;
        
        // Update UI
        document.getElementById('overworld-title').innerText = `${player.name}'s Turn`;
        document.getElementById('overworld-faction-subtitle').innerText = player.faction;
        this.updateFactionColor(player.faction);
        this.updateThemeButtonUI();
        
        this.showScreen('screen-overworld');
        
        const overworldMusic = `assets/${this.state.currentOverworldName}.mp3`;

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

    openThemeSelector() {
        const player = this.state.players[this.state.currentPlayerIndex];
        const faction = player.faction;

        // 1. Setup the Faction Button (Row 1)
        const factionBtn = document.getElementById('theme-faction-btn');
        const factionLabel = document.getElementById('theme-faction-label');
        
        factionLabel.innerText = `${faction.charAt(0).toUpperCase() + faction.slice(1)} (Town)`;
        factionBtn.style.backgroundImage = `url('assets/${faction}.avif')`;
        
        // Remove old listener and add new specific one
        factionBtn.onclick = () => {
            this.applyThemeSelection(faction);
        };
        this.showScreen('screen-theme-select');
    },

    // Called when a button on screen-theme-select is clicked
    applyThemeSelection(themeName) {
        this.state.currentOverworldName = themeName;
        this.updateThemeButtonUI();
        
        // Switch Music immediately
        this.playBg(`assets/${themeName}.mp3`);
        
        // Go back
        this.showScreen('screen-overworld');
    },

    updateThemeButtonUI() {
        const btn = document.getElementById('btn-theme-toggle');
        const currentName = this.state.currentOverworldName;
        
        // Always "Change Theme"
        // Image matches current theme (faction or terrain)
        btn.style.backgroundImage = `url('assets/${currentName}.avif')`;
    },

    getCurrentOverworldMusic() {
        return `assets/${this.state.currentOverworldName}.mp3`;
    },

    endTurn() {
        let nextIndex = this.state.currentPlayerIndex + 1;
        let nextRound = this.state.round;
        let sfxToPlay = 'newday.mp3';
        let overlayText = "New Day";
        let image = "url('assets/newday.avif')";

        if (nextIndex >= this.state.players.length) {
            nextIndex = 0;
            nextRound++;
            
            if (nextRound % 2 === 0) {
                sfxToPlay = 'newmonth.mp3';
                overlayText = "Astrologers Proclaim!";
            } else {
                sfxToPlay = 'newweek.mp3';
                overlayText = "Resource Round<br>(Event Round)";
            }
            image = "url('assets/newtime.avif')";
        }

        this.stopBg(true);

        const ol = document.getElementById('event-overlay');
        ol.style.backgroundImage = image;
        document.getElementById('event-text').innerHTML = overlayText;
        ol.style.display = 'flex';
        this.playSfx(sfxToPlay, () => {
            document.getElementById('event-overlay').style.display = 'none';
            this.state.currentPlayerIndex = nextIndex;
            this.state.round = nextRound;
            this.startTurn(true, 0);
        });
    },

    handleResource() {
        document.getElementById('resource-popup').style.display = 'flex';
    },

    handleResourceChoice(type) {
        document.getElementById('resource-popup').style.display = 'none';

        // Pause background
        this.audio.ch1.pause();
        this.audio.ch2.pause();

        if (type === 'gold') {
            // Play specific gold sound
            this.playSfx('gold.mp3', () => this.resumeBg());
        } else {
            // Play random treasure sound (1-7)
            let introNum;
            do {
                introNum = Math.floor(Math.random() * 7) + 1;
            } while (introNum === this.state.lastTreasureIdx);
            
            this.state.lastTreasureIdx = introNum;
            this.playSfx(`treasure${introNum}.mp3`, () => this.resumeBg());
        }
    },

    handleArtifact() {
        this.audio.ch1.pause();
        this.audio.ch2.pause();
        this.playSfx('artifact.mp3', () => this.resumeBg());
    },

    startCombat() {
        this.stopBg();
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

    showCombatOverlay(text, bgImageUrl) {
        document.getElementById('combat-title').innerText = text;
        const overlay = document.getElementById('combat-event-overlay');
        overlay.style.backgroundImage = `url('${bgImageUrl}')`;
        overlay.style.display = 'flex';
        document.getElementById('combat-event-text').innerText = text;
    },

    hideCombatOverlay() {
        document.getElementById('combat-event-overlay').style.display = 'none';
    },

    returnToOverworld() {
        this.state.trackPositions = {};
        this.audio.sfx.pause();
        this.audio.sfx.onended = null;
        this.hideCombatOverlay();
        this.showScreen('screen-overworld');
        this.playBg(this.getCurrentOverworldMusic());
    },

    showRules(fromScreen) {
        this.state.previousScreen = fromScreen;
        this.state.previousMusic = this.audio.currentBgUrl;
        
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

    confirmAction(isConfirmed) {
        const action = this.state.pendingGameOver;
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
        this.state.players = [];
        this.state.currentPlayerIndex = 0;
        this.state.round = 1;
        this.state.selectedTheme = null;
        this.state.playerCount = 3;
        document.querySelectorAll('.faction-btn').forEach(btn => btn.classList.remove('disabled'));
        
        this.stopBg(true); 
        this.audio.sfx.pause();
        this.audio.sfx.currentTime = 0;
        this.audio.sfx.onended = null;
        this.audio.sfx.onerror = null;
        this.audio.currentBgUrl = null;
        this.state.trackPositions = {};

        setTimeout(() => this.init(), 100);
    },
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
        document.getElementById(id).style.display = 'flex';
        this.state.currentScreen = id;
    }
};

window.Game = Game;