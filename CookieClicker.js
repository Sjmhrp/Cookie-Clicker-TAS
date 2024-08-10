// ==UserScript==
// @name         Cookie Clicker TASBot
// @namespace
// @version      1.0
// @description  Gets all achievements in Cookie Clicker V2.052
// @author       Sjmhrp
// @match        *://orteil.dashnet.org/cookieclicker/*
// @match        *://orteil.dashnet.org/cookieclicker/
// @grant        none
// ==/UserScript==


// Start cookie clicker as a pop-up with window.open("https://orteil.dashnet.org/cookieclicker/","","popup=true");
// Since browsers don't like messing with the size of regular tabs
// Run command from an open tab not a new tab (and not this tab) because firefox is weird
// Check resize works with window.resizeTo(100,100);

var TASBot = {
    name: "TASBot",
    version: "1.0",
    active: false,
    time: 30974400000, // First christmas after Epoch, 1970-12-25
    speed: 6000, // ms between frames, above 5000 causes game to run at 152x speed!
    seed: 0,
    T: 0,
    subT: 0,
    randT: 0,
    click: 0,
    christmas: 0,
    record: 0,
    recordSound: 0,
};


if(TASBot.recordSound) {
    TASBot.sounds=[];

    TASBot.replaySounds = function() {
        var start = TASBot.oldDate.now();
        for(let i = 0; i < TASBot.sounds.length; i++) {
            setTimeout(()=>PlaySound(TASBot.sounds[i][1],TASBot.sounds[i][2],TASBot.sounds[i][3]),TASBot.sounds[i][0]*1000/Game.fps+10000);
        }
        console.log("Done");
    }

    PlaySound=function(url,vol,pitchVar) {
        if(TASBot.active&&!Game.HasAchiev("Cheated cookies taste awful"))TASBot.sounds.push([TASBot.T,url,vol,pitchVar]);
        //url : the url of the sound to play (will be cached so it only loads once)
        //vol : volume between 0 and 1 (multiplied by game volume setting); defaults to 1 (full volume)
        //(DISABLED) pitchVar : pitch variance in browsers that support it (Firefox only at the moment); defaults to 0.05 (which means pitch can be up to -5% or +5% anytime the sound plays)
        var volume=1;
        var volumeSetting=Game.volume;
        if (typeof vol!=='undefined') volume=vol;
        if (volume<-5) {volume+=10;volumeSetting=Game.volumeMusic;}
        if (!volumeSetting || volume==0) return 0;
        if (typeof Sounds[url]==='undefined')
        {
            //sound isn't loaded, cache it
            Sounds[url]=new Audio(url.indexOf('snd/')==0?(Game.resPath+url):url);
            Sounds[url].onloadeddata=function(e){PlaySound(url,vol,pitchVar);}
            //Sounds[url].load();
        }
        else if (Sounds[url].readyState>=2 && SoundInsts[SoundI].paused)
        {
            var sound=SoundInsts[SoundI];
            SoundI++;
            if (SoundI>=12) SoundI=0;
            sound.src=Sounds[url].src;
            //sound.currentTime=0;
            sound.volume=Math.pow(volume*volumeSetting/100,2);
            if (pitchSupport)
            {
                var pitchVar=(typeof pitchVar==='undefined')?0.05:pitchVar;
                var rate=1+(Math.random()*2-1)*pitchVar;
                sound.preservesPitch=false;
                sound.mozPreservesPitch=false;
                sound.webkitPreservesPitch=false;
                sound.playbackRate=rate;
            }
            try{sound.play();}catch(e){}
            /*
		var sound=Sounds[url].cloneNode();
		sound.volume=Math.pow(volume*volumeSetting/100,2);
		sound.onended=function(e){if (e.target){delete e.target;}};
		sound.play();*/
        }
    }
}

