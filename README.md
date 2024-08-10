# Cookie Clicker TAS [![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)
A tool assisted speedrun of the game [Cookie Clicker](https://orteil.dashnet.org/cookieclicker/) getting all 622/622+17 achievements.
I wrote a basic TASing framework that can hook into the date/time and RNG, and perform actions far faster and more precisely than a human, and used that to 100% the game.
It can also natively record video/audio of in-game footage, remove lag frames

It takes 10m 56.13s to beat the game real time (though longer on most PCs due to lag), and about five centuries in-game time.
I allowed date/time manip since there is an achievement for playing the game for a year, so a speedrun without would take exactly a year, which is boring.

But allowing it opened the way for all sorts of new tricks:
* There is lag compensation code that tries to correct if the game is running too slow. If you manip the time to make this always be the case, you can get 5 extra seconds per frame.
* This makes the game run at effectively 152x speed!
* It can also be used to make sugar lump growth and minigame ticks basically instant


## Installation
Install Tampermonkey/Greasemonkey plugin
Install CookieClicker.js as a user script
Refresh the page, and wipe your save to begin

Resizing the browser is needed for some achievements, most browsers don't like this so you might have to open the game as a popup with:
```
window.open("https://orteil.dashnet.org/cookieclicker/","","popup=true");
```

Recording is done by setting the TASBot.record flag for video, and TASBot.recordSound for audio.
Video is done by downloading a png for every frame, which you can stitch together into video with e.g. ffmpeg
Audio is saved internally and can be played back by running 
```
Game.mods.TASBot.replaySound()
```

## Route
The all achievements route I made is pretty basic, and there are definitely plenty of improvements someone could make


### <1s - Start
We go for the True Neverclick achievement first, so no clicking until 1 million cookies
While we wait for a reindeer, we get misc achievements in the first second e.g. 'Here you go', 'God complex', 'Olden days'
### 1-3s - First reindeer
Instead of golden cookies like regular speedruns do, we change the time to christmas and get a reindeer
Since they give double the cookies and spawn twice as fast
Remember the game is running at 152x speed from the time manip, so a reindeer takes a second to spawn instead of 3 minutes
### 3-8s - Frenzy+reindeer
Fastest way to get cookies now is golden cookie frenzy + reindeer, done with rng manip
We buy buildings, but not upgrades since we're doing the Hardcore achievement too
### Frame 222-225 - Cookie Storm
With >100,000 cookies baked now, golden cookies can now be a Cookie Storm
With the many fingers of our TASBot, it can click every single one, easily getting to a billion cookies
### Frame 226-227 - Grimoire
With >1,000,000,000 cookies, we can get sugar lumps
RNG and date/time manip means instant caramelized sugar lumps, allowing for infinite mana in the grimoire, so unlimited Force the Hand of Fate (FtHoF) golden cookies
This gets us to our first trillion
### 8s-30s - Endless Cycle
Now we can ascend, after each ascension we spam golden sugar lumps to exponentially get enough to ascend again.
Repeating this 1,000 times for the Endless Cycle achievement
The 998th ascension we buy/sell to ascend on exactly a trillion for the achievement
### Frames 1000-1004 - To Infinity...
For our last ascension, we buy Krumblor, upgrade enough to get Dragon's Fortune, which more than doubles our CpS for each golden cookie on screen
With our infinite caramelized mana FtHoF we cast ~750 GCs overloading the floating point cookie count, giving us literally Infinity cookies
### Frames 1005-1018 - Most of the game
We ascend for the final time, and buy every heavenly upgrade
We repeat the Infinity trick, and use it to buy a ton of every building, every upgrade etc.
This gives most of the achievements in the whole game.
We also get misc achievements e.g. 'Debt evasion', 'Uncanny Clicker'
### Frames 1018-1021 - Gardening
Despite taking up 300 lines of code, the entire garden minigame and it's associated achievements are done in four frames.
With date/time manip the garden ticks 152x per frame, and with rng manip mutations are guaranteed.
Afterwards, we plant optimal pattern of clay-boosted Nursetulip/Chimerose to boost reindeer spawn
### 30s-1m30s - Reindeer Sleigher
The next minute is taken up by popping reindeer
Even with the upgrades, Diamond-slotted Selebrak, and the garden boosting, it still takes a minute for the 200 reindeer achievement
While we're waiting, the Grandmapocalpyse has begun, and we get all the associated achievements
### 1m30 ...and beyond
We have to get rid of our infinity cookies for something later, so we buy a building that costs Infinity, giving us NaN cookies
The game's failsafe kicks in, and puts us back down to zero cookies. We have transcended infinity
It still shows Infinity though, because it's bugged
After christmas is done, we get the halloween, valentines and easter unlocks, and just before we get rid of our Infinity, we invest it all in the stock market
Also a few misc achievements, like 'O Fortuna' and 'Just plain lucky'
### 1m30-~11m - DO ASS
Now the hardest achievement - clicking 27,777 naturally occuring golden cookies (FtHoF doesn't count)
To do this we use a variant of a trick the community refers to as 'DO ASS CLGCF' (yes really)
We use the Dragon Orb aura and a lot of rng manip to set up a perpetual cookie chain, spawning a natural GC every 3s (0.02s with our time accel!)
This is why we needed to remove our cookies, Infinity cookies breaks the chain instantly
Meanwhile, our insider trading (RNG manip) makes us millionaires and we get the final stock market achievement
### 10m56.13s - The End
With all the cookies clicked, all that's left is the final achievement: 'Cheated cookies taste awful'
We don't have to actually cheat to get it, just opening the cheat menu is enough.
There is no need to use it, the game is already complete
