I am taking this demo pwa app and using it as a framework to build a mini PWA app solution. 

# Directory Structure
```
assets/
  ai1.mp3
  ai2.MP3
  ai3.MP3
  artifact.avif
  battle1.mp3
  battle2.mp3
  battle3.mp3
  battle4.mp3
  battle5.mp3
  battle6.mp3
  battle7.mp3
  battle8.mp3
  castle.avif
  castle.mp3
  chest.mp3
  combat1.MP3
  combat2.MP3
  combat3.MP3
  combat4.MP3
  conflux.avif
  conflux.mp3
  cove.avif
  cove.mp3
  dungeon.avif
  dungeon.MP3
  end_turn.avif
  evil.avif
  evil.mp3
  experience.mp3
  fortress.avif
  fortress.mp3
  good.avif
  good.mp3
  inferno.avif
  inferno.mp3
  lose.avif
  lose.mp3
  main.MP3
  necropolis.avif
  necropolis.mp3
  neutral.avif
  neutral.mp3
  newday.mp3
  newmonth.mp3
  newweek.mp3
  rampart.avif
  rampart.MP3
  resource.avif
  retreat.avif
  retreat.mp3
  rules.avif
  secret.avif
  secret.mp3
  start.avif
  stronghold.avif
  stronghold.mp3
  tower.avif
  tower.mp3
  treasure.mp3
  victory.avif
  win_battle.mp3
  win_game.mp3
192.png
512.png
helper.js
index.html
LICENSE
manifest.json
Plan.md
sw.js
```

# Files

## File: helper.js
```javascript
const pwaHelper = {
  async exportFile(filename, content, mimeType) {
    const file = new File([content], filename, { type: mimeType });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] });
    } else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
      a.download = filename;
      a.click();
    }
  },

  async startCamera(videoElementId) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = document.getElementById(videoElementId);
    video.srcObject = stream;
    video.style.display = 'block';
  },

  async startGyro(callback) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      await DeviceOrientationEvent.requestPermission();
    }
    window.addEventListener('deviceorientation', (e) => {
      callback({ alpha: e.alpha.toFixed(2), beta: e.beta.toFixed(2), gamma: e.gamma.toFixed(2) });
    });
  }
};
```