TASBot.screenshot=async function(index) {
    const video = document.createElement("video");
    video.srcObject = TASBot.captureStream;
    await video.play();
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const image = canvas.toDataURL();
    var link = document.createElement('a');
    link.href = image;
    link.download = index+'.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

TASBot.startRecord=async function() {
    if(TASBot.video)return;
    try {
            navigator.mediaDevices.getDisplayMedia().then(captureStream=>{
                TASBot.captureStream=captureStream;
                //captureStream.getTracks().forEach(track => track.stop());
            });
        } catch (err) {
            console.error("Error: " + err);
        }
}
if(TASBot.record) {
    document.onkeyup = function () {
        var e = e || window.event;
        if(e.altKey && e.which == 65) {
            TASBot.startRecord();
            return false;
        }
    }
}

TASBot.oldDate = Date;
Date = class extends TASBot.oldDate {
    constructor(year,month,day) {
        if(year) {
            super(year,month,day);
        } else {
            super(TASBot.time);
        }
    }
}
Date.now=function() {return TASBot.time};

Function.prototype.clone = function() {
    var that = this;
    var temp = function temporary() { return that.apply(this, arguments); };
    for(var key in this) {
        if (this.hasOwnProperty(key)) {
            temp[key] = this[key];
        }
    }
    return temp;
};

TASBot.oldSeedRandom = Math.seedrandom.clone();
Math.seedrandom = function(seed) {
    TASBot.oldSeedRandom(seed?seed:TASBot.seed);
};

TASBot.oldRandom = Math.random.clone();
TASBot.choose = choose.clone();

TASBot.forceRandom = function(val) {
    if(val<0||val>1)throw "Invalid RNG Value";
    Math.random=function() {
        return val;
    }
    Math.seedrandom=function(){}
}

TASBot.forceChoose = function(choice) {
    TASBot.choice=choice;
    choose=function(arr) {
        return arr[Math.max(0,Math.min(arr.length-1,TASBot.choice))];
    }
}

TASBot.restoreRandom = function() {
    Math.random=TASBot.oldRandom.clone();
    Math.seedrandom = function(seed) {
        TASBot.oldSeedRandom(seed?seed:TASBot.seed);
    };
}

TASBot.restoreChoose = function() {
    choose=TASBot.choose.clone();
}

TASBot.forceClickOverride = function() {
    Element.prototype.getBounds=function(){
	var bounds=this.getBoundingClientRect();
	var s=Game.scale;
	bounds.x/=s;
	bounds.y/=s;
	bounds.width/=s;
	bounds.height/=s;
	bounds.top/=s;
	bounds.bottom/=s;
	bounds.left/=s;
	bounds.right/=s;
    Game.Click=TASBot.click;
	return bounds;
    };
}

TASBot.restoreClickOverride = function() {
    Element.prototype.getBounds=function(){
	var bounds=this.getBoundingClientRect();
	var s=Game.scale;
	bounds.x/=s;
	bounds.y/=s;
	bounds.width/=s;
	bounds.height/=s;
	bounds.top/=s;
	bounds.bottom/=s;
	bounds.left/=s;
	bounds.right/=s;
	return bounds;
    };
}

TASBot.pause = function() {
    var id = window.setTimeout(function() {}, 0);
    while(id--)window.clearTimeout(id);
}

TASBot.resume = function() {
    Game.Loop();
}

TASBot.step = function() {
    TASBot.resume();
    TASBot.pause();
}

TASBot.begin = function(hard) {
    if(hard) {
        window.resizeTo(1366,768);
        window.moveTo(0,0);
        window.moveBy(-1100,0);
        RemoveEvent([document,'mousemove',Game.GetMouseCoords]);
        Game.time=TASBot.time;
        TASBot.active=true;
        Game.accumulatedDelay=0;
        TASBot.randomT=0;
        //TASBot.T=999;
        window.document.getElementById("prefsButton").click();
    }
};

TASBot.times=[];

TASBot.tick = function() {
    if(!TASBot.active) {
        Math.seedrandom(0); //ensure consistent game seed at start - acpnx
        return;
    }
    if(!Game.Achievements["Third-party"].won)Game.Win("Third-party"); // Replace with registering dummy mod
    if(!Game.HasAchiev("Cheated cookies taste awful"))TASBot.times.push(TASBot.time);
    TASBot.time+=TASBot.speed;
    TASBot.tas(TASBot.T);
    TASBot.subT=0;

    // Record by saving screenshots every frame
    // yes this is a dumb way to do it
    if(TASBot.record&&!Game.HasAchiev("Cheated cookies taste awful")) {
        TASBot.screenshot(TASBot.T);
    }

    TASBot.T++;
    TASBot.randomT=0;
}

TASBot.findFrenzySeed = function() {
    for(var i = 0; i < 100; i++) {
        Math.seedrandom(i);
        for(var j = 0; j < 5; j++)Math.random();
        let r = Math.random();
        if(r<0.1)return i;
    }
    return -1;
}

TASBot.findGoldenSeed = function(type,last,storm) {
    for(var i = 0; i < 200; i++) {
        if(TASBot.checkGoldenCookie(i,last,storm)==type)return i;
    }
    return -1;
}

// Emulates golden cookie code, assuming no wrath/aura
TASBot.checkGoldenCookie = function(seed,last,storm) {
    Math.seedrandom(seed);
    var list=[];
    list.push('frenzy','multiply cookies');
    if (Math.random()<0.03 && storm) list.push('chain cookie','cookie storm');
    Math.random();
    if (Math.random()<0.1 && (Math.random()<0.05 || true)) list.push('click frenzy');

    if (Math.random()<0.25) list.push('building special');

    if ((Math.random()<0.15) || Math.random()<0.05)
    {
        Math.random();
        Math.random();
    }
    if (last!='' && Math.random()<0.8 && list.indexOf(last)!=-1) list.splice(list.indexOf(last),1);//80% chance to force a different one
    if (Math.random()<0.0001) list.push('blab');
    return choose(list);
}

TASBot.checkStormDrop = function(seed,last,storm) {
    TASBot.checkGoldenCookie(seed,last,storm);
    return Math.floor(Math.random()*7+1);
}

TASBot.findIterations = function(result,startingSeed) {
    Math.seedrandom(startingSeed);
    for(var i = 0; i < 100000; i++) {
        var r = Math.random();
        if(r==result){
            console.log("Found! "+(i+1)+";"+r);
            return i+1;
        }
    }
    return -1;
}

TASBot.findSeed = function(bound,iterations) {
    var best = 9999999;
    for(var i = 0; i < 200000000; i++) {
        if(!(i%100))console.log(i+";"+best);
        Math.seedrandom(i);
        for(var j = 0; j < iterations-1; j++) {
            Math.random();
        }
        var r = Math.random();
        best=Math.min(best,r);
        if(r<bound)return i;
    }
    return -1;
}

TASBot.findSeedMulti = function(values,bounds,seed,maxTries) {
    let iterations = {};
    let maxIteration = 0;
    for(var i = 0; i < values.length; i++) {
        let it = TASBot.findIterations(values[i],seed);
        if(it==-1) {
            console.log("Could not find value for seed");
            return -1;
        }
        iterations[it]=bounds[i];
        maxIteration = Math.max(maxIteration,it);
    }
    console.log(iterations);
    let bestI = 99999;
    for(let i = 0; i < maxTries; i++) {
        console.log(i+";"+bestI);
        Math.seedrandom(i);
        for(var j = 0; j < maxIteration; j++) {
            let r = Math.random();
            if(iterations[j]) {
                bestI=Math.min(bestI,r-iterations[j]);
                if(r<iterations[j]) {
                    console.log("Found! "+i);
                    return i;
                }
            }
        }
    }
    return -1;
}

TASBot.findSeedNoSpawn = function(threshold, iterations) {
    for(var i = 0; i < 2000; i++) {
        Math.seedrandom(i);
        let found = true;
        for(var j = 0; j < iterations; j++) {
            if(Math.random()<threshold) {
                found = false;
                break;
            }
        }
        if(found)return i;
    }
    return -1;
}

TASBot.precomputeSugars = function(startTime,lumps,type) {
    let time = startTime;
    let results = [];
    for(let i = 0; i < lumps; i++) {
        let r = TASBot.getLump(Game.seed,time+23*3600000,time+24*3600000,type);
        results.push(r);
        time = r;
    }
    return results;
}

TASBot.getLump = function(seed,minTime,maxTime,lumpType) {
    for(var i = minTime; i < maxTime; i++) {
        if(TASBot.computeLumpType(seed,i)==lumpType)return i;
    }
    return minTime;
}

// Checks sugar lump type at given time
TASBot.computeLumpType = function(seed,time) {
    Math.seedrandom(seed+'/'+time);
    var types=[0];
    var loop=1;
    loop=randomFloor(loop);
    for (var i=0;i<loop;i++) {
        if (Math.random()<0.1) types.push(1);//bifurcated
        if (Math.random()<3/1000) types.push(2);//golden
        if (Math.random()<0.1*Game.elderWrath) types.push(3);//meaty
        if (Math.random()<1/50) types.push(4);//caramelized
    }
    return choose(types);
}

// Checks if next spell will backfire
TASBot.checkSpell = function(spell) {
    let failChance = 0.15;
    if(spell==1)failChance+=0.15*Game.shimmerTypes['golden'].n;
    Math.seedrandom(Game.seed+'/'+Game.Objects['Wizard tower'].minigame.spellsCastTotal);
    return Math.random()<1-failChance;
}

// Checks next FtHoF
TASBot.checkFtHoF = function() {
    let failChance=0.15*(Game.shimmerTypes['golden'].n+1);
    Math.seedrandom(Game.seed+'/'+Game.Objects['Wizard tower'].minigame.spellsCastTotal);
    if(Math.random()<1-failChance)return 'Golden';
    Math.random(); Math.random(); // Position on screen
    var choices=[];
    choices.push('clot','ruin cookies');
    if (Math.random()<0.1) choices.push('cursed finger','blood frenzy');
    if (Math.random()<0.003) choices.push('free sugar lump');
    if (Math.random()<0.1) choices=['blab'];
    return choose(choices);
}

// Casts (relatively) harmless Haggler's Charm instead if the spell will backfire
TASBot.safeCast = function(spell) {
    window.document.getElementById("grimoireSpell"+(TASBot.checkSpell(spell)?spell:4)).click();
}

TASBot.getPlant = function(x,y) {
    return Game.Objects.Farm.minigame.plantsById[Game.Objects.Farm.minigame.plot[y][x][0]-1]?Game.Objects.Farm.minigame.plantsById[Game.Objects.Farm.minigame.plot[y][x][0]-1].name:"";
}

TASBot.getAge = function(x,y) {
    return Game.Objects.Farm.minigame.plot[y][x][1];
}

TASBot.plant = function(x,y,plant) {
    window.document.getElementById("gardenSeed-"+plant).click();
    window.document.getElementById("gardenTile-"+x+"-"+y).click();
}

TASBot.harvest = function(x,y) {
    window.document.getElementById("gardenTile-"+x+"-"+y).click();
}

TASBot.soil = function(soil) {
    window.document.getElementById("gardenSoil-"+soil).click();
}

TASBot.harvestAll = function() {
    window.document.getElementById("gardenTool-1").click();
}

TASBot.stonks = function() {
    var sum = 0;
    for(var i =  0; i < 18; i++)sum+=Game.Objects.Bank.minigame.getGoodPrice(Game.Objects.Bank.minigame.goodsById[i])*Game.Objects.Bank.minigame.goodsById[i].stock;
    return sum;
}

TASBot.threshold = 999999;
TASBot.tas = function(tick) {
    if(tick>TASBot.threshold)alert(tick+","+Game.T+"    "+Game.cookies+"    "+Game.shimmerTypes.golden.time+"/"+Game.shimmerTypes.golden.minTime+";"+Game.shimmerTypes.reindeer.time+"/"+Game.shimmerTypes.reindeer.minTime+"    "+Game.shimmers.length);
    switch(tick) {
        case 1:
            window.document.getElementById('bakeryName').click();
            window.document.getElementById('bakeryNameInput').value="Orteil"; // God complex achievement
            window.document.getElementById('promptOption0').click();
            break;
        case 2:
            window.document.getElementById('bakeryName').click();
            window.document.getElementById('bakeryNameInput').value="TASBot"; // Doesn't cost us any time, since we have to wait for the reindeer anyway
            window.document.getElementById('promptOption0').click();
            break;
        case 3:
            window.document.getElementById("statsButton").click();
            break;
        case 4:
            window.document.getElementsByClassName("tinyCookie")[0].click(); // Tiny cookie achievement
            window.document.getElementsByClassName("crate achievement noFrame")[541].click(); // Here you go achievement
            window.document.getElementById("logButton").click();
            break;
        case 5:
            window.document.getElementById("oldenDays").firstChild.click(); // Olden days achievement
            window.document.getElementById("logButton").click();
            TASBot.resizeDone=0;
            break;
        case 6:
            break;
        case 8:
            window.document.getElementById('commentsText1').click(); // Stifling the press achievement
            break;
        case 10:
            for(var i = 0; i < 50; i++)window.document.getElementById('commentsText1').click(); // Tabloid addiction achievement
            break;
        case 41:
            // RNG Manip to spawn first reindeer
            Math.seedrandom(3323);
            break;
        case 42:
            if(Game.shimmers.length==0) {
                alert("RNG Desync :(");
                throw "RNG Desync :(";
            }
            Game.shimmers[0]['l'].click();                      // First 25 cookies from reindeer
            window.document.getElementById('product0').click(); // First cursor
            break;
        case 58:
            window.document.getElementById('product0').click();
            break;
        case 77:
            Math.seedrandom(7562);
            break;
        case 78:
            Math.seedrandom(2); // Frenzy
            Game.shimmers[0]['l'].click();
            break;
        case 79:
        case 81:
            window.document.getElementById('product0').click();
            break;
        case 88:
            window.document.getElementById('product1').click();
            break;
        case 90:
            window.document.getElementById('product1').click();
            Game.shimmers[0]['l'].click(); // Reindeer frenzy combo
            window.document.getElementById('product1').click();
            window.document.getElementById('product1').click();
            window.document.getElementById('product1').click();
            window.document.getElementById('product1').click();
            window.document.getElementById('product1').click();
            break;
        case 91:
        case 92:
        case 93:
        case 94:
        case 95:
        case 96:
            window.document.getElementById('product1').click();
            break;
        case 133:
            // Baby it's old outside achievement
            Game.Objects.Grandma.mouseOn=1;
            Game.Objects.Grandma.mousePos=[88,46];
            Game.mouseDown=1;
            Math.seedrandom(100);
            break;
        case 134:
            Math.seedrandom(50);
            break;
        case 119:
        case 135:
            Math.seedrandom(300);
            window.document.getElementById('product2').click();
            break;
        case 137:
            Math.seedrandom(2);
            break;
        case 138:
            Math.seedrandom(4);
            break;
        case 139:
            Math.seedrandom(8);
            break;
        case 140:
            //Math.seedrandom(425586);
            //TASBot.rngIndex = 30;
            //TASBot.saveState();
            break;
        case 141:
            //Math.seedrandom(49);
            //TASBot.threshold=999999;
            break;
        case 148:
            window.document.getElementById('product2').click();
            Math.seedrandom(0);
            break;
        case 152:
        case 153:
        case 154:
        case 155:
        case 156:
        case 157:
        case 158:
        case 159:
        case 160:
        case 161:
        case 162:
        case 163:
        case 164:
        case 165:
        case 166:
        case 167:
        case 168:
        case 169:
        case 174:
        case 191:
        case 215:
            window.document.getElementById('product3').click();
            break;
        case 198:
            Game.shimmers[0]['l'].click(); // Reindeer - we don't need the combo since we're going with cookie storm next
            window.document.getElementById('product3').click();
            break;
        case 216:
        case 217:
        case 218:
        case 219:
        case 220:
            for(let i = 0; i < 5; i++)window.document.getElementById('product2').click();
            break;
        case 221:
            for(let i = 0; i < 5; i++)window.document.getElementById('product2').click();
            Math.seedrandom(73593);
            break;
        case 222:
            Math.seedrandom(19);
            Game.shimmers[0]['l'].click(); // Cookie Storm
            break;
        case 226:
            // IT BEGINS
            TASBot.time+=9999999
            TASBot.time+=20*3600000;
            Math.seedrandom(3);
            window.document.getElementById('lumps').click(); // Hand-picked achievement

            for(let i = 0; i < 2000; i++) {
                TASBot.time+=23.5*3600000;
                window.document.getElementById('lumps').click();
            }
            for(let i = 0; i < 20; i++)for(let j = 0; j < 20; j++)if(window.document.getElementById("productLevel"+i))window.document.getElementById("productLevel"+i).click(); // Upgrade all to level 20

            window.document.getElementById("centerArea").scrollTo(0,window.document.getElementById("centerArea").scrollHeight);
            break;
        case 227:
            window.document.getElementById("productMinigameButton7").click();
            for(let i = 0; i < 20; i++)window.document.getElementById('bigCookie').dispatchEvent(new Event('click'));
            break;
        case 228:
            for(let i = 0; i < 20; i++)for(let j = 0; j < 20; j++)if(window.document.getElementById("productLevel"+i))window.document.getElementById("productLevel"+i).click(); // Upgrade all to level 20, again
            window.document.getElementById("legacyButton").click();
            window.document.getElementById("promptOption0").click();
            window.dispatchEvent(new KeyboardEvent("keyup",{'keyCode':'27'}));
            break;
        case 1000:
            if(Game.resets<999)throw "Didn't finish ascending in time :(";
            //console.log(Game.WriteSave(1));

            //var save = "Mi4wNTJ8fDE1Nzc0MTU5Njc4MDYxOzMwOTc0NDAwMDAwOzE1Nzc0MTU5NzAyMDYxO1RBU0JvdDthY3BueDswLDEsMCwwLDAsMCwwfDExMTExMTAxMTAxMTAxMTAwMTAxMDExMDAwMXwwOzA7MDszOzA7MDswOzA7OC4zODEwNzUxNjk5MjQ2NzNlKzIxOzA7MDswOzA7MDs5OTk7MDswOzA7MDswOzA7MDtjaHJpc3RtYXM7MDswOzIwMzE7MjAyMTsxMDswOzA7LTE7LTE7LTE7LTE7LTE7MDswOzA7MDs3NzswOzA7NjIxMTUyOzYyNTQwNjsxNTc3NDE1OTY3Nzg3MjswOzI7OzQxOzA7MDswOzUwOzA7MDt8MCwwLDAsNDAsLDAsMDswLDAsMCwzNywsMCwwOzAsMCwwLDIxLDE1Nzc0MTU5OTc4MDYxOjA6MTU3NzQxNTk2NzgwNjE6MDowOjA6MDowOjE1Nzc0MTU5Njc4MDYxOiAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIDA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOiwwLDA7MCwwLDAsMjAsLDAsMDswLDAsMCwyMCwsMCwwOzAsMCwwLDIwLDA6MDoxOjA6MDogMjg4NDowOi02ODo1ODowOjE6MDowITE0MjE6NTo2MDoxODY6MDoxOjA6MCE0NjEzOjI6LTE4MjoxOTU6MDoxOjA6MCE1MjU0OjQ6LTg5OjIwOjA6MTowOjAhNzEyMjowOi0xMTg6NDEyOjA6MTowOjAhNjMyNjo0Oi0xNjE6MjU4OjA6MTowOjAhODYwMzowOi05ODo1MzowOjE6MDowITEwNjMyOjU6ODU6MjYyOjA6MTowOjAhNTY1Mzo1Oi0xNzQ6MzA1OjA6MTowOjAhMTM2NjQ6NTotMTkwOjQ1ODowOjE6MDowITExNTczOjI6LTE4MDo2ODU6MDoxOjA6MCExMjQ5ODo0Oi0yNjY6MzMxOjA6MTowOjAhMTI3Nzg6NTotMjc1OjU4MzowOjE6MDowITE1NTA4OjU6LTg5OjY0MDowOjE6MDowITE2MjM2OjE6LTQ3OjU3MTowOjE6MDowITE3NzUwOjE6LTI2OjYwNDowOjE6MDowITE4MzUyOjA6LTY3OjM4NTowOjE6MDowITE5MTQ1OjU6Njk6MTQ3OjA6MTowOjAhIDAsMCwwOzAsMCwwLDIwLC0xLy0xLy0xIDMgMTU3NzQxNTk2NzgwNjEgMCwwLDA7MCwwLDAsMjAsNDQgMCAxMTIwIDAsMCwwOzAsMCwwLDIwLCwwLDA7MCwwLDAsMTQsLDAsMDswLDAsMCw1LCwwLDA7MCwwLDAsMSwsMCwwOzAsMCwwLDAsLDAsMDswLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwOzAsMCwwLDAsLDAsMDswLDAsMCwwLCwwLDA7MCwwLDAsMCwsMCwwOzAsMCwwLDAsLDAsMDswLDAsMCwwLCwwLDA7fDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDB8MTExMTExMTExMTExMDAwMDExMTExMTExMTExMTExMDAwMDExMTEwMTExMTExMTExMDExMTExMDExMDExMDEwMDAwMDEwMDAxMTExMTAwMTAwMTAwMDAxMTAwMDAxMTExMDAwMDAxMDAwMDAwMDAwMDEwMDAwMDAwMDAwMTAwMDAwMDAwMTEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMDAwMDAwMDAxMTEwMDAxMTAwMDExMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTEwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAxMDAxMTExMTEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMTExMTExMTEwMDAwMTExMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTEwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMHx8%21END%21";
            //Game.ImportSaveCode(save);
            break;
        case 1002:
            Game.specialTab='dragon';Game.ToggleSpecialMenu(1);PlaySound('snd/press.mp3');
            for(var i = 0; i < 20; i++)window.document.getElementsByClassName("optionBox")[1].children[0].click()
            window.document.getElementsByClassName("crate enabled")[1].click();
            window.document.getElementsByClassName("crate enabled")[16].click();
            window.document.getElementById("promptOption0").click();

            // To Infinity!
            for(var i = 0; i < 500; i++) {
                window.document.getElementById("grimoireSpell1").click();
                window.document.getElementById("grimoireLumpRefill").click();
                TASBot.time=TASBot.getLump(Game.seed,TASBot.time+23*3600000,TASBot.time+24*3600000,4);
                window.document.getElementById('lumps').click();
            }
            window.document.getElementById('storeBulk100').click();
            window.document.getElementById('storeBulkBuy').click();
            window.document.getElementById('product0').click();
            window.document.getElementById('product0').click();
            window.document.getElementById('product0').click();
            window.document.getElementById("productMinigameButton5").click();
            break;
        case 1003:
            window.document.getElementById("bankOfficeUpgrade").click();
            window.document.getElementById("bankOfficeUpgrade").click();
            window.document.getElementById("bankLoan1").click(); // Debt Evasion achievement

            window.document.getElementById("legacyButton").click();
            window.document.getElementById("promptOption0").click();
            window.dispatchEvent(new KeyboardEvent("keyup",{'keyCode':'27'}));
            break;
        case 1004:
            for(let j = 0; j < 4; j++)for(let i = 0; i <= 864; i++)if(window.document.getElementById('heavenlyUpgrade'+i))window.document.getElementById('heavenlyUpgrade'+i).click();
            window.document.getElementById("ascendButton").click();
            Math.seedrandom(0);
            window.document.getElementById("promptOption0").click();
            break;
        case 1005:
            window.document.getElementById("storeBuyAllButton").click();
            break;
        case 1006:
            // No time like the present achievement
            var code = utf8_to_b64('MAIL|'+TASBot.time+'|1|34 6||'); // gift forgery lol
            window.document.getElementById("prefsButton").click();
            for(var i in window.document.getElementsByClassName("option")) {
                if(window.document.getElementsByClassName("option")[i].innerHTML=="Redeem") {
                    window.document.getElementsByClassName("option")[i].click();
                    break;
                }
            }
            window.document.getElementById("giftCode").value=code;
            window.document.getElementById("promptOption0").click();
            window.document.getElementById("promptOption0").click();
            window.document.getElementById("prefsButton").click();

            window.document.getElementById("legacyButton").click();
            window.document.getElementById("promptOption0").click();
            window.dispatchEvent(new KeyboardEvent("keyup",{'keyCode':'27'}));
            break;
        case 1007:
            window.document.getElementById("ascendButton").click();
            Math.seedrandom(0);
            window.document.getElementById("promptOption0").click();
            break;
        case 1008:
            window.document.getElementById("storeBuyAllButton").click();
            window.document.getElementById('storeBulk100').click();
            window.document.getElementById('storeBulkBuy').click();
            break;
        case 1009:
            for(let n = 0; n < 4; n++)for(let i = 0; i < 20; i++)window.document.getElementById('product'+i).click();
            window.document.getElementById('product7').click();
            window.document.getElementById('bigCookie').dispatchEvent(new Event('click'));
            window.document.getElementById("storeBuyAllButton").click();

            Game.specialTab='dragon';Game.ToggleSpecialMenu(1);PlaySound('snd/press.mp3');
            for(var i = 0; i < 27; i++)window.document.getElementsByClassName("optionBox")[1].children[0].click()
            window.document.getElementsByClassName("crate enabled")[1].click();
            window.document.getElementsByClassName("crate enabled")[16].click();
            window.document.getElementById("promptOption0").click();
            window.document.getElementsByClassName("crate enabled")[24].click();
            window.document.getElementsByClassName("crate enabled")[19].click();
            window.document.getElementById("promptOption0").click();

            window.document.getElementById("productMinigameButton7").click();
            break;
        case 1010:
            window.document.getElementById('bigCookie').dispatchEvent(new Event('click'));

            // and beyond
            for(var i = 0; i < 700; i++) {
                window.document.getElementById("grimoireSpell1").click();
                TASBot.time=TASBot.getLump(Game.seed,TASBot.time+Game.lumpRipeAge,TASBot.time+Game.lumpOverripeAge,4);
                window.document.getElementById('lumps').click();
                window.document.getElementById("grimoireLumpRefill").click();
            }
            window.document.getElementById("storeBuyAllButton").click();
            break;
        case 1011:
            window.document.getElementById('bigCookie').dispatchEvent(new Event('click'));
            for(let n = 0; n < 45; n++)for(let i = 0; i < 20; i++)window.document.getElementById('product'+i).click();
            for(let i = 0; i < 20; i++)for(let j = 0; j < 20; j++)if(window.document.getElementById("productLevel"+i))window.document.getElementById("productLevel"+i).click(); // Upgrade all to level 20, again again
            window.document.getElementById("storeBuyAllButton").click();

            window.document.getElementById("productMinigameButton6").click();
            break;
        case 1012:
            // Slot in Selebrak for faster reindeer
            var e = new Event('mousedown');
            e.button=0;
            window.document.getElementById('templeGodDrag4').dispatchEvent(e);
            window.document.getElementById('templeSlot0').dispatchEvent(new Event('mouseover'));
            e=new Event('mouseup');
            e.button=0;
            window.document.getElementById('templeGodDrag4').dispatchEvent(e);
        case 1013:
        case 1014:
        case 1015:
            window.document.getElementById("upgrade6").click();
            window.document.getElementById('bigCookie').dispatchEvent(new Event('click'));
            window.document.getElementById("storeBuyAllButton").click();
            break;
        case 1016:
            //console.log(Game.WriteSave(1));

            //var save = "Mi4wNTJ8fDYzODY3Njc5MDk2MjszMDk3NDQwMDAwMDs2OTM4ODU5MTA1Mzc7VEFTQm90O2FjcG54OzAsMSwwLDAsMCwwLDB8MTExMTExMDExMDExMDExMDAxMDEwMTEwMDAxfEluZmluaXR5O0luZmluaXR5Ozc7MzszLjcxODgwODc3MjY5ODA2NWUrOTk7MDswOzA7OS44MjgwNDAzOTY0NzIyMDRlKzE4OTswOzA7MDs2NTs0NDg4OzEwMDA7MDswOzA7MDswOzA7MDtjaHJpc3RtYXM7MDswOzIuMTQyMDE0MDI5Mzc0MDczZSs1OTsyLjE0MjAxNDAyOTM3NDA3M2UrNTk7NzQ5MzgxNDQ5ODY4Njk4MjA7MDswOy0xOy0xOy0xOy0xOy0xOzI3OzE2OzA7MDs3NzswOzA7NjE2MjMwOzYzMDYyNzs2OTM4ODU4ODA1Mzc7MjYwODg7NDs7NDE7MDswOzIuNjUyMjAyMjI0MzE4NTc4N2UrOTk7NTA7MDsxO3w0NTYwLDQ5MTAsSW5maW5pdHksNjAsLDAsNDU2MDs0NTU1LDQ5MDUsSW5maW5pdHksNTcsLDAsNDU1NTs0NTUwLDQ5MDAsSW5maW5pdHksNDEsNjkzODg2MTgwNTM3OjA6NjM4Njc2NzkwOTYyOjA6MDowOjA6MDo2Mzg2NzY3OTA5NjI6IDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAgMDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6MDowOjA6LDAsNDU1MDs0NTUwLDQ5MDAsSW5maW5pdHksNDAsLDAsNDU1MDs0NTUwLDQ5MDAsSW5maW5pdHksNDAsLDAsNDU1MDs0NTUwLDQ5MDAsSW5maW5pdHksNDAsMDowOjE6MDowOiAyMzE1OjI6LTI6NDU4OjA6MDowOjAhNDkwODo1Ojg4OjM1MTowOjA6MDowITEwNDQ6NDotNTI6MjMwOjA6MDowOjAhNjc3NDo1OjgzOjIyMTowOjA6MDowITcxMzM6MToxMzoxNzA6MDowOjA6MCE3Mzg5OjA6MDo2MTE6MDowOjA6MCE5MTA0OjI6MjozNDI6MDowOjA6MCE5NTgyOjI6MTo3OTowOjA6MDowITkwMDk6NDotOTA6NTQzOjA6MDowOjAhMTUxNjQ6Mzo1Njo2MzA6MDowOjA6MCExMjUwMzoyOi0zMDoyODc6MDowOjA6MCExNDY0NzoxOjMxOjI2NjowOjA6MDowITE0MjY4OjI6LTQ1OjQ4NDowOjA6MDowITEyMTM4OjQ6LTkxOjc3OjA6MDowOjAhMTM1OTA6NDotNjE6NTY3OjA6MDowOjAhMjA0Nzk6NDo0MzoyNzQ6MDowOjA6MCExODU1NzowOi0xNjo2Nzg6MDowOjA6MCEyMDExNjowOi01OjM4MTowOjA6MDowISAwLDAsNDU1MDs0NTUwLDQ5MDAsSW5maW5pdHksNDAsLTEvLTEvLTEgMyA2Mzg2NzY3OTA5NjIgMCwwLDQ1NTA7NDY1MCw1MDAwLEluZmluaXR5LDQwLDcxLjgxMTgyNjUxOTMwOTQzIDY4MyAyMzAxIDEsMCw0NjUwOzQ1NTAsNDkwMCxJbmZpbml0eSw0MCwsMCw0NTUwOzQ1NTAsNDkwMCxJbmZpbml0eSwzNCwsMCw0NTUwOzQ1NTAsNDkwMCxJbmZpbml0eSwyNSwsMCw0NTUwOzQ1NTAsNDkwMCxJbmZpbml0eSwyMSwsMCw0NTUwOzQ1NTAsNDkwMCxJbmZpbml0eSwyMCwsMCw0NTUwOzQ1NTAsNDkwMCxJbmZpbml0eSwyMCwsMCw0NTUwOzQ1NTAsNDkwMCxJbmZpbml0eSwyMCwsMCw0NTUwOzQ1NTAsNDkwMCxJbmZpbml0eSwyMCwsMCw0NTUwOzQ1NTAsNDkwMCxJbmZpbml0eSwyMCwsMCw0NTUwOzQ1NTAsNDkwMCxJbmZpbml0eSwyMCwsMCw0NTUwOzQ1NTAsNDkwMCxJbmZpbml0eSwyMCwsMCw0NTUwOzQ1NDksNDkwMCxJbmZpbml0eSwyMCwsMCw0NTQ5O3wxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDAxMTExMTExMTExMTExMTExMTExMTExMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMTExMTAwMTExMTExMDAwMDAwMDAwMDExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMDAwMDAwMDAwMDAwMDAxMTAwMDAwMDAwMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDAwMTEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMTExMTExMTExMTExMTAxMDEwMTAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMDAwMDAwMDAwMDAwMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMDAwMDExMTEwMDAwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAxMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDExMTExMTExMTExMTExMTExMTExMTExMTExfDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDAwMTExMTEwMDEwMDEwMTAwMTExMTExMTExMTAwMDAxMTExMDAwMDAwMDAxMDAxMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTAwMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMDAwMDAwMDExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwMTExMTExMTExMTExMTAwMTAwMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMDExMTF8fA%3D%3D%21END%21";
            //Game.ImportSaveCode(save);

            TASBot.forceRandom(0);
            window.document.getElementById("productMinigameButton2").click();

            window.resizeTo(550,200); // Cookie dunker achievement
            window.moveTo(0,0);
            window.moveBy(-1100,0);
            break;
        case 1018:
            window.document.getElementById('commentsText1').click(); // Stifling the press achievement
            for(var i = 0; i < 50; i++) {
                TASBot.time+=21;
                window.document.getElementById('bigCookie').dispatchEvent(new Event('click'));
            }
            break;
        case 1019:
            window.resizeTo(1920,1040);
            window.moveTo(0,0);
            window.moveBy(-1100,0);
            break;
        case 1022:
            window.document.getElementsByClassName("crate enabled")[22].click();
            window.document.getElementsByClassName("crate enabled")[19].click();
            window.document.getElementById("promptOption0").click();

            Game.specialTab='santa';Game.ToggleSpecialMenu(1);PlaySound('snd/press.mp3');
            for(var n = 0; n < 14; n++)window.document.getElementsByClassName("option framed large title")[0].click();

            TASBot.forceRandom(0);
            break;
        case 1023:
            window.document.getElementById("storeBuyAllButton").click();

            // In her likeness achievement
            window.document.getElementsByClassName("smallFancyButton framed onlyOnCanvas")[0].click();
            for(var i = 0; i < 9; i++)window.document.getElementById("customizerSelect-R-hair").click();
            window.document.getElementById("customizerSelect-R-skinCol").click();
            for(var i = 0; i < 2; i++)window.document.getElementById("customizerSelect-R-head").click();
            for(var i = 0; i < 2; i++)window.document.getElementById("customizerSelect-R-acc1").click();
            window.document.getElementById("promptOption0").click();
            break;
        default:
            Math.seedrandom(0);
    }
    if(tick>228&&tick<1022) {
        if(window.document.getElementById("versionNumber"))window.document.getElementById("versionNumber").innerText=Game.resets;
    }
    if(tick>1022) {
        if(window.document.getElementById("versionNumber")) {
            if(Game.HasAchiev('Reindeer sleigher')) {
                window.document.getElementById("versionNumber").innerText=Game.goldenClicks;
            } else {
                window.document.getElementById("versionNumber").innerText=Game.reindeerClicked;
            }
        }
    }
}

TASBot.bestBuilding = function() {
    var bestRatio = 9999999999999999999;
    var bestI = -1;
    var buildings = ["Cursor","Grandma","Farm","Mine","Factory","Bank","Temple","Wizard tower","Shipment","Alchemy lab","Portal","Time machine","Antimatter condenser","Prism","Chancemaker","Fractal engine","Javascript console","Idleverse","Cortex baker","You"];
    for(var i = 19; i >= 0; i--) {
        if(Game.cookies>Game.Objects[buildings[i]].price) {
            var r = Game.Objects[buildings[i]].price/Game.Objects[buildings[i]].cps(Game.Objects[buildings[i]]);
            if(r<bestRatio) {
                bestRatio=r;
                bestI=i;
            }
        }
    }
    return bestI;
}

TASBot.buyTrillion = function() {
    var buildings = ["Cursor","Grandma","Farm","Mine","Factory","Bank","Temple","Wizard tower","Shipment","Alchemy lab","Portal","Time machine","Antimatter condenser","Prism","Chancemaker","Fractal engine","Javascript console","Idleverse","Cortex baker","You"];
    window.document.getElementById('storeBulk100').click();
    window.document.getElementById('storeBulkSell').click();
    window.document.getElementById('product0').click();
    window.document.getElementById('product1').click();
    window.document.getElementById('storeBulk10').click();
    window.document.getElementById('product1').click();
    window.document.getElementById('storeBulk1').click();
    for(var n = 0; n < 100000; n++) {
        for(var i = 19; i >= 0; i--) {
            var b = Game.Objects[buildings[i]];
            if(Game.cookies>b.getSumPrice(1)) {
                var loss = b.getSumPrice(1)-Math.floor(b.getSellMultiplier()*b.getSumPrice(1));
                if(Game.cookies-loss>999999999000) {
                    var prev = Game.cookies;
                    window.document.getElementById('storeBulkBuy').click();
                    window.document.getElementById('product'+i).click();
                    window.document.getElementById('storeBulkSell').click();
                    window.document.getElementById('product'+i).click();
                    if(Game.cookies<1000000000000) {
                        while(Game.cookies<1000000000000) {
                            TASBot.time+=21;
                            window.document.getElementById('bigCookie').dispatchEvent(new Event('click'));
                        }
                        return;
                    }
                    break;
                }
            }
        }
    }
    alert(Game.cookies);
}

TASBot.lumpPrecomputeIndex = 0;

TASBot.cursorUpgrades = [0,1,2,3,4,5,6,43,82,109,188,189,660,764,873,75,76,77,78,119,190,191,366,367,427,460,461,661,765,874];

// Subframe inputs during time acceleration
TASBot.subtick = function() {
    switch(TASBot.T) {
        case 140:
        case 141:
        case 142:
        case 143:
        case 144:
        case 145:
        case 146:
        case 147:
        case 148:
        case 149:
        case 150:
            Math.seedrandom(28); // Delay reindeer spawn for the combo
            break;
        case 151:
            if(Game.shimmers.length>0) {
                Math.seedrandom(29); // Frenzy
                Game.shimmers[0]['l'].click();
            }
            Math.seedrandom(73593); // Golden Cookie
            break;
        case 152:
            if(Game.shimmers.length>0)Game.shimmers[0]['l'].click(); // Reindeer frenzy combo
            window.document.getElementById('product3').click();
            break;
        case 223:
        case 224:
            for(let i = 0; i < 10; i++)window.document.getElementById('product7').click();
            if(Game.cookiesEarned<400000000) {
                for(let i = 0; i < 10; i++)window.document.getElementById('product6').click();
                for(let i = 0; i < 10; i++)window.document.getElementById('product5').click();
                for(let i = 0; i < 10; i++)window.document.getElementById('product4').click();
                for(let i = 0; i < 10; i++)window.document.getElementById('product3').click();
                for(let i = 0; i < 10; i++)window.document.getElementById('product2').click();
            }
            if(Game.shimmers.length>0) {
                Math.seedrandom(8);
                Game.shimmers[0]['l'].click(); // Cookie Storm
                console.log("Clicked");
            }
            break;
        case 225:
            if(Game.T%150==149)TASBot.time-=9999999;
            break;
        case 228:
            if(!Game.Objects['Wizard tower'].minigame)return;
            if(Game.ascendMeterLevel<100) {
                for(let i = 0; i < 20; i++) {
                    TASBot.safeCast(0);
                    window.document.getElementById("grimoireLumpRefill").click();
                    TASBot.time=TASBot.getLump(Game.seed,TASBot.time+23*3600000,TASBot.time+24*3600000,4);
                    window.document.getElementById('lumps').click();
                    if(Game.Objects['Wizard tower'].amount>20) {
                        if(Game.hasBuff('Elder frenzy')||TASBot.checkFtHoF()!='blood frenzy') {
                            TASBot.safeCast(1);
                        } else {
                            window.document.getElementById("grimoireSpell1").click();
                        }
                        window.document.getElementById("grimoireLumpRefill").click();
                        TASBot.time=TASBot.getLump(Game.seed,TASBot.time+23*3600000,TASBot.time+24*3600000,4);
                        window.document.getElementById('lumps').click();
                        for(let i = 0; i < Game.shimmers.length; i++)if(!Game.shimmers[i].wrath||(Game.shimmers[i].force!="ruin cookies"&&Game.shimmers[i].force!="clot"&&Game.shimmers[i].force!="cursed finger"))Game.shimmers[i]['l'].click();
                    }
                }
                for(let i = 0; i < 60; i++)if(window.document.getElementById('upgrade'+i))window.document.getElementById('upgrade'+i).click();
                for(let i = 0; i < 10; i++) {
                    let b = TASBot.bestBuilding();
                    if(b<0)break;
                    window.document.getElementById('product'+b).click();
                }
            }
            break;
        case 1001:
        case 1002:
            if(Game.Objects.Chancemaker.amount<100) {
                for(let i = 0; i < 50; i++) {
                    if(Game.cookies>Game.cookiesPs*24*3600*5&&Game.cookiesPs!=0)break;
                    window.document.getElementById('bigCookie').dispatchEvent(new Event('click'));
                    TASBot.time=TASBot.getLump(Game.seed,TASBot.time+23*3600000,TASBot.time+24*3600000,2);
                    window.document.getElementById('lumps').click();
                }
                window.document.getElementById('bigCookie').dispatchEvent(new Event('click'));
                for(let i = 0; i < 60; i++)if(window.document.getElementById('upgrade'+i))window.document.getElementById('upgrade'+i).click();
                for(let i = 0; i < 10; i++)for(let j = 20; j >= 0; j--)if(window.document.getElementById('upgrade'+j))window.document.getElementById('upgrade'+j).click();
                for(let i = 0; i < 10; i++) {
                    let b = TASBot.bestBuilding();
                    if(b<0)break;
                    window.document.getElementById('product'+b).click();
                }
            } else {
                for(let i = 0; i < 60; i++)if(window.document.getElementById('upgrade'+i))window.document.getElementById('upgrade'+i).click();
            }
            break;
        case 1018:
        case 1019:
        case 1020:
        case 1021:
            TASBot.garden((TASBot.T-1018)*152+TASBot.subT+1017);
            break;
    }
    if(TASBot.T>1022&&Game.reindeerClicked>=200) {
        if(!Game.HasAchiev('Seedless to nay')) {
            // Seedless to nay achievement
            window.document.getElementById("gardenTool-3").click();
            window.document.getElementById("promptOption0").click();

            TASBot.restoreRandom();
            TASBot.restoreChoose();
            TASBot.time=TASBot.getLump(Game.seed,Game.lumpT+Game.lumpRipeAge,Game.lumpT+Game.lumpOverripeAge,3);
            window.document.getElementById('lumps').click();
            TASBot.time=Game.lumpT+Game.lumpRipeAge;
            window.document.getElementById('lumps').click();
            TASBot.forceRandom(0);

            // Switch to halloween
            window.document.getElementById("upgrade3").click();

            window.document.getElementById("productMinigameButton5").click();
            window.document.getElementById("centerArea").scrollTo(0,window.document.getElementById("centerArea").scrollHeight/4.5);

            for(var i = 0; i < 5; i++)window.document.getElementById("bankOfficeUpgrade").click();
            window.document.getElementById("storeBulkBuy").click();
            for(var i = 0; i < 19; i++)window.document.getElementById("product0").click();
            for(var n = 0; n < 500; n++)for(var i = 0; i < 19; i++)window.document.getElementById("productLevel"+i).click();
            for(var i = 0; i < 18; i++)window.document.getElementById("bankGood-"+i+"_Max").click();
        }
        if(Game.season=="halloween") {
            var i = TASBot.halloweenIndex();
            if(i<7) {
                Game.mouseX=TASBot.mouseXs[i];
                Game.mouseY=TASBot.mouseYs[i];
                TASBot.forceChoose(i);
                TASBot.forceRandom(0.9999);
                TASBot.click=1;
                TASBot.forceClickOverride();
                window.document.getElementById("storeBuyAllButton").click();
                window.document.getElementById("backgroundLeftCanvas").click();
            } else {
                TASBot.click=0;
                TASBot.restoreClickOverride();
                // Switch to valentines
                window.document.getElementById("upgrade4").click();
            }
        }
        if(Game.season=="valentines") {
            window.document.getElementById("storeBuyAllButton").click();
            if(Game.HasAchiev('Lovely cookies')) {
                // Switch to easter
                window.document.getElementById("upgrade6").click();
                // Golden switch
                window.document.getElementById("upgrade7").click();
            }
        }
        if(Game.season=="easter"&&Game.goldenClicks<27777) {
            if(!Game.HasAchiev('Hide & seek champion')&&!Game.HasUnlocked(Game.easterEggs[19])) {
                window.document.getElementById('storeBulk1').click();
                window.document.getElementById('storeBulkSell').click();
                var eggSeeds = [  17,  132,  123,  17,  7,  25,  104,  21,  94,  70,  72,  21,  7,  234,  54,  69,  350,  496,  169,  221];
                for(var n = 0; n < Game.easterEggs.length; n++) {
                    TASBot.forceRandom(0);
                    window.document.getElementById('product19').click();
                    TASBot.restoreRandom();
                    TASBot.restoreChoose();
                    Math.seedrandom(eggSeeds[n]);
                    Game.shimmers[0]['l'].click();
                }

                TASBot.forceRandom(0.99999);
            }

            if(window.document.getElementById("upgrade14"))window.document.getElementById("storeBuyAllButton").click();

            if(!Game.HasAchiev('Gaseous assets')&&TASBot.stonks()+Game.Objects.Bank.minigame.profit>=31536000) {
                for(var i = 0; i < 18; i++)window.document.getElementById("bankGood-"+i+"_-All").click();
            }
            // Buy buy buy achievement
            if(Game.HasAchiev('Gaseous assets')&&!Game.HasAchiev('Buy buy buy')) {
                for(var i = 0; i < 18; i++) {
                    if(Game.Objects.Bank.minigame.getGoodMaxStock(Game.Objects.Bank.minigame.goodsById[i])*Game.Objects.Bank.minigame.goodsById[i].val>=86400) {
                        window.document.getElementById("bankGood-"+i+"_Max").click();
                        window.document.getElementById("bankGood-"+i+"_-All").click();
                        window.document.getElementById("productMinigameButton2").click();
                        window.document.getElementById("productMinigameButton5").click();
                        window.document.getElementById("productMinigameButton6").click();
                        window.document.getElementById("productMinigameButton7").click();
                        window.document.getElementById("centerArea").scrollTo(0,0);
                        break;
                    }
                }
            }

            TASBot.forceRandom(0.99999);

            if(Game.cookies<Infinity) {
                for(var i in Game.shimmers) {
                    if(Game.HasAchiev('Fading luck')||Game.shimmers[i].life<Game.fps) {
                        Game.shimmers[i]['l'].click();
                    }
                }
                // Drorb cookie chain to maximize golden cookies for Seven horseshoes
                if(Game.shimmerTypes.golden.time==Game.shimmerTypes.golden.minTime-1) {
                    while(Game.shimmerTypes.golden.chain!=0)TASBot.drorb(Game.last!="multiply cookies"?"multiply cookies":"ruin cookies");
                    TASBot.drorb(Game.last!="multiply cookies"?"multiply cookies":"ruin cookies");
                    TASBot.drorb("chain cookie");
                }
                window.document.getElementById("storeBuyAllButton").click();
                TASBot.forceRandom(0.99999);
                if(Game.goldenClicks==27777) {
                    TASBot.speed=33;
                    // Our final achievement: Cheated cookies taste awful
                    // Opening the cheat menu, but no need to use it. The game is already complete
                    window.document.getElementById('bakeryName').click();
                    window.document.getElementById('bakeryNameInput').value="TASBotsaysopensesame";
                    window.document.getElementById('promptOption0').click();
                    console.log("done :)");
                }
            } else {
                window.document.getElementById("storeBulkSell").click();
                window.document.getElementById("storeBulk100").click();
                while(Game.Objects.You.amount>500)window.document.getElementById("product19").click();
                window.document.getElementById("storeBulkBuy").click();
                for(var i = 0; i < 2; i++)window.document.getElementById("product18").click();
            }
        }
    }
    if(TASBot.T>1022&&Game.reindeerClicked<200) {
        if(TASBot.getPlant(0,0)=="Cheapcap") {
            TASBot.harvestAll();
            TASBot.soil(2);
        }
        if(TASBot.getPlant(0,0)!="Chimerose")for(var x = 0; x < 6; x++)for(var y = 0; y < 6; y+=2)TASBot.plant(x,y,15);
        if(TASBot.getPlant(0,1)!="Nursetulip")for(var x = 0; x < 6; x++)for(var y = 1; y < 6; y+=2)TASBot.plant(x,y,16);
        if(TASBot.getAge(0,0)<30||TASBot.getAge(0,1)<60)TASBot.time+=400000;
    }
    if(TASBot.T>1016) {
        if(Game.wrinklersPopped>=200&&Game.pledges<=10) {
            if(window.document.getElementById('upgrade0').dataset.id=="74") {
               if(window.document.getElementById("upgradePieTimer0")) {
                    window.document.getElementById('upgrade1').click();
                } else {
                    window.document.getElementById('upgrade0').click();
                }
            } else if(window.document.getElementById('upgrade0').dataset.id=="85") {
                window.document.getElementById('upgrade0').click();
            }
            window.document.getElementById("storeBuyAllButton").click();
        }
        if(Game.TickerEffect.type=='fortune') {
            window.document.getElementById('commentsText1').click();
            window.document.getElementById("storeBuyAllButton").click();
        }
        if(Game.reindeerClicked<200)for(var i in Game.shimmers) {
            var shimmer = Game.shimmers[i];
            if(shimmer.type=="reindeer") {
                // Eldeer
                if(Game.reindeerClicked==199&&!Game.HasAchiev('Eldeer')) {
                    TASBot.drorb("blood frenzy");
                }
                TASBot.forceRandom(0.9999);
                if(!Game.HasAchiev('Let it snow'))TASBot.forceChoose(TASBot.christmas++);
                shimmer['l'].click();
                TASBot.forceRandom(0);
            }
        }
        for(var i = 0; i < window.document.getElementById('techUpgrades').children.length; i++) {
            window.document.getElementById('techUpgrades').children[i].click();
            if(window.document.getElementById("promptOption0"))window.document.getElementById("promptOption0").click();
        }
        if(Game.wrinklers.length!=0&&Game.wrinklersPopped<200) {
            if(Game.HasAchiev('Wrinkler poker')) {
                Game.mouseX=490;
                Game.mouseY=261;
                TASBot.click=1;
                TASBot.forceClickOverride();
                window.document.getElementById("backgroundLeftCanvas").click();
            } else {
                var b = true;
                for(var i = 0; i < Game.wrinklers.length; i++) {
                    if(Game.wrinklers[i].hp<=1.25) {
                        b=false;
                        break;
                    }
                }
                // Wrinkler poker achievement
                Game.mouseX=490;
                Game.mouseY=261;
                TASBot.click=b?1:0;
                TASBot.forceClickOverride();
                if(b) {
                    window.document.getElementById("backgroundLeftCanvas").click();
                }
            }
        }
    }  else {
        TASBot.click=0;
        TASBot.restoreClickOverride();
    }
    if(TASBot.T>229&&Game.resets<999) {
        if(Game.OnAscend&&!TASBot.reincarnating) {
            TASBot.reincarnating=true;
            window.document.getElementById('heavenlyUpgrade363').click();
            window.document.getElementById('heavenlyUpgrade323').click();
            window.document.getElementById("ascendButton").click();
            Math.seedrandom(0);
            window.document.getElementById("promptOption0").click();
            return;
        }
        TASBot.reincarnating=false;
        if(Game.AscendTimer!=0)return;
        if(Game.ascendMeterLevel<1) {
            for(let i = 0; i < 10; i++) {
                if(Game.cookies>Game.cookiesPs*24*3600&&Game.cookiesPs!=0)break;
                window.document.getElementById('bigCookie').dispatchEvent(new Event('click'));
                if(TASBot.lumpPrecomputeIndex<TASBot.lumpPrecompute.length) {
                    TASBot.time=TASBot.lumpPrecompute[TASBot.lumpPrecomputeIndex++];
                } else {
                    TASBot.time=TASBot.getLump(Game.seed,TASBot.time+23*3600000,TASBot.time+24*3600000,2);
                    TASBot.lumpPrecompute.push(TASBot.time);
                    TASBot.lumpPrecomputeIndex++;
                }
                window.document.getElementById('lumps').click();
            }
            window.document.getElementById('bigCookie').dispatchEvent(new Event('click'));
            for(let i = 0; i < 60; i++)if(window.document.getElementById('upgrade'+i)&&(Game.resets!=998||!TASBot.cursorUpgrades.includes(parseInt(window.document.getElementById('upgrade'+i).attributes["data-id"].value))))window.document.getElementById('upgrade'+i).click();
            for(let i = 0; i < 10; i++)for(let j = 20; j >= 0; j--)if(window.document.getElementById('upgrade'+j)&&(Game.resets!=998||!TASBot.cursorUpgrades.includes(parseInt(window.document.getElementById('upgrade'+j).attributes["data-id"].value))))window.document.getElementById('upgrade'+j).click();
            for(let i = 0; i < 10; i++) {
                let b = TASBot.bestBuilding();
                if(b<0)break;
                window.document.getElementById('product'+b).click();
            }
        }
        if(Game.ascendMeterLevel>=1) {
            if(Game.resets==998) {
                TASBot.buyTrillion();
                console.log(Game.T);
            }
            Game.ascendMeterLevel=0;
            window.document.getElementById("legacyButton").click();
            window.document.getElementById("promptOption0").click();
            window.dispatchEvent(new KeyboardEvent("keyup",{'keyCode':'27'}));
        }
    }
    TASBot.subT++;
}

// Spawns a dragon orb golden cookie
TASBot.drorb=function(effect) {
    if(Game.auraMult('Dragon Orbs')<=0)throw "Dragon Orb Aura not selected";
    if(Game.shimmerTypes['golden'].n>0)throw "Cannot drorb when golden cookie on screen";
    if(Game.buffsI.length>0)throw "Cannot drorb when buffed";
    window.document.getElementById('storeBulk1').click();
    window.document.getElementById('storeBulkSell').click();

    // Avoid the 1/100 chance to break chain
    TASBot.forceRandom(0.05);
    window.document.getElementById('product19').click();

    if(Game.Objects.You.amount<100) {
        window.document.getElementById('storeBulkBuy').click();
        window.document.getElementById('product19').click();
    }

    var me;
    for(var i = 0; i < Game.shimmers.length; i++)if(Game.shimmers[i].type=="golden")me=Game.shimmers[i];
    var last = Game.shimmerTypes.golden.last;

    var list=[];
    if (me.wrath>0) list.push('clot','multiply cookies','ruin cookies');
    else list.push('frenzy','multiply cookies');
    if (me.wrath>0 && Game.hasGod && Game.hasGod('scorn')) list.push('clot','ruin cookies','clot','ruin cookies');
    if (me.wrath>0 && Math.random()<0.3) list.push('blood frenzy','chain cookie','cookie storm');
    else if (Math.random()<0.03 && Game.cookiesEarned>=100000) list.push('chain cookie','cookie storm');
    if (Math.random()<0.05 && Game.season=='fools') list.push('everything must go');
    if (Math.random()<0.1 && (Math.random()<0.05 || !Game.hasBuff('Dragonflight'))) list.push('click frenzy');
    if (me.wrath && Math.random()<0.1) list.push('cursed finger');
    if (Game.BuildingsOwned>=10 && Math.random()<0.25) list.push('building special');
    if (Game.canLumps() && Math.random()<0.0005) list.push('free sugar lump');
    if ((me.wrath==0 && Math.random()<0.15) || Math.random()<0.05)
    {
        if (Math.random()<Game.auraMult('Reaper of Fields')) list.push('dragon harvest');
        if (Math.random()<Game.auraMult('Dragonflight')) list.push('dragonflight');
    }
    if (last!='' && Math.random()<0.8 && list.indexOf(last)!=-1) list.splice(list.indexOf(last),1);
    if (Math.random()<0.0001) list.push('blab');

    if(list.indexOf(effect)==-1)throw "Invalid drorb, available: "+list;
    TASBot.forceChoose(list.indexOf(effect));
    me['l'].click();
}

TASBot.mouseXs = [286,408,465,514,466,396,305];
TASBot.mouseYs = [199,205,286,370,486,554,573];
TASBot.halloweenCookies = ['Skull cookies','Ghost cookies','Bat cookies','Slime cookies','Pumpkin cookies','Eyeball cookies','Spider cookies'];

TASBot.halloweenIndex = function() {
    for(var i = 0; i < TASBot.halloweenCookies.length; i++) {
        if(!Game.Has(TASBot.halloweenCookies[i]))return i;
    }
    return 7;
}

TASBot.garden = function(step) {
    TASBot.time+=400000;
    switch(step) {
        case 1017:
            TASBot.forceRandom(0);
            break;
        case 1018:
            TASBot.forceRandom(0.9999);
            break;
        case 1019:
            TASBot.forceRandom(0);
            TASBot.harvest(2,0);
            TASBot.forceChoose(1);
            TASBot.harvest(4,4);
            TASBot.forceRandom(0.9999);
            break;
        case 1023:
            // Meddleweed
            TASBot.harvest(0,0);
            // Brown Mold
            TASBot.harvest(2,0);
            break;
        case 1030:
            // Crumbspore
            TASBot.harvest(4,4);
            TASBot.plant(0,1,0);
            TASBot.plant(1,0,0);
            break;
        case 1034:
            TASBot.forceRandom(0);
            break;
        case 1035:
            TASBot.harvest(1,1);
            TASBot.forceChoose(2);
            break;
        case 1036:
            TASBot.forceRandom(0.9999);
            break;
        case 1038:
            // Thumbcorn
            for(var x = 0; x < 6; x++)for(var y = 0; y < 6; y++)if(x!=1||y!=1)TASBot.harvest(x,y);
            TASBot.plant(5,4,0);
            TASBot.plant(4,5,12);
            break;
        case 1041:
            TASBot.forceRandom(0.003);
            break;
        case 1044:
            TASBot.forceRandom(0.9999);

            TASBot.plant(0,4,23);
            TASBot.plant(1,5,23);
            break;
        case 1048:
            // White Mildew
            TASBot.harvest(3,5);
            // Chocoroot
            TASBot.harvest(5,5);
            TASBot.plant(4,0,0);
            TASBot.plant(5,1,1);
            break;
        case 1052:
            TASBot.forceRandom(0.003);
            break;
        case 1053:
            TASBot.forceRandom(0.9999);
            TASBot.plant(1,3,1);
            TASBot.plant(3,5,12);

            TASBot.plant(0,0,9);
            break;
        case 1057:
            TASBot.forceRandom(0.003);
            break;
        case 1059:
            TASBot.forceRandom(0.9999);
            break;
        case 1061:
            TASBot.forceRandom(0.003);
            break;
        case 1062:
            TASBot.forceRandom(0.9999);
            // Bakeberry
            TASBot.harvest(1,1);
            break;
        case 1064:
            // Glovemorel
            TASBot.harvest(0,3);
            break;
        case 1065:
            // White Chocoroot
            for(var x = 3; x < 6; x++)for(var y = 3; y < 6; y++)TASBot.harvest(x,y);
            TASBot.plant(4,5,0);
            TASBot.plant(5,4,10);
            break;
        case 1070:
            TASBot.forceRandom(0.001);
            break;
        case 1071:
            TASBot.forceRandom(0.9999);
            TASBot.harvest(2,2);
            break;
        case 1076:
            // Wrinklegill
            TASBot.harvest(2,5);
            break;
        case 1088:
            // Doughshroom
            TASBot.harvest(0,5);
            TASBot.harvest(1,4);
            break;
        case 1104:
            TASBot.harvest(5,0);
            TASBot.plant(5,0,1);
            break;
        case 1107:
            TASBot.forceRandom(0.003);
            break;
        case 1108:
            TASBot.forceRandom(0.9999);
            // Cronerice
            TASBot.harvest(4,1);
            TASBot.harvest(5,0);

            TASBot.plant(0,0,2);
            TASBot.plant(3,5,2);
            break;
        case 1118:
            TASBot.plant(4,0,0);
            break;
        case 1122:
            TASBot.forceRandom(0);
            TASBot.forceChoose(0);
            break;
        case 1123:
            TASBot.harvest(5,0);
            TASBot.forceChoose(3);
            break;
        case 1124:
            TASBot.forceRandom(0.9999);
            // Gildmillet
            TASBot.harvest(5,1);
            TASBot.harvest(2,2);
            TASBot.harvest(0,3);
            TASBot.harvest(0,5);
            TASBot.harvest(2,4);
            TASBot.harvest(4,0);
            break;
        case 1127:
            TASBot.plant(5,1,3);
            break;
        case 1128:
            // Golden Clover
            TASBot.harvest(5,0);
            break;
        case 1137:
            TASBot.plant(4,0,11);
            break;
        case 1138:
            // Queenbeet
            TASBot.harvest(0,1);
            TASBot.harvest(1,0);
            for(var x = 0; x < 3; x++)for(var y = 3; y < 6; y++)if(x!=1||y!=4)TASBot.plant(x,y,20);
            break;
        case 1141:
            TASBot.forceRandom(0.003);
            break;
        case 1142:
            // Clover
            TASBot.harvest(4,1);
            TASBot.forceRandom(0.9999);
            break;
        case 1145:
            // Green Rot
            TASBot.harvest(5,0);
            TASBot.harvest(5,1);
            break;
        case 1146:
            TASBot.plant(4,1,23);
            break;
        case 1149:
            TASBot.plant(4,5,12);
            TASBot.forceRandom(0.003);
            break;
        case 1150:
            TASBot.plant(5,4,29);
            TASBot.forceRandom(0.9999);
            // Shimmer Lily
            TASBot.harvest(4,2);
            TASBot.harvest(5,2);
            TASBot.plant(5,0,6);
            break;
        case 1152:
            TASBot.plant(3,3,9);
            break;
        case 1153:
            TASBot.forceRandom(0.003);
            break;
        case 1155:
            TASBot.forceRandom(0.9999);
            TASBot.plant(1,1,6);
            break;
        case 1157:
            TASBot.plant(1,0,10);
            break;
        case 1158:
            TASBot.forceRandom(0.003);
            break;
        case 1159:
            TASBot.forceRandom(0.9999);
            break;
        case 1161:
            // Cheapcap
            for(var x = 3; x < 6; x++)for(var y = 0; y < 3; y++)if(x!=1||y!=4)TASBot.harvest(x,y);
            TASBot.plant(5,0,24);
            break;
        case 1163:
            TASBot.forceRandom(0.003);
            TASBot.forceChoose(0);
            break
        case 1164:
            TASBot.forceRandom(0.9999);
            // Keenmoss
            TASBot.harvest(4,4);

            TASBot.harvest(0,0);
            TASBot.harvest(1,0);
            TASBot.harvest(3,3);
            TASBot.harvest(5,3);
            TASBot.harvest(3,5);
            break;
        case 1170:
            TASBot.plant(1,2,6);
            break;
        case 1172:
            // Wardlichen
            TASBot.harvest(4,5);
            break;
        case 1179:
            TASBot.forceRandom(0.003);
            break;
        case 1180:
            // Whiskerbloom
            TASBot.harvest(2,0);
            TASBot.harvest(2,1);
            TASBot.harvest(3,0);
            TASBot.harvest(3,1);
            break;
        case 1190:
            TASBot.plant(4,1,29);
            break;
        case 1195:
            // Chimerose
            TASBot.harvest(1,1);
            TASBot.harvest(5,0);
            TASBot.harvest(4,1);
            break;
        case 1196:
            TASBot.forceChoose(0);
            TASBot.forceRandom(0);
            TASBot.soil(4);
            break;
        case 1197:
            TASBot.forceRandom(0.003);
            TASBot.harvest(3,5);
            TASBot.harvest(3,3);
            TASBot.harvest(4,3);
            for(var x = 0; x < 3; x++)for(var y = 3; y < 6; y++)if(x!=1||y!=4)TASBot.harvest(x,y);
            break;
        case 1198:
        case 1199:
        case 1200:
        case 1201:
        case 1202:
        case 1203:
        case 1205:
        case 1206:
        case 1207:
        case 1208:
        case 1209:
        case 1210:
        case 1211:
        case 1212:
            for(var x = 0; x < 6; x++)for(var y = 0; y < 6; y++)if(!(x==1&&y==1)&&!(x==0&&y==2)&&(TASBot.getPlant(x,y)=="Shriekbulb"||TASBot.getPlant(x,y)=="Duketater"))TASBot.harvest(x,y);
            TASBot.harvest(3,0);
            break;
        case 1204:
            // Fool's Bolete
            TASBot.harvest(5,1);
            break;
        case 1213:
            // Shriekbulb
            TASBot.harvest(1,1);
            // Tidygrass
            TASBot.harvest(5,5);
            // Drowsyfern
            TASBot.harvest(3,4);
            for(var x = 0; x < 6; x++)for(var y = 0; y < 6; y++)if(!(x==1&&y==1)&&!(x==0&&y==2)&&(TASBot.getPlant(x,y)=="Shriekbulb"||TASBot.getPlant(x,y)=="Duketater"))TASBot.harvest(x,y);
            break;
        case 1240:
            // Nursetulip
            TASBot.harvest(1,0);
            break;
        case 1269:
            // Elderwort
            TASBot.harvest(0,1);
            TASBot.plant(3,0,7);
            TASBot.plant(3,1,7);
            TASBot.plant(3,2,7);
            break;
        case 1282:
            // Juicy Queenbeet
            TASBot.harvest(1,4);
            break;
        case 1292:
            // Duketater
            TASBot.harvest(0,2);
            break;
        case 1319:
            TASBot.plant(5,0,31);
            TASBot.plant(5,1,31);
            TASBot.plant(5,2,31);
            break;
        case 1342:
            TASBot.plant(1,0,23);
            break;
        case 1359:
            TASBot.forceRandom(0.001);
            TASBot.forceChoose(1);
            break;
        case 1360:
            TASBot.forceRandom(0.003);
            TASBot.harvest(3,0);
            TASBot.harvest(3,1);
            TASBot.harvest(3,2);
            TASBot.harvest(5,0);
            TASBot.harvest(5,1);
            TASBot.harvest(5,2);
            TASBot.harvest(1,0);
            TASBot.harvest(2,0);
            TASBot.harvest(0,1);
            break;
        case 1378:
            // Ichorpuff
            TASBot.harvest(2,1);
            break;
        case 1435:
            // Everdaisy
            TASBot.harvest(4,1);
            TASBot.forceRandom(0.9999);
            break;
    }
    if(step>1435&&step%3==0) {
        for(var x = 0; x < 6; x++) {
            for(var y = 0; y < 6; y++) {
                TASBot.harvest(x,y);
                TASBot.plant(x,y,26);
            }
        }
    }
}

Game.registerMod(TASBot.name,TASBot);
Game.registerHook("reset",TASBot.begin);
Game.registerHook("draw",TASBot.tick);
Game.registerHook("logic",TASBot.subtick);