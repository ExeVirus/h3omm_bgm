const Game = {
    state: {
        currentScreen: 'screen-start',
        players: [], // { id: 1, faction: 'castle' }
        currentPlayerIndex: 0,
        round: 1,
        selectedTheme: null, // 'good', 'evil', etc.
        playerCount: 3
    },

    audio: {
        bg: new Audio(),
        bgNext: new Audio(), // For crossfading
        sfx: new Audio(),
        currentBgUrl: null,
        isFading: false
    },

    // --- Audio Engine ---

    playBg(url, fade = true) {
        if (this.audio.currentBgUrl === url) return;
        
        const next = this.audio.bg.paused ? this.audio.bg : this.audio.bgNext;
        const current = next === this.audio.bg ? this.audio.bgNext : this.audio.bg;

        next.src = url;
        next.loop = true;
        next.volume = 0;
        this.audio.currentBgUrl = url;

        if (fade) {
            next.play().catch(e => console.log("Audio play failed", e));
            this.crossFade(current, next);
        } else {
            current.pause();
            next.volume = 1;
            next.play().catch(e => console.log("Audio play failed", e));
        }
    },

    crossFade(from, to) {
        let vol = 0;
        const step = 0.05;
        const interval = setInterval(() => {
            vol = Math.min(1, vol + step);
            to.volume = vol;
            from.volume = Math.max(0, 1 - vol);

            if (vol >= 1) {
                clearInterval(interval);
                from.pause();
                from.currentTime = 0;
            }
        }, 100);
    },

    stopBg() {
        // Fade out quickly then stop
        const current = !this.audio.bg.paused ? this.audio.bg : this.audio.bgNext;
        let vol = current.volume;
        const interval = setInterval(() => {
            vol = Math.max(0, vol - 0.1);
            current.volume = vol;
            if (vol <= 0) {
                clearInterval(interval);
                current.pause();
                this.audio.currentBgUrl = null;
            }
        }, 50);
    },

    playSfx(url, onComplete = null) {
        // SFX interrupts music immediately if logic dictates, 
        // but physically we just play on the SFX channel.
        // Some game logic requires stopping BG before calling this.
        this.audio.sfx.src = url;
        this.audio.sfx.loop = false;
        this.audio.sfx.volume = 1;
        this.audio.sfx.onended = onComplete;
        this.audio.sfx.play().catch(e => console.log("SFX play failed", e));
    },

    // --- Game Logic ---

    init() {
        this.playBg('main.MP3');
        this.showScreen('screen-start');
    },

    selectTheme(theme) {
        this.state.selectedTheme = theme;
        // Fade to theme music
        this.playBg(`${theme}.mp3`);
        this.showScreen('screen-players');
    },

    confirmPlayerCount(count) {
        this.state.playerCount = count;
        this.state.players = [];
        this.startFactionSelection(0);
    },

    startFactionSelection(playerIndex) {
        if (playerIndex >= this.state.playerCount) {
            // All players selected
            this.startGame();
            return;
        }
        document.getElementById('faction-player-title').innerText = `Player ${playerIndex + 1}`;
        this.showScreen('screen-factions');
        
        // Setup click handlers for factions to pass current index
        const buttons = document.querySelectorAll('.faction-btn');
        buttons.forEach(btn => {
            btn.onclick = () => {
                const faction = btn.dataset.faction;
                this.state.players.push({ id: playerIndex, faction: faction });
                this.startFactionSelection(playerIndex + 1);
            };
        });
    },

    startGame() {
        this.state.round = 1;
        this.state.currentPlayerIndex = 0;
        this.startTurn(false); // False = don't play new day sfx on very first turn
    },

    startTurn(playSfx = true) {
        const player = this.state.players[this.state.currentPlayerIndex];
        const factionMusic = this.getFactionMusic(player.faction);
        
        this.showScreen('screen-overworld');

        if (!playSfx) {
            this.playBg(factionMusic);
        } else {
            // Logic handled in endTurn transition usually, but ensures music is correct
            this.playBg(factionMusic);
        }
    },

    getFactionMusic(faction) {
        // Map faction names to exact files (handling case sensitivity from file list)
        const map = {
            'castle': 'castle.mp3',
            'rampart': 'rampart.MP3', // Note cap
            'tower': 'tower.mp3',
            'inferno': 'inferno.mp3',
            'dungeon': 'dungeon.MP3', // Note cap
            'necropolis': 'necropolis.mp3',
            'fortress': 'fortress.mp3',
            'stronghold': 'stronghold.mp3',
            'conflux': 'conflux.mp3',
            'cove': 'cove.mp3'
        };
        return map[faction];
    },

    endTurn() {
        // Determine next state
        let nextIndex = this.state.currentPlayerIndex + 1;
        let nextRound = this.state.round;
        let sfxToPlay = 'newday.mp3';

        if (nextIndex >= this.state.players.length) {
            nextIndex = 0;
            nextRound++;
            
            if (nextRound % 2 === 0) {
                sfxToPlay = 'newweek.mp3';
            } else {
                sfxToPlay = 'newmonth.mp3';
            }
        }

        // Stop BG, Play SFX, Then Start Next BG
        this.stopBg();
        this.playSfx(sfxToPlay, () => {
            this.state.currentPlayerIndex = nextIndex;
            this.state.round = nextRound;
            this.startTurn(true); // Will fade in new music
        });
    },

    handleResource() {
        this.audio.bg.pause();
        this.audio.bgNext.pause();
        this.playSfx('chest.mp3', () => {
             // Resume BG
             const current = this.audio.currentBgUrl ? (this.audio.bg.src.includes(this.audio.currentBgUrl) ? this.audio.bg : this.audio.bgNext) : null;
             if(current) current.play();
        });
    },

    handleArtifact() {
        this.audio.bg.pause();
        this.audio.bgNext.pause();
        this.playSfx('treasure.mp3', () => {
             // Resume BG
             const current = this.audio.currentBgUrl ? (this.audio.bg.src.includes(this.audio.currentBgUrl) ? this.audio.bg : this.audio.bgNext) : null;
             if(current) current.play();
        });
    },

    startCombat() {
        // 1. Stop Faction Music
        this.stopBg();
        
        // 2. Pick Random Battle Intro (1-8)
        const introNum = Math.floor(Math.random() * 8) + 1;
        const introFile = `battle${introNum}.mp3`;

        // 3. Pick Random Combat Loop (1-4)
        const combatNum = Math.floor(Math.random() * 4) + 1;
        // Handle MP3 case sensitivity in file list
        // combat1-4.MP3
        const combatFile = `combat${combatNum}.MP3`;

        this.showScreen('screen-combat');

        this.playSfx(introFile, () => {
            this.playBg(combatFile, false); // No fade, hard start
        });
    },

    combatVictory() {
        this.stopBg();
        // Play win_battle.mp3 (mapped to Victory) then experience.mp3
        this.playSfx('win_battle.mp3', () => {
            this.playSfx('experience.mp3', () => {
                this.returnToOverworld();
            });
        });
    },

    combatRetreat() {
        this.stopBg();
        this.playSfx('retreat.mp3', () => {
            this.returnToOverworld();
        });
    },

    combatLose() {
        this.stopBg();
        this.playSfx('lose.mp3', () => {
            this.returnToOverworld();
        });
    },

    returnToOverworld() {
        this.startTurn(true); // Resumes/Fades in faction music
    },

    showRules(fromScreen) {
        this.state.previousScreen = fromScreen;
        this.state.previousMusic = this.audio.currentBgUrl;
        
        // Pick random AI track
        const aiNum = Math.floor(Math.random() * 3) + 1;
        // File list: ai1.mp3, ai2.MP3, ai3.MP3
        let aiFile = `ai${aiNum}.mp3`;
        if (aiNum > 1) aiFile = `ai${aiNum}.MP3`;

        this.playBg(aiFile);
        this.showScreen('screen-rules');
    },

    exitRules() {
        this.showScreen(this.state.previousScreen);
        if (this.state.previousMusic) {
            this.playBg(this.state.previousMusic);
        }
    },

    winGame() {
        this.stopBg();
        // Play win_game.mp3 on loop
        this.audio.bg.src = 'win_game.mp3';
        this.audio.bg.loop = true;
        this.audio.bg.volume = 1;
        this.audio.bg.play();
        this.audio.currentBgUrl = 'win_game.mp3';

        // Update Win Icon
        const winBtn = document.getElementById('win-theme-btn');
        // prompt says show the theme selected at start (good/evil/etc)
        winBtn.style.backgroundImage = `url('${this.state.selectedTheme}.avif')`;

        this.showScreen('screen-win');
    },

    resetGame() {
        location.reload(); // Simplest way to reset everything cleanly
    },

    // --- DOM Helper ---
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
        document.getElementById(id).style.display = 'flex';
        this.state.currentScreen = id;
    }
};

// Initial Setup attached to window for HTML access
window.Game = Game;