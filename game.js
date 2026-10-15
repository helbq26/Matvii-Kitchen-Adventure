(() => {
"use strict";

const canvas = document.getElementById("game");
const c = canvas.getContext("2d");
const W = 960, H = 540, FLOOR = 450;
c.imageSmoothingEnabled = false;

const defs = [
  {name:"БИТВА ЗА ХЛІБ", place:"Кухонна стільниця", item:"ХЛІБ", icon:"bread", tone:"#ffbe62", deep:"#d96456", wall:"#ffe8af", floor:"#b97a50", swaps:0,
   line:"Картопля збунтувалась! Збери три шматочки хліба."},
  {name:"ХОЛОДИЛЬНИК СМЕРТІ", place:"Крижана фортеця", item:"СИР", icon:"cheese", tone:"#89ecff", deep:"#3a8cc2", wall:"#caf8ff", floor:"#649bb3", swaps:1,
   line:"Знайди сир та вимкни шалений вентилятор."},
  {name:"ПОСУДОМИЙНИЙ АПОКАЛІПСИС", place:"Раковина", item:"ОВОЧІ", icon:"veggie", tone:"#79edcf", deep:"#258e9e", wall:"#b9f7ec", floor:"#468f97", swaps:2,
   line:"Забери овочі та перекрий два водяні вентилі."},
  {name:"ПЕКЕЛЬНА ПЛИТА", place:"Гаряча зона", item:"СОУС", icon:"sauce", tone:"#ff9d55", deep:"#b72e64", wall:"#ffd29d", floor:"#99465c", swaps:2,
   line:"Забери соуси та вимкни дві небезпечні конфорки."},
  {name:"ОСТАННІЙ ХРУМ", place:"Лігво ХРУМ-3000", item:"ПЕРЕМОГА", icon:"star", tone:"#e4a1ff", deep:"#8e53c3", wall:"#c5a9fa", floor:"#685489", swaps:0,
   line:"Ухиляйся від тостів. Бий тостер, коли він перегріється!"}
];
const enemyStyles = [
  [{type:"potato",color:"#c79552",hp:1},{type:"pea",color:"#72c846",hp:1}],
  [{type:"ice",color:"#8ff5ff",hp:1},{type:"yogurt",color:"#f6c6f1",hp:2}],
  [{type:"sponge",color:"#e9d74d",hp:1},{type:"duck",color:"#ffba36",hp:2}],
  [{type:"pepper",color:"#ef5955",hp:1},{type:"toast",color:"#e7b26c",hp:2}],
  [{type:"toast",color:"#e7b26c",hp:1}]
];
let mode = "title", stageIndex = 0, stage = null, hero = null;
let camera = 0, tick = 0, score = 0, banner = 0, message = "", messageFrames = 0;
let particles = [], floating = [], musicOn = true, soundContext = null, musicCounter = 0;
let secretCount=0,runFrames=0,damageTaken=0,shake=0;
let unlocked = 0;
try { unlocked = Math.min(4, Math.max(0,Number(localStorage.getItem("matviiLevel") || 0))); } catch(e) {}
const held = new Set(), pressed = new Set();

// Physical key codes work with Ukrainian, English and other keyboard layouts.
function keyName(e) {
  const mapping = {
    KeyA:"a", KeyD:"d", KeyW:"w", KeyJ:"j", KeyE:"e",
    KeyP:"p", KeyR:"r", KeyM:"m", KeyC:"c",
    ArrowLeft:"arrowleft", ArrowRight:"arrowright",
    ArrowUp:"arrowup", Space:"space", Enter:"enter", Escape:"escape"
  };
  return mapping[e.code] || (e.key === " " ? "space" : e.key.toLowerCase());
}
window.addEventListener("keydown", e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = keyName(e);
  if (["space","arrowleft","arrowright","arrowup","enter"].includes(k)) e.preventDefault();
  if (!held.has(k)) pressed.add(k);
  held.add(k);
  if (!soundContext) initSound();
});
window.addEventListener("keyup", e => held.delete(keyName(e)));
window.addEventListener("blur", () => { held.clear(); pressed.clear(); if(mode==="playing")mode="pause"; });
canvas.addEventListener("pointerdown", () => {
  canvas.focus();
  initSound();
  if(mode==="title") startGame(false);
  else if(mode==="pause") mode="playing";
  else if(mode==="victory") mode="title";
});

function initSound() {
  if (soundContext) return;
  try { const AudioCtx=window.AudioContext||window.webkitAudioContext; if(AudioCtx)soundContext=new AudioCtx(); } catch(e) {}
}
function beep(freq=440,length=.09,wave="square",volume=.035) {
  if(!soundContext||!musicOn)return;
  try {
    if(soundContext.state==="suspended")soundContext.resume();
    const o=soundContext.createOscillator(), g=soundContext.createGain();
    o.type=wave;o.frequency.setValueAtTime(freq,soundContext.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(80,freq*.67),soundContext.currentTime+length);
    g.gain.setValueAtTime(volume,soundContext.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,soundContext.currentTime+length);
    o.connect(g);g.connect(soundContext.destination);
    o.start();o.stop(soundContext.currentTime+length+.02);
  } catch(e) {}
}
function music() {
  if(!soundContext||!musicOn||mode!=="playing")return;
  musicCounter++;
  if(musicCounter%18!==0)return;
  const notes=[330,392,440,392,330,294,262,294,330,392,523,440,392,330,294,262];
  const note=notes[Math.floor(musicCounter/18)%notes.length];
  beep(note,.12,"triangle",.012);
}

function makeStage(i) {
  const last = i===4, width=last?2180:3500;
  const chunks = i===0||last ? [[0,width]] : [[0,900],[982,1900],[1982,2795],[2877,width]];
  const solids = chunks.map(([x,x2])=>({x,y:FLOOR,w:x2-x,h:110,ground:true}));
  const ledges = last
    ? [[420,358,170],[780,333,190],[1180,361,150]]
    : [[505,352,255],[1020,335,220],[1570,350,268],[2100,337,230],[2615,356,250],[3050,342,210]];
  for(const [x,y,w] of ledges) solids.push({x,y,w,h:18,ground:false});
  const items = last ? [] : [[633,318],[1703,314],[2738,319]].map(([x,y])=>({x,y,taken:false}));
  const switchXs = i===1?[1200]:i===2?[1200,2340]:i===3?[1200,2430]:[];
  const switches = switchXs.map(x=>({x,y:405,on:false}));
  const enemyXs = last?[510,870,1110]:[370,1120,1430,2200,2560,3060];
  const enemies=enemyXs.map((x,n)=>{
    const st=enemyStyles[i][n%enemyStyles[i].length];
    return {x,y:FLOOR-32,w:34,h:32,base:x,range:35+(n%3)*22,dir:n%2?1:-1,
      speed:.55+(n%3)*.20,type:st.type,color:st.color,hp:st.hp,alive:true,phase:n*.9};
  });
  const hazards=last?[]: i===0?[{x:833,type:"oil"},{x:2248,type:"oil"}]:
    i===1?[{x:825,type:"ice"},{x:2310,type:"ice"}]:
    i===2?[{x:850,type:"water"},{x:2355,type:"water"}]:
    [{x:815,type:"fire"},{x:2315,type:"fire"}];
  const secretPos=[[739,298],[1213,287],[2314,294],[2847,306]];
  const secrets=last?[]:[{x:secretPos[i][0],y:secretPos[i][1],taken:false}];
  const boosts=i===1?[{x:1780,y:314,taken:false}]:[];
  const shooters=i===2?[{x:1345,y:417,time:0},{x:2615,y:417,time:57}]:[];
  return {idx:i,width,solids,items,switches,enemies,hazards,secrets,boosts,shooters,bubbles:[],exit:3300,
    boss:last?{x:1625,y:249,w:151,h:193,hp:3,maxHp:3,time:0,awake:false,open:false,hitCooldown:0,shots:[]}:null};
}
function newHero(x=110) { return {x,y:330,w:33,h:49,vx:0,vy:0,dir:1,ground:false,coyote:0,
    hearts:3,invuln:80,attack:0,cooldown:0,checkpoint:110,walking:0,super:0}; }
function setStage(i) {
  stageIndex=i;stage=makeStage(i);hero=newHero();camera=0;
  particles=[];floating=[];banner=175;message="";messageFrames=0;
  try { localStorage.setItem("matviiLevel",String(Math.max(unlocked,i))); } catch(e) {}
  unlocked=Math.max(unlocked,Math.min(4,i));
}
function startGame(continueGame) {
  score=0;tick=0;musicCounter=0;secretCount=0;runFrames=0;damageTaken=0;
  setStage(continueGame?unlocked:0);mode="playing";beep(700,.13,"triangle");
}
function stageWin() {
  score+=500;beep(880,.3,"triangle",.05);
  if(stageIndex===4) {shake=35;emit(1625,270,"#ffea93",90);mode="victory";return;}
  setStage(stageIndex+1);
}
function toast(text,frames=110) { message=text;messageFrames=frames; }
function emit(x,y,color,n=12) {
  for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*6,vy:-Math.random()*5-.7,
    life:25+Math.random()*22,col:color,s:2+Math.random()*5});
}
function floatScore(x,y,amount) {floating.push({x,y,t:70,text:"+"+amount});score+=amount;}
function injure() {
  if(hero.invuln>0)return;
  hero.hearts--;damageTaken++;shake=13;hero.invuln=88;hero.vy=-6;hero.vx=-hero.dir*6;
  emit(hero.x+17,hero.y+20,"#ff6c88",17);beep(155,.19,"sawtooth",.07);
  if(hero.hearts<=0)respawn();
}
function respawn() {
  hero.hearts=3;hero.x=hero.checkpoint;hero.y=285;hero.vx=0;hero.vy=0;hero.invuln=130;
  toast("МАТВІЙ ПОВЕРТАЄТЬСЯ У БІЙ!",110);
}
function completeConditions() {
  return stage.items.every(it=>it.taken)&&stage.switches.every(sw=>sw.on);
}
function strike() {
  if(hero.cooldown>0)return;
  hero.cooldown=21;hero.attack=12;beep(430,.055,"square",.024);
  const attackW=hero.super>0?103:68,attackX=hero.dir===1?hero.x+hero.w:hero.x-attackW;
  const attackY=hero.y+2;
  let hit=false;
  for(const e of stage.enemies) {
    if(!e.alive)continue;
    if(attackX<e.x+e.w&&attackX+attackW>e.x&&attackY<e.y+e.h&&attackY+55>e.y) {
      damageEnemy(e);hit=true;
    }
  }
  const b=stage.boss;
  if(b&&b.hp>0&&b.awake&&b.open&&b.hitCooldown<=0
     &&hero.dir===1&&hero.x+hero.w>=b.x-78&&hero.x<b.x
     &&hero.y+hero.h>=b.y+105) {
    b.hp--;shake=22;b.hitCooldown=65;emit(b.x+40,b.y+90,"#ffeb83",36);
    floatScore(b.x,b.y,400);beep(230,.4,"sawtooth",.06);hit=true;
    toast(b.hp>0?"ЧУДОВИЙ УДАР! ЩЕ "+b.hp+"!":"ХРУМ-3000 ПЕРЕМОЖЕНИЙ!",85);
    if(b.hp===0) {stageWin();return;}
  }
  if(hit)beep(620,.13,"square",.05);
}
function damageEnemy(e) {
  e.hp-=hero.super>0?2:1;shake=5;emit(e.x+e.w/2,e.y+12,e.color,17);
  if(e.hp<=0){e.alive=false;floatScore(e.x,e.y,100);beep(560,.11,"triangle",.04);}
  else {e.dir*=-1;beep(330,.12,"sawtooth",.025);}
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function intersects(a,b) {return a.x<a.x+a.w&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function update(dt) {
  tick+=dt;
  if(pressed.has("m")){musicOn=!musicOn;toast(musicOn?"ЗВУК УВІМКНЕНО":"ЗВУК ВИМКНЕНО",80);}
  if(mode==="title"){
    if(pressed.has("enter"))startGame(false);
    else if(pressed.has("c")&&unlocked>0)startGame(true);
    pressed.clear();return;
  }
  if(mode==="victory"){
    if(pressed.has("enter"))mode="title";
    pressed.clear();return;
  }
  if(pressed.has("p")||pressed.has("escape")){
    mode=mode==="pause"?"playing":mode==="playing"?"pause":mode;
    pressed.clear();return;
  }
  if(mode!=="playing"){pressed.clear();return;}
  music();runFrames+=dt;
  if(hero.super>0)hero.super=Math.max(0,hero.super-dt);
  shake=Math.max(0,shake-dt);
  if(pressed.has("r")){setStage(stageIndex);pressed.clear();return;}
  if(banner>0)banner-=dt;
  if(messageFrames>0)messageFrames-=dt;
  if(hero.attack>0)hero.attack-=dt;
  if(hero.cooldown>0)hero.cooldown-=dt;
  if(hero.invuln>0)hero.invuln-=dt;
  const left=held.has("a")||held.has("arrowleft"),right=held.has("d")||held.has("arrowright");
  let velocity=left?-4.5:right?4.5:0;
  if(left&&right)velocity=0;
  if(stage.hazards.some(z=>z.type==="oil"&&Math.abs((hero.x+16)-z.x)<35&&hero.y+hero.h>430))velocity*=.57;
  hero.vx+=(velocity-hero.vx)*.34*dt;
  if(Math.abs(hero.vx)<.05)hero.vx=0;
  if(velocity!==0)hero.dir=velocity>0?1:-1;
  if((pressed.has("space")||pressed.has("w")||pressed.has("arrowup"))&&hero.coyote>0){
    hero.vy=-13.2;hero.coyote=0;hero.ground=false;beep(420,.13,"square",.026);
    emit(hero.x+16,hero.y+49,"#fff6b5",7);
  }
  if(pressed.has("j"))strike();
  if(pressed.has("e")) {
    let activated=false;
    for(const sw of stage.switches){
      if(!sw.on&&Math.abs(hero.x+17-sw.x)<73&&Math.abs(hero.y+hero.h-sw.y)<85){
        sw.on=true;activated=true;emit(sw.x,sw.y,"#fff681",20);floatScore(sw.x,sw.y,150);
      }
    }
    if(activated){beep(900,.22,"triangle",.045);toast("МЕХАНІЗМ ВИМКНЕНО!",105);}
  }
  const wasBottom=hero.y+hero.h;
  hero.x=clamp(hero.x+hero.vx*dt,0,stage.width-hero.w);
  hero.vy=clamp(hero.vy+.68*dt,-15,15);
  hero.y+=hero.vy*dt;
  hero.ground=false;
  for(const s of stage.solids){
    if(hero.vy>=0&&wasBottom<=s.y+12&&hero.y+hero.h>=s.y&&hero.y+hero.h<=s.y+45
      &&hero.x+hero.w>s.x+6&&hero.x<s.x+s.w-6) {
      hero.y=s.y-hero.h;hero.vy=0;hero.ground=true;
    }
  }
  hero.coyote=hero.ground?7:Math.max(0,hero.coyote-dt);
  hero.walking+=Math.abs(hero.vx)*dt;
  if(hero.y>H+60)respawn();
  if(hero.x>1720&&hero.checkpoint<1700){hero.checkpoint=1740;toast("КОНТРОЛЬНА ТОЧКА!",85);beep(780,.14,"triangle");}
  for(const it of stage.items){
    if(it.taken)continue;
    if(Math.abs(hero.x+17-it.x)<37&&Math.abs(hero.y+25-it.y)<44){
      it.taken=true;emit(it.x,it.y,"#fff49c",25);floatScore(it.x,it.y,200);beep(980,.17,"triangle",.047);
      if(stage.items.every(t=>t.taken))toast("УСІ ІНГРЕДІЄНТИ ЗІБРАНО!",130);
    }
  }
  for(const st of stage.secrets){
    if(st.taken)continue;
    if(Math.abs(hero.x+17-st.x)<34&&Math.abs(hero.y+23-st.y)<43) {
      st.taken=true;secretCount++;floatScore(st.x,st.y,450);
      emit(st.x,st.y,"#fff1a0",35);shake=9;beep(1047,.34,"triangle",.048);
      toast("СЕКРЕТ ЗНАЙДЕНО! +450",125);
    }
  }
  for(const boost of stage.boosts){
    if(boost.taken)continue;
    if(Math.abs(hero.x+17-boost.x)<36&&Math.abs(hero.y+23-boost.y)<49){
      boost.taken=true;hero.super=840;floatScore(boost.x,boost.y,300);
      emit(boost.x,boost.y,"#ffd55b",35);beep(880,.38,"triangle",.055);
      toast("ЗОЛОТА СУПЕР-ЛОПАТКА! 14 СЕКУНД",175);
    }
  }
  for(const shooter of stage.shooters){
    shooter.time+=dt;
    if(Math.abs(hero.x-shooter.x)<600&&shooter.time>=115){
      shooter.time=0;
      stage.bubbles.push({x:shooter.x,y:shooter.y-15,w:21,h:21,vx:hero.x<shooter.x?-2.8:2.8,life:170,phase:tick});
      beep(320,.1,"sine",.022);
    }
  }
  for(const bubble of stage.bubbles){
    bubble.x+=bubble.vx*dt;
    bubble.y+=Math.sin((tick-bubble.phase)/9)*.4*dt;
    bubble.life-=dt;
    if(intersects(hero,bubble)){injure();bubble.life=0;emit(bubble.x,bubble.y,"#d3ffff",9);}
  }
  stage.bubbles=stage.bubbles.filter(b=>b.life>0);
  for(const e of stage.enemies){
    if(!e.alive)continue;
    e.x+=e.dir*e.speed*dt;
    if(e.x>e.base+e.range||e.x<e.base-e.range)e.dir*=-1;
    if(intersects(hero,e)){
      if(hero.vy>2&&wasBottom<=e.y+10) {
        hero.vy=-9;damageEnemy(e);beep(490,.09,"triangle");
      } else injure();
    }
  }
  for(const hz of stage.hazards){
    if(hz.type==="oil")continue;
    if(!hazardActive(hz))continue;
    if(Math.abs(hero.x+17-hz.x)<25&&hero.y+hero.h>FLOOR-35)injure();
  }
  if(stage.boss)updateBoss(dt);
  else if(hero.x>stage.exit-46){
    if(completeConditions()) {stageWin();pressed.clear();return;}
    hero.x=stage.exit-47;hero.vx=0;
    if(messageFrames<10)toast("ЗБЕРИ ПРЕДМЕТИ ТА УВІМКНИ ВАЖЕЛІ!",95);
  }
  particles=particles.filter(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=.17*dt;q.life-=dt;return q.life>0;});
  floating=floating.filter(f=>{f.y-=.65*dt;f.t-=dt;return f.t>0;});
  camera=clamp(camera+(hero.x-315-camera)*.09*dt,0,stage.width-W);
  pressed.clear();
}
function hazardActive(z){return z.type==="ice"||Math.sin(tick/25+z.x)>-.12;}
function updateBoss(dt) {
  const b=stage.boss;
  if(!b||b.hp<=0)return;
  if(hero.x>1100&&!b.awake){b.awake=true;toast("БОС: ХРУМ-3000! ЧЕКАЙ ПЕРЕГРІВУ!",150);beep(130,.55,"sawtooth",.05);}
  if(!b.awake)return;
  b.time+=dt;b.hitCooldown=Math.max(0,b.hitCooldown-dt);
  b.open=(b.time%300)>155&&(b.time%300)<257;
  const period=b.hp===1?65:95;
  if(Math.floor(b.time/period)!==Math.floor((b.time-dt)/period)){
    b.shots.push({x:b.x+3,y:FLOOR-39,w:30,h:23,vx:b.hp===1?-7:-5.2});
    if(b.hp===1)b.shots.push({x:b.x+7,y:FLOOR-123,w:28,h:23,vx:-5.4});
    beep(175,.12,"sawtooth",.029);
  }
  for(const sh of b.shots){
    sh.x+=sh.vx*dt;
    if(intersects(hero,sh))injure();
  }
  b.shots=b.shots.filter(sh=>sh.x>-40);
  if(hero.x+hero.w>b.x+25&&hero.x<b.x+b.w-15&&hero.y+hero.h>b.y+95)injure();
  if(hero.x>b.x+b.w+12){hero.x=b.x+b.w+12;hero.vx=0;}
}
function box(x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function text(str,x,y,size=20,color="#fff",align="left",stroke=false){
  c.save();c.font="900 "+size+"px 'Courier New',monospace";c.textAlign=align;c.textBaseline="middle";
  if(stroke){c.lineWidth=5;c.strokeStyle="#27182e";c.strokeText(str,x,y);}
  c.fillStyle=color;c.fillText(str,x,y);c.restore();
}
function rounded(x,y,w,h,r,col){
  c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=col;c.fill();
}
function backdrop() {
  if(window.KitchenArt){window.KitchenArt.background(c,stageIndex,camera,tick,W,H);return;}
  const d=defs[stageIndex], gradient=c.createLinearGradient(0,0,0,H);
  gradient.addColorStop(0,d.wall);gradient.addColorStop(.85,d.tone);gradient.addColorStop(1,d.deep);
  c.fillStyle=gradient;c.fillRect(0,0,W,H);
  c.globalAlpha=.12;
  for(let x=-(camera*.18%80);x<W;x+=80)box(x,0,2,H,"#fff");
  for(let y=44;y<500;y+=68)box(0,y,W,2,"#694882");
  c.globalAlpha=1;
  for(let i=-1;i<12;i++){
    let x=i*330-(camera*.31%330);
    const k=(i+99)%4;
    if(stageIndex===0){
      box(x+50,88,220,145,"#edaa65");box(x+59,98,201,125,"#ffe1a0");
      box(x+145,102,11,108,"#c17a52");box(x+120,177,15,11,"#aa6847");box(x+172,177,15,11,"#aa6847");
      box(x+90,268,100,130,k%2?"#e5acb2":"#81cbb0");
      box(x+100,280,80,18,"#ffffff98");box(x+118,302,42,65,"#ffe7bd");
    } else if(stageIndex===1) {
      box(x+35,48,260,400,"#e4fcff");box(x+47,68,234,357,"#96ccdc");
      for(let j=0;j<4;j++)box(x+47,134+j*76,234,9,"#f9ffff");
      box(x+74,91,60,38,"#ffeeaa");box(x+196,90,45,44,"#fd91c8");
      box(x+90,249,100,35,"#91e8f4");box(x+125,331,75,54,"#ffffffc9");
    } else if(stageIndex===2){
      box(x+35,80,250,290,"#55b8b0");box(x+48,93,226,160,"#a8f5df");
      box(x+83,110,16,98,"#e4fffb");box(x+84,106,98,14,"#efffff");
      box(x+140,262,90,22,"#fff2b3");
      for(let j=0;j<6;j++){c.beginPath();c.arc(x+55+(j*39),390-j%3*34,10+(j%3)*7,0,7);c.fillStyle="#e2ffffaa";c.fill();}
    } else if(stageIndex===3){
      box(x+44,85,245,314,"#772b55");box(x+58,102,218,245,"#c34669");
      for(let j=0;j<3;j++)box(x+80,128+j*65,174,35,j%2?"#ffb35c":"#ff805a");
      for(let j=0;j<4;j++){box(x+74+j*53,360,34,22,"#302038");box(x+83+j*53,365,12,12,"#f6b14f");}
    } else {
      box(x+42,88,245,307,"#4f316f");box(x+62,100,205,265,"#9d59bf");
      for(let j=0;j<3;j++){box(x+75,125+j*78,177,11,"#eabaff");box(x+89+j*40,147+j*72,34,22,"#f4689b");}
      box(x+142,58,18,58,"#391a56");box(x+132,42,38,22,"#ff6a85");
    }
  }
  c.globalAlpha=.35;
  for(let j=0;j<21;j++){
    let xx=(j*179+44-camera*(.12+(j%3)*.04))%(W+180);if(xx<0)xx+=W+180;
    let yy=65+(j*71)%335+Math.sin(tick/46+j)*10;
    if(stageIndex===1){box(xx,yy,9,9,"#fff");box(xx+3,yy-5,3,18,"#fff");}
    else if(stageIndex===2){c.beginPath();c.arc(xx,yy,8+(j%3)*3,0,7);c.strokeStyle="#fff";c.lineWidth=3;c.stroke();}
    else{box(xx,yy,5,5,"#fffbb1");}
  }
  c.globalAlpha=1;
  box(0,449,W,91,stageIndex===3?"#40213e":"#302645");
}
function drawLevel() {
  const d=defs[stageIndex];
  for(const s of stage.solids){
    const x=Math.round(s.x-camera);if(x+s.w<0||x>W)continue;
    if(s.ground){
      box(x,s.y,s.w,110,"#432f48");
      box(x,s.y,s.w,17,d.floor);box(x,s.y+17,s.w,8,"#3d2749");
      for(let v=0;v<s.w;v+=35)box(x+v+10,s.y+35+(v%3)*11,16,5,"#ffffff25");
      for(let v=0;v<s.w;v+=65)box(x+v,s.y,s.w>30?24:3,5,d.tone);
    } else{
      box(x+3,s.y+7,s.w,19,"#392545");box(x,s.y,s.w,13,d.floor);
      box(x+3,s.y,s.w-6,5,d.tone);
      for(let v=24;v<s.w;v+=65)box(x+v,s.y+15,6,6,"#ead5a0");
    }
  }
  for(const z of stage.hazards) {
    const x=z.x-camera;if(x<-70||x>W+70)continue;
    if(z.type==="oil"){c.fillStyle="#50336d";c.beginPath();c.ellipse(x,FLOOR-3,39,8,0,0,7);c.fill();box(x-19,FLOOR-8,22,3,"#d7b5ed");}
    else if(z.type==="ice"){for(let j=-1;j<=1;j++){c.fillStyle="#ddffff";c.beginPath();c.moveTo(x+j*18-8,FLOOR);c.lineTo(x+j*18,FLOOR-28-(j===0?8:0));c.lineTo(x+j*18+8,FLOOR);c.fill();}}
    else if(hazardActive(z)){
      if(z.type==="water"){box(x-13,FLOOR-65,25,65,"#93e5ff77");box(x-6,FLOOR-65,10,65,"#f0ffff");}
      else{for(let j=-1;j<=1;j++){c.fillStyle=j%2?"#ffbd49":"#ff574d";c.beginPath();c.moveTo(x+j*13-11,FLOOR);c.lineTo(x+j*13+Math.sin(tick/6+j)*5,FLOOR-35-8*(j===0));c.lineTo(x+j*13+11,FLOOR);c.fill();}}
    }
  }
  if(stageIndex<4) {
    const x=stage.exit-camera;
    box(x-14,306,84,144,"#2f264e");box(x-7,313,70,134,completeConditions()?"#68daba":"#fc7791");
    box(x+6,328,43,106,"#302640");box(x+44,371,8,8,"#ffdf78");
    text(completeConditions()?"ВИХІД":"ЗАЧИНЕНО",x+26,287,15,completeConditions()?"#4dffe0":"#fff1a1","center",true);
    if(completeConditions()) {
      c.globalAlpha=.45+Math.sin(tick/8)*.2;box(x+7,328,41,105,"#baffd9");c.globalAlpha=1;
    }
  }
  for(const sw of stage.switches){
    const x=sw.x-camera;
    box(x-19,422,38,28,sw.on?"#51d2a6":"#724c7e");box(x-13,425,26,19,"#2e2147");
    c.save();c.translate(x,421);c.rotate(sw.on?.7:-.7);
    box(-4,-28,8,33,"#dadde1");box(-9,-33,18,15,sw.on?"#74f1b8":"#ffb45d");c.restore();
    if(!sw.on&&Math.abs(hero.x+17-sw.x)<85)text("E: ВИМКНУТИ",x,387,16,"#fff9b4","center",true);
  }
  for(const it of stage.items)if(!it.taken)drawItem(it,d.icon);
  for(const secret of stage.secrets)if(!secret.taken){
    const x=secret.x-camera,y=secret.y+Math.sin(tick/12)*7;
    c.globalAlpha=.65;rounded(x-17,y-20,34,38,9,"#ffe38b55");c.globalAlpha=1;
    if(window.KitchenArt){window.KitchenArt.star(c,x,y,"#fff5a1",.9);}
    else text("✦",x,y,24,"#fff5a1","center");
  }
  for(const boost of stage.boosts)if(!boost.taken){
    const x=boost.x-camera,y=boost.y+Math.sin(tick/15)*5;
    rounded(x-21,y-25,42,50,8,"#49345d");
    rounded(x-14,y-16,28,29,6,"#fce079");
    box(x-4,y+3,8,19,"#ffeec2");text("★",x,y-5,22,"#a45a4a","center");
  }
  for(const shooter of stage.shooters){
    const x=shooter.x-camera;
    rounded(x-17,421,34,29,7,"#467c98");rounded(x-11,410,22,19,6,"#b7f1fd");
    box(x-8,413,15,7,"#2b7795");
  }
  for(const bubble of stage.bubbles){
    const x=bubble.x-camera;
    c.strokeStyle="#eaffff";c.lineWidth=3;c.beginPath();c.arc(x+11,bubble.y+11,10,0,7);c.stroke();
    box(x+6,bubble.y+5,5,4,"#ffffff");
  }
  for(const e of stage.enemies)if(e.alive)drawEnemy(e);
  if(stage.boss)drawBoss(stage.boss);
}
function drawItem(it,icon) {
  if(window.KitchenArt){window.KitchenArt.item(c,it,icon,tick,camera);return;}
  const x=it.x-camera,y=it.y+Math.sin(tick/13+it.x)*5;
  c.save();c.translate(x,y);
  c.globalAlpha=.26; c.fillStyle="#fff8b9";c.beginPath();c.arc(0,0,30,0,7);c.fill();c.globalAlpha=1;
  if(icon==="bread"){
    rounded(-17,-18,34,37,8,"#99582c");rounded(-14,-16,28,31,7,"#f4c276");
    box(-10,0,20,10,"#ffe6a0");
  } else if(icon==="cheese"){
    c.beginPath();c.moveTo(-18,17);c.lineTo(14,-19);c.lineTo(20,17);c.closePath();c.fillStyle="#ffe26a";c.fill();
    for(const [cx,cy] of [[0,7],[7,-4],[14,12]]){c.beginPath();c.arc(cx,cy,4,0,7);c.fillStyle="#eaa942";c.fill();}
  } else if(icon==="veggie"){
    rounded(-18,-11,36,28,7,"#f45058");box(-2,-20,5,13,"#41aa66");box(-11,-17,12,6,"#60d779");
    box(7,-14,10,9,"#ffb85a");
  } else {
    rounded(-15,-20,30,40,5,"#ffe5af");box(-19,-24,38,12,"#a33e65");box(-10,-4,20,19,"#e55942");
    text("S",0,5,16,"#fff1c3","center");
  }
  c.restore();
}
function drawEnemy(e) {
  if(window.KitchenArt){window.KitchenArt.enemy(c,e,e.x-camera,e.y,tick);return;}
  let x=Math.round(e.x-camera),y=Math.round(e.y+Math.sin(tick/10+e.phase)*2);
  c.save();c.translate(x,y);
  const col=e.color;
  box(2,28,10,5,"#312340");box(23,28,10,5,"#312340");
  rounded(0,3,34,28,e.type==="toast"?3:11,"#2b2341");
  rounded(3,5,28,23,e.type==="toast"?3:10,col);
  if(e.type==="potato") {box(7,9,4,4,"#8f5a31");box(24,19,4,4,"#8f5a31");}
  if(e.type==="ice"){box(5,6,23,4,"#fff");box(9,0,13,9,"#d9fdff");}
  if(e.type==="duck") {box(-9,17,14,8,"#ff8d53");box(21,-5,9,12,"#ffdb56");}
  if(e.type==="sponge"){for(let i=0;i<5;i++)box((i*8)%28+4,8+(i%2)*9,5,5,"#b8a63c");}
  if(e.type==="pepper"){box(14,-4,8,9,"#4fc065");}
  if(e.type==="yogurt"){box(4,4,26,5,"#fff2ff");box(11,-3,14,8,"#fff");}
  if(e.type==="toast"){rounded(3,5,28,23,3,"#ffe1a0");box(7,7,20,4,"#b97947");}
  box(8,13,6,7,"#fff");box(20,13,6,7,"#fff");box(11+(e.dir<0?0:2),15,3,5,"#251a36");box(23+(e.dir<0?0:2),15,3,5,"#251a36");
  box(13,25,10,3,"#56273e");
  if(e.hp>1){box(6,0,22,3,"#ff6a93");}
  c.restore();
}
function drawHero(p=hero,overrideX=null,overrideY=null,scale=1) {
  if(!p)return;
  if(window.KitchenArt){
    window.KitchenArt.hero(c,p,overrideX===null?p.x-camera+16:overrideX,overrideY===null?p.y:overrideY,scale,tick,mode);return;
  }
  if(p.invuln>0&&Math.floor(tick/5)%2===0&&mode==="playing")return;
  const x=(overrideX===null?p.x-camera+16:overrideX);
  const y=(overrideY===null?p.y:overrideY);
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(p.dir*scale,scale);
  const legSwing=p.ground&&Math.abs(p.vx)>1?Math.sin(p.walking/7)*5:0;
  box(-12,38,11,10,"#33284b");box(3,38,12,10,"#33284b");
  box(-13+legSwing,46,16,5,"#fff");box(3-legSwing,46,16,5,"#fff");
  box(-16,17,33,27,"#4ca9cf");box(-13,21,27,24,"#ffe7b1");
  box(-4,24,8,13,"#f5bd55");text("M",0,32,17,"#8d3d6d","center");
  box(-21,22,7,19,"#f4b688");box(16,22,7,19,"#f4b688");
  rounded(-17,-2,34,25,5,"#efb38c");
  box(-17,0,34,8,"#6c4234");box(-19,3,7,13,"#6c4234");
  box(-20,-9,40,11,"#fff9de");box(-16,-19,34,16,"#fff7dc");
  box(-12,-11,28,8,"#ffffff");box(-4,-21,8,6,"#fff");
  box(-9,9,5,7,"#fff");box(5,9,5,7,"#fff");
  box(-7,11,3,5,"#30273d");box(7,11,3,5,"#30273d");box(-3,18,7,3,"#a54b52");
  if(p.attack>0){
    c.save();c.translate(18,27);c.rotate(-.65+Math.sin(p.attack/11*Math.PI)*1.45);
    box(-2,-7,8,20,"#ad6f4d");box(-15,-21,37,13,"#dae6eb");box(-16,-24,38,5,"#fff");
    c.restore();
  } else {
    box(19,29,7,17,"#c48f51");box(16,26,15,7,"#e2e7e6");
  }
  c.restore();
}
function drawBoss(b) {
  if(window.KitchenArt){window.KitchenArt.boss(c,b,b.x-camera,b.y,tick);return;}
  const x=Math.round(b.x-camera),y=Math.round(b.y+Math.sin(tick/13)*3);
  if(x>W+180||x<-220)return;
  const awake=b.awake, open=b.open;
  box(x+19,y+173,31,24,"#322543");box(x+99,y+173,31,24,"#322543");
  box(x-29,y+77,48,25,"#4d315f");box(x+133,y+77,50,25,"#4d315f");
  box(x-39,y+100,27,47,"#c87995");box(x+163,y+100,27,47,"#c87995");
  rounded(x-3,y-3,157,183,17,"#291f42");rounded(x+7,y+6,139,164,13,open?"#ffc165":"#b66dc0");
  rounded(x+17,y+17,119,58,9,"#42284d");
  box(x+29,y+25,31,33,open?"#ffe891":"#ff6989");box(x+91,y+25,31,33,open?"#ffe891":"#ff6989");
  box(x+36,y+31,15,24,"#331a42");box(x+98,y+31,15,24,"#331a42");
  box(x+44,y+92,64,16,"#39233f");box(x+52,y+94,48,11,open?"#fff09c":"#dfc2ed");
  rounded(x+35,y+121,88,37,7,"#4d325d");
  text("ХРУМ",x+77,y+141,20,"#fff8b2","center");
  if(awake) {
    if(open)text("ПЕРЕГРІВ! БИЙ J!",x+74,y-35,18,"#ffe66b","center",true);
    else text("НЕБЕЗПЕКА!",x+76,y-31,16,"#ffacc5","center",true);
  }
  for(const sh of b.shots){
    const sx=sh.x-camera;rounded(sx,sh.y,sh.w,sh.h,6,"#a06a43");
    rounded(sx+4,sh.y+3,sh.w-8,sh.h-6,4,"#f9c279");box(sx+9,sh.y+8,5,5,"#884e3e");
  }
}
function hud() {
  if(window.KitchenArt){
    window.KitchenArt.hud(c,{idx:stageIndex,stageName:defs[stageIndex].name,
    itemName:defs[stageIndex].item,line:defs[stageIndex].line,hero,stage,score,t:tick,
    banner,message,messageFrames,floating,camera,power:hero.super,secretCount,runFrames});return;
  }
  rounded(13,12,934,72,13,"#211b3ddd");
  box(16,15,7,66,defs[stageIndex].tone);
  text("РІВЕНЬ "+(stageIndex+1)+"/5  "+defs[stageIndex].name,36,34,19,"#ffea9a");
  text("♥".repeat(hero.hearts)+"♡".repeat(3-hero.hearts),35,64,26,"#ff718a");
  if(stageIndex<4){
    text(defs[stageIndex].item+": "+stage.items.filter(t=>t.taken).length+"/3",420,36,18,"#ffffff");
    if(stage.switches.length)text("ВАЖЕЛІ: "+stage.switches.filter(t=>t.on).length+"/"+stage.switches.length,420,65,17,"#b3f9ec");
    else text("ЗБЕРИ ІНГРЕДІЄНТИ",420,64,15,"#b3f9ec");
  } else {
    const b=stage.boss;
    text("БОС ХРУМ-3000",418,37,18,"#fff");
    for(let h=0;h<3;h++)rounded(420+h*49,53,37,14,3,h<b.hp?"#ff7198":"#58475d");
  }
  text("★ "+score,917,48,21,"#ffe274","right");
  if(messageFrames>0){
    rounded(180,98,600,40,9,"#2d2345e8");
    text(message,480,119,18,"#fff4a7","center");
  }
  for(const f of floating)text(f.text,f.x-camera,f.y,20,"#ffe97a","center",true);
  if(banner>0) {
    const alpha=clamp(banner/35,0,1);
    c.save();c.globalAlpha=alpha;
    rounded(118,160,724,145,18,"#251a47e8");
    text("РІВЕНЬ "+(stageIndex+1),480,187,21,"#ffd977","center");
    text(defs[stageIndex].name,480,231,29,"#fff","center",true);
    text(defs[stageIndex].line,480,273,14,"#c5ffee","center");
    c.restore();
  }
}
function titleScreen() {
  backdrop();
  c.fillStyle="#100c25a9";c.fillRect(0,0,W,H);
  const stars=[[80,88],[876,90],[115,363],[862,385],[50,240],[909,260]];
  for(let i=0;i<stars.length;i++){
    const [x,y]=stars[i];text("✦",x,y,24+Math.sin(tick/15+i)*8,"#ffe288","center");
  }
  drawHero({dir:1,ground:true,vx:0,walking:0,attack:0,invuln:0,y:0},194,286,3.5);
  drawBoss({x:724,y:260,w:151,h:193,hp:3,awake:false,open:false,shots:[]});
  text("МАТВІЙ",480,119,79,"#ffe46c","center",true);
  rounded(705,17,228,29,8,"#ffe07c");
  text("★ DELUXE 2.0 ★",819,32,15,"#372445","center");
  text("КУХНЯ ПРОТИ ВСІХ!",480,189,34,"#ff91a1","center",true);
  rounded(333,313,294,56,13,"#f9c84d");
  text("ENTER — ГРАТИ",480,343,25,"#2b2045","center");
  if(unlocked>0)text("C — ПРОДОВЖИТИ З РІВНЯ "+(unlocked+1),480,396,18,"#bbffe4","center",true);
  else text("5 рівнів • вороги • фінальний бос",480,395,18,"#bbffe4","center");
  text("ХРУМ-3000 ЗАХОПИВ КУХНЮ. ХТО ЙОГО ЗУПИНИТЬ?",480,453,15,"#fff0bd","center");
  text("A/D: рух  •  SPACE: стрибок  •  J: удар  •  E: важіль",480,501,15,"#ddd0f8","center");
}
function overlay(kind) {
  box(0,0,W,H,"#130e24bd");
  if(kind==="pause"){
    text("ПАУЗА",480,221,60,"#ffe681","center",true);
    text("НАТИСНИ P АБО ESC, ЩОБ ПРОДОВЖИТИ",480,295,19,"#fff","center");
  }
  if(kind==="victory"){
    for(let i=0;i<38;i++){
      const x=((i*151+tick*(.7+i%4))%W),y=((i*87+tick*(1.4+i%3))%H);
      box(x,y,10,10,["#ffef7f","#ee80d3","#95ffe2","#a8baff"][i%4]);
    }
    text("МАТВІЙ ВРЯТУВАВ КУХНЮ!",480,130,38,"#ffec78","center",true);
    text("ХРУМ-3000 ПЕРЕМОЖЕНО!",480,194,27,"#fff","center",true);
    drawHero({dir:1,ground:true,vx:0,walking:0,attack:0,invuln:0,y:0},480,277,3.1);
    text("СУПЕР-СЕНДВІЧ ГОТОВИЙ!",480,402,26,"#aaffdf","center",true);
    const rank=score>=8800?"S":score>=6500?"A":score>=4300?"B":"C";
    rounded(85,413,144,84,15,rank==="S"?"#ffe487":"#8265a4");
    text("РАНГ",157,432,18,"#302344","center");
    text(rank,157,468,38,"#302344","center");
    text("ОЧКИ: "+score,480,444,24,"#ffe478","center");
    text("ЧАС: "+Math.floor(runFrames/3600)+":"+String(Math.floor(runFrames/60)%60).padStart(2,"0")+"   СЕКРЕТИ: "+secretCount+"/4",480,478,16,"#c1ffed","center");
    text("ENTER — ГОЛОВНЕ МЕНЮ",480,514,17,"#fff","center");
  }
}
function render() {
  if(mode==="title"){titleScreen();return;}
  c.save();
  if(shake>0) c.translate(Math.sin(tick*6)*shake*.37,Math.cos(tick*4)*shake*.25);
  backdrop();drawLevel();drawHero();
  for(const q of particles){c.globalAlpha=clamp(q.life/35,0,1);box(q.x-camera,q.y,q.s,q.s,q.col);}
  c.globalAlpha=1;c.restore();hud();
  if(mode==="pause"||mode==="victory")overlay(mode);
}
let last=0, accumulator=0;
function loop(ts){
  if(!last)last=ts;
  accumulator+=Math.min(55,ts-last);last=ts;
  while(accumulator>=1000/60){update(1);accumulator-=1000/60;}
  render();requestAnimationFrame(loop);
}
setStage(0);
requestAnimationFrame(loop);
})();