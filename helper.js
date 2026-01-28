const Game = {
    state: {
        currentScreen: 'screen-start',
        players: [], 
        currentPlayerIndex: 0,
        round: 1,
        selectedTheme: null,
        playerCount: 3
    },

    audio: {
        bg: new Audio(),
        bgNext: new Audio(),
        sfx: new Audio(),
        currentBgUrl: null,
        isFading: false
    },

    // --- Audio Engine ---

    playBg(url, fade = true) {
        // Ensure path correctness if passed without folder
        const fullUrl = url.includes('/') ? url : `assets/${url}`;

        if (this.audio.currentBgUrl === fullUrl) return;
        
        const next = this.audio.bg.paused ? this.audio.bg : this.audio.bgNext;
        const current = next === this.audio.bg ? this.audio.bgNext : this.audio.bg;

        next.src = fullUrl;
        next.loop = true;
        next.volume = 0;
        this.audio.currentBgUrl = fullUrl;

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

    playSfx(filename, onComplete = null) {
        this.audio.sfx.src = `assets/${filename}`;
        this.audio.sfx.loop = false;
        this.audio.sfx.volume = 1;
        this.audio.sfx.onended = onComplete;
        this.audio.sfx.play().catch(e => console.log("SFX play failed", e));
    },

    // --- Game Logic ---

    init() {
        this.playBg('assets/main.MP3'); // Note: main.MP3 in your list
        this.showScreen('screen-start');
    },

    selectTheme(theme) {
        this.state.selectedTheme = theme;
        // Theme files are lowercase .mp3 in list
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
            this.startGame();
            return;
        }
        document.getElementById('faction-player-title').innerText = `Player ${playerIndex + 1}`;
        this.showScreen('screen-factions');
        
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
        this.startTurn(false); 
    },

    startTurn(playSfx = true) {
        const player = this.state.players[this.state.currentPlayerIndex];
        const factionMusic = this.getFactionMusic(player.faction);
        
        this.showScreen('screen-overworld');

        if (!playSfx) {
            this.playBg(factionMusic);
        } else {
            this.playBg(factionMusic);
        }
    },

    getFactionMusic(faction) {
        // Specific mapping based on your file list
        const map = {
            'castle': 'assets/castle.mp3',
            'rampart': 'assets/rampart.MP3', // Uppercase
            'tower': 'assets/tower.mp3',
            'inferno': 'assets/inferno.mp3',
            'dungeon': 'assets/dungeon.MP3', // Uppercase
            'necropolis': 'assets/necropolis.mp3',
            'fortress': 'assets/fortress.mp3',
            'stronghold': 'assets/stronghold.mp3',
            'conflux': 'assets/conflux.mp3',
            'cove': 'assets/cove.mp3'
        };
        return map[faction];
    },

    endTurn() {
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

        this.stopBg();
        this.playSfx(sfxToPlay, () => {
            this.state.currentPlayerIndex = nextIndex;
            this.state.round = nextRound;
            this.startTurn(true); 
        });
    },

    handleResource() {
        this.audio.bg.pause();
        this.audio.bgNext.pause();
        this.playSfx('chest.mp3', () => {
             const current = this.audio.currentBgUrl ? (this.audio.bg.src.includes(this.audio.currentBgUrl) ? this.audio.bg : this.audio.bgNext) : null;
             if(current) current.play();
        });
    },

    handleArtifact() {
        this.audio.bg.pause();
        this.audio.bgNext.pause();
        this.playSfx('treasure.mp3', () => {
             const current = this.audio.currentBgUrl ? (this.audio.bg.src.includes(this.audio.currentBgUrl) ? this.audio.bg : this.audio.bgNext) : null;
             if(current) current.play();
        });
    },

    startCombat() {
        this.stopBg();
        
        // Random Battle Intro (1-8), all lowercase .mp3
        const introNum = Math.floor(Math.random() * 8) + 1;
        const introFile = `battle${introNum}.mp3`;

        // Random Combat Loop (1-4), all Uppercase .MP3
        const combatNum = Math.floor(Math.random() * 4) + 1;
        const combatFile = `assets/combat${combatNum}.MP3`;

        this.showScreen('screen-combat');

        this.playSfx(introFile, () => {
            this.playBg(combatFile, false); 
        });
    },

    combatVictory() {
        this.stopBg();
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
        this.startTurn(true); 
    },

    showRules(fromScreen) {
        this.state.previousScreen = fromScreen;
        this.state.previousMusic = this.audio.currentBgUrl;
        
        const aiNum = Math.floor(Math.random() * 3) + 1;
        // Logic for Mixed Case AI files: ai1.mp3, ai2.MP3, ai3.MP3
        let aiFile = `assets/ai${aiNum}.mp3`;
        if (aiNum > 1) aiFile = `assets/ai${aiNum}.MP3`;

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
        // win_game.mp3
        this.audio.bg.src = 'assets/win_game.mp3';
        this.audio.bg.loop = true;
        this.audio.bg.volume = 1;
        this.audio.bg.play();
        this.audio.currentBgUrl = 'assets/win_game.mp3';

        const winBtn = document.getElementById('win-theme-btn');
        winBtn.style.backgroundImage = `url('assets/${this.state.selectedTheme}.avif')`;

        this.showScreen('screen-win');
    },

    resetGame() {
        location.reload(); 
    },

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
        document.getElementById(id).style.display = 'flex';
        this.state.currentScreen = id;
    }
};

window.Game = Game;