## File: index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PWA Demo</title>
  <link rel="manifest" href="manifest.json">
  <script type="module" src="https://cdn.jsdelivr.net/npm/@pwabuilder/pwaupdate"></script>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@pwabuilder/pwainstall"></script>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 20px; }
    button { margin: 10px; padding: 10px 20px; border-radius: 8px; border: 1px solid #ccc; }
    #video { width: 100%; max-width: 400px; display: none; }
  </style>
</head>
<body>
  <h1>Hello PWA</h1>
  
  <pwa-install></pwa-install>
  <pwa-update swpath="sw.js"></pwa-update>

  <div>
    <button onclick="pwaHelper.exportFile('test.json', JSON.stringify({hello: 'world'}), 'application/json')">Export JSON</button>
    <button onclick="pwaHelper.startCamera('video')">Start Camera</button>
    <button onclick="pwaHelper.startGyro(v => document.getElementById('out').innerText = JSON.stringify(v))">Start Gyro</button>
  </div>

  <video id="video" autoplay playsinline></video>
  <pre id="out"></pre>

  <script src="helper.js"></script>
</body>
</html>
```

## File: LICENSE
```
MIT License

Copyright (c) 2026 ExeVirus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## File: manifest.json
```json
{
  "name": "PWA Demo",
  "short_name": "PWA Demo",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

## File: Plan.md
```markdown
# Setup
1. Main Menu while opening the box, loop until booklet/mission is selected for campaign
2. Select from either Good, Evil, Neutral, or Secret Theme, continue setup
3. Input the chosen factions, in player order
4. Start the game, playing first faction music

# While in play
### Battle
1. Play one of 7 battle starters, and then play battle music thereafter
2. Choose from win, lose, retreat, surrender, castle defend (and rules)
    1. Play the <victory>, then <experience> sound for win
    2. For lose <lose>
    3. 

### Get Resource
1. Play <Chest> sound

### Get artifact
1. Play <TREASURE> sound

### End turn
1. Transistion to next player's town sound as main, play <new day> first
2. If start of new round. If resource round, play <New Week>, otherwise <New Month> for astrologers

### Consulting the rules (any time)
1. AI Theme 1,2,3

### Win/End game
1. <Win Scenario>

# Icons:
1. ✅ All Factions
2. ✅ Good, ✅ Evil, ✅ Neutral, ✅ Secret
3. ✅ Start Battle
4. ✅ Win battle, ✅ Lose Battle, ✅ Retreat
5. ✅ Rules
6. ✅ Resource Icon
7. ✅ Artifact Icon
8. ✅ End Turn
```

## File: sw.js
```javascript
const CACHE_NAME = 'pwa-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './helper.js',
    './192.png',
    './512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
```


I have already gotten most of the assets ready, this will be a button based mobile focused app. The start screen will show four buttons, 2x2, centered. I think all buttons will be rounded squares. 

The start up will start playing the main.mp3 music in the background, and the four buttons will be the good.avif, neutral.avif, evil.avif, and secret.avif. 

When the user presses any of these four, they are taken to a screen to select the number of players, which will be limited to 1->8, default 3. Provide a simple confirmation button (same size as the others), below the numebr select, using the checkmark emoji to confirm. Start playing the music from the selection they chose from the last four, replacing main.mp3 and doing so with a fade. Any music I mention is looped, if I call it a sound, it's played once.

Next screens will ask for which faction they are playing as, one for each player. The top will read player 1, player 2, etc. and the buttons on this screen will be 10:

castle, rampart, tower, inferno, dungeon, necropolis, fortress, stronghold, conflux, and cove

Sort them in 4 rows, in that order, with a row of 3, row of 3, row of 2, and row of 2.

Remember their selection, as this will matter later. can just be a string tied to player.

After the final player has a faction selected, go to the next screen and switch from the good,evil,neutralm,secret theme to the first player's faction music.

On this screen, which I call the overworld screen, provide 6 buttons: start.avif, resource.avif, artifact.avif, end_turn.avif, rules.avif, and win_game.avif.

When pressing resource, jsut play the chest.mp3 sound

When pressing artifact, just play the treasure.mp3 sound

When pressing end turn, we will go to the next players turn, wrapping around at the end, track which round we are on. The game starts at roudd 1, and goes to round two after each players turn. even number rounds play the newweek.mp3, and odd rounds except the first play newmonth. During playing newweek or newmonth once, stop the faction music that was playing, same for ending a single player's turn but isn't the last player of the round, for those turns play the newday.mp3 sound instead.

when pressing the rules, switch to the rules screen, which has one large rules button there, and play one of the ai1,2,3 (randomly selected) mp3s on loop. On this screen when they press the button again, return to the last screen and start playing the last music. Always fade music in and out. Ideally overlapping musics, but not when playing sounds that interrupt the music - for those stop the music entirely. For example, do this for the newday,newweek,and newmonth use cases.

When pressing win_game, play the win_game.mp3, and go to the win screen which shows the good/evil/nuetral/secret avif that was selected with the booklet from teh main page at the start as a large central button. While on this screen, win_game will loop. When they click the button, go back to the start screen and fade back to playing main.mp3 on loop.

When pressing the start.avif button, this takes you to the combat screen, and first interrupts the faction music to play randomly selected one of battle1,2,3,4,5,6,7,8. After that battle intro music plays, transition right into one of combat1,2,3,4 on loop, randomly selected for that entire combat. 

On the cmobat screen there are 4 buttons: victory.avif, retreat.avif, lose.avif, and the rules.avif from before (which works similarly, jsut returns back to this combat screen and music instead of the faction).

Victory will result in stoping the music to play victory.mp3 once and then experience.mp3 once, and then take us back to the overworld screen, and go back to playing the faction music for that player. 

Retreat is the same, but only plays the retreat.mp3
Lose is the same, but only plays the lose.mp3

Do this on one single page app, making the buttons have a shadow and press effect, keep the css, html, and js simple and easy to read, with only a few comments/headers. Add all the assets to the manifest as well and any other housekeeping required. Remove any functionality from the original demo app that isn't for support of the core pwa experience. note I want everything to work offline, but still update when I push a new release.