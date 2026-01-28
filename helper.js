const Game = {
    state: {
        currentScreen: 'screen-start',
        players: [], 
        currentPlayerIndex: 0,
        round: 1,
        selectedTheme: null,
        playerCount: 3,
        lastBattleIdx: -1, 
        lastCombatIdx: -1
    },

    audio: {
        // Two music channels for crossfading
        ch1: new Audio(),
        ch2: new Audio(),
        activeChannel: 'ch1', // Tracks which is the 'intended' main track
        
        // SFX channel
        sfx: new Audio(),
        
        // State
        currentBgUrl: null,
        fadeInterval: null // SINGLE interval to manage all fades
    },

    // --- ROBUST AUDIO ENGINE ---

    playBg(url, fade = true) {
        const fullUrl = url.includes('/') ? url : `assets/${url}`;
        
        // If already playing this URL, do nothing
        if (this.audio.currentBgUrl === fullUrl) return;

        // 1. KILL any running fade immediately
        if (this.audio.fadeInterval) {
            clearInterval(this.audio.fadeInterval);
            this.audio.fadeInterval = null;
        }

        // 2. Identify Incoming vs Outgoing
        const outgoing = this.audio[this.audio.activeChannel];
        const nextChannelName = (this.audio.activeChannel === 'ch1') ? 'ch2' : 'ch1';
        const incoming = this.audio[nextChannelName];

        // 3. Setup Incoming
        incoming.src = fullUrl;
        incoming.loop = true;
        incoming.volume = 0; // Start silent
        this.audio.currentBgUrl = fullUrl;
        this.audio.activeChannel = nextChannelName;

        const playPromise = incoming.play();
        if (playPromise) playPromise.catch(e => console.error("Audio Play Err:", e));

        if (!fade) {
            // Hard cut
            incoming.volume = 1;
            outgoing.pause();
            outgoing.volume = 0;
            outgoing.currentTime = 0;
        } else {
            // 4. Start ONE Master Fade Interval
            this.audio.fadeInterval = setInterval(() => {
                const step = 0.05; // Fade speed
                let isDone = true;

                // Fade In Incoming
                if (incoming.volume < 1) {
                    incoming.volume = Math.min(1, incoming.volume + step);
                    isDone = false;
                }

                // Fade Out Outgoing (from whatever volume it currently is)
                if (outgoing.volume > 0) {
                    outgoing.volume = Math.max(0, outgoing.volume - step);
                    isDone = false;
                }

                // Cleanup when both targets reached
                if (isDone) {
                    clearInterval(this.audio.fadeInterval);
                    this.audio.fadeInterval = null;
                    outgoing.pause();
                    outgoing.currentTime = 0;
                }
            }, 50); // 20 ticks per second
        }
    },

    stopBg() {
        // 1. KILL any running fade immediately
        if (this.audio.fadeInterval) {
            clearInterval(this.audio.fadeInterval);
            this.audio.fadeInterval = null;
        }

        this.audio.currentBgUrl = null;
        const c1 = this.audio.ch1;
        const c2 = this.audio.ch2;

        // Fade out WHOEVER is playing
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
        // Just ensures the active channel is playing at full volume
        // Useful after SFX interruptions if logic requires it
        const active = this.audio[this.audio.activeChannel];
        if (this.audio.currentBgUrl && active.paused) {
            active.volume = 1;
            active.play().catch(e => console.log("Resume err", e));
        }
    },

    playSfx(filename, onComplete = null) {
        this.audio.sfx.src = `assets/${filename}`;
        this.audio.sfx.loop = false;
        this.audio.sfx.volume = 1;
        
        const done = () => {
            this.audio.sfx.removeEventListener('ended', done);
            this.audio.sfx.removeEventListener('error', done);
            if(onComplete) onComplete();
        };

        this.audio.sfx.addEventListener('ended', done);
        this.audio.sfx.addEventListener('error', (e) => {
            console.error(`SFX Error (${filename}):`, e);
            done(); 
        });

        this.audio.sfx.play().catch(e => {
            console.error(`SFX Play Blocked (${filename}):`, e);
            done();
        });
    },

    // --- GAME LOGIC ---

    init() {
        document.getElementById('click-overlay').style.display = 'none';
        this.playBg('assets/main.MP3');
        this.showScreen('screen-start');
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

    showPreGame() {
        this.showScreen('screen-pregame');
    },

    startGame() {
        this.state.round = 1;
        this.state.currentPlayerIndex = 0;
        this.startTurn(false); 
    },

    startTurn(isTransition = true, musicDelay = 0) {
        const player = this.state.players[this.state.currentPlayerIndex];
        const factionMusic = this.getFactionMusic(player.faction);
        
        document.getElementById('overworld-title').innerText = `Player ${this.state.currentPlayerIndex + 1}'s Turn`;

        this.showScreen('screen-overworld');
        
        if (!isTransition) {
            this.playBg(factionMusic);
        } else {
            if (musicDelay > 0) {
                setTimeout(() => {
                     // Check context: ensures we didn't leave overworld in that 1 second
                     if(this.state.currentScreen === 'screen-overworld') {
                         this.playBg(factionMusic);
                     }
                }, musicDelay);
            } else {
                this.playBg(factionMusic);
            }
        }
    },

    getFactionMusic(faction) {
        const map = {
            'castle': 'assets/castle.mp3',
            'rampart': 'assets/rampart.MP3',
            'tower': 'assets/tower.mp3',
            'inferno': 'assets/inferno.mp3',
            'dungeon': 'assets/dungeon.MP3',
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
        let isSpecialEvent = false;
        let sfxToPlay = 'newday.mp3';
        let overlayText = null;

        if (nextIndex >= this.state.players.length) {
            nextIndex = 0;
            nextRound++;
            isSpecialEvent = true;
            
            if (nextRound % 2 === 0) {
                sfxToPlay = 'newweek.mp3';
                overlayText = "Resource Round";
            } else {
                sfxToPlay = 'newmonth.mp3';
                overlayText = "Astrologers Proclaim!";
            }
        }

        this.stopBg();

        if (isSpecialEvent) {
            // BLOCKING Logic for Week/Month
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
            // PARALLEL Logic for New Day
            this.playSfx(sfxToPlay);
            this.state.currentPlayerIndex = nextIndex;
            this.state.round = nextRound;
            // Delay music start by 1s
            this.startTurn(true, 1000); 
        }
    },

    handleResource() {
        // Pause music hard
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
        document.getElementById('combat-title').innerText = `Player ${this.state.currentPlayerIndex + 1}'s Combat`;

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
        const combatFile = `assets/combat${combatNum}.MP3`;

        this.showScreen('screen-combat');

        this.playSfx(introFile, () => {
            this.playBg(combatFile, false); 
        });
    },

    combatVictory() {
        this.stopBg();
        this.playSfx('win_battle.mp3', () => {
            this.playSfx('experience.mp3', () => this.returnToOverworld());
        });
    },

    combatRetreat() {
        this.stopBg();
        this.playSfx('retreat.mp3', () => this.returnToOverworld());
    },

    combatLose() {
        this.stopBg();
        this.playSfx('lose.mp3', () => this.returnToOverworld());
    },

    returnToOverworld() {
        this.startTurn(true); 
    },

    showRules(fromScreen) {
        this.state.previousScreen = fromScreen;
        // Don't fade when going to rules, just switch
        this.state.previousMusic = this.audio.currentBgUrl;
        
        const aiNum = Math.floor(Math.random() * 3) + 1;
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
        // Stop Everything hard
        if (this.audio.fadeInterval) clearInterval(this.audio.fadeInterval);
        this.audio.ch1.pause();
        this.audio.ch2.pause();
        this.audio.ch1.volume = 0; 
        this.audio.ch2.volume = 0;
        
        // Setup Win Loop on active channel
        const active = this.audio.ch1; 
        this.audio.activeChannel = 'ch1';
        
        active.src = 'assets/win_game.mp3';
        active.loop = true;
        active.volume = 1;
        active.play().catch(e => console.log("Win play err", e));
        this.audio.currentBgUrl = 'assets/win_game.mp3';

        const winBtn = document.getElementById('win-theme-btn');
        winBtn.style.backgroundImage = `url('assets/${this.state.selectedTheme}.avif')`;

        this.showScreen('screen-win');
    },

    resetGame() {
        this.state.players = [];
        this.state.currentPlayerIndex = 0;
        this.state.round = 1;
        this.state.selectedTheme = null;
        this.state.playerCount = 3;
        
        this.stopBg();
        setTimeout(() => this.init(), 100);
    },

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
        document.getElementById(id).style.display = 'flex';
        this.state.currentScreen = id;
    }
};

window.Game = Game;