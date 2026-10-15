/* Offline procedural 16-bit visual upgrade for Matvii 2.0 */
(()=>{
"use strict";
const P=[
 ["#fff0cf","#ffb88f","#b35978","#ffedb1"],["#e9ffff","#9bddec","#5379b8","#dbffff"],
 ["#defff0","#8bdcc6","#337f96","#c3fff3"],["#ffd6aa","#f28c6a","#982f5d","#ffe18a"],
 ["#f2d4ff","#a484d5","#42266e","#ffd1ff"]];
const R=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const Q=(c,x,y,w,h,color,rad=7)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,rad);c.fill();};
const O=(c,x,y,r,color)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();};
const E=(c,x,y,rx,ry,color)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();};
const T=(c,s,x,y,size,color,align="left",outline=false)=>{c.save();c.textBaseline="middle";c.font="900 "+size+"px monospace";c.textAlign=align;
 if(outline){c.lineWidth=5;c.lineJoin="round";c.strokeStyle="#23192e";c.strokeText(s,x,y);}
 c.fillStyle=color;c.fillText(s,x,y);c.restore();};
function star(c,x,y,color="#fff6a2",scale=1){c.save();c.translate(x,y);c.scale(scale,scale);
 R(c,-2,-13,4,26,color);R(c,-13,-2,26,4,color);R(c,-5,-5,10,10,color);c.restore();}
function mug(c,x,y,col="#f17c8d"){Q(c,x,y-44,57,47,"#654765");Q(c,x+3,y-41,51,40,col);R(c,x+9,y-35,8,22,"#fff7d680");
 c.strokeStyle="#fff3cd";c.lineWidth=7;c.beginPath();c.arc(x+56,y-20,13,-1.5,1.5);c.stroke();}
function jar(c,x,y,col="#8dcebe"){Q(c,x,y-66,52,67,"#59486b");Q(c,x+5,y-60,42,55,col,5);
 R(c,x+2,y-71,48,12,"#ffe0b1");Q(c,x+7,y-38,38,19,"#fff4ca");R(c,x+15,y-31,21,5,"#d5817d");}
function background(c,idx,cam,t,W,H){
 const p=P[idx],g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,p[0]);g.addColorStop(.7,p[1]);g.addColorStop(1,p[2]);c.fillStyle=g;c.fillRect(0,0,W,H);
 c.save();c.globalAlpha=.17;
 for(let i=-1;i<13;i++){let x=i*115-(cam*.13%115);R(c,x,0,3,445,"#623d64");for(let y=28;y<450;y+=83)R(c,x,y,115,3,"#fff");}
 c.restore();
 const px=cam*.29;
 for(let i=-1;i<9;i++){
  const x=i*340-(px%340),v=((i+10)%4);
  if(idx===0){
   Q(c,x+20,70,295,286,"#d38d75",13);Q(c,x+32,83,270,262,"#ffe6b2",8);
   R(c,x+162,88,6,250,"#d19d7e");R(c,x+42,208,245,7,"#d19d7e");
   Q(c,x+119,236,15,11,"#bc7c68");Q(c,x+210,236,15,11,"#bc7c68");
   if(v===0){Q(c,x+89,103,120,80,"#f9f4d3");Q(c,x+99,113,101,60,"#a3d8dc");O(c,x+176,130,15,"#ffef9e");}
   if(v===1)mug(c,x+70,420,"#f16f89");if(v===2){jar(c,x+88,424,"#a5caae");jar(c,x+175,428,"#f5bd8b");}
   if(v===3){Q(c,x+75,295,170,128,"#ca7f73");Q(c,x+86,306,148,100,"#f5b08c");R(c,x+92,319,135,12,"#fff7d2");}
  } else if(idx===1){
   Q(c,x+21,45,296,388,"#5283a8",11);Q(c,x+33,58,273,358,"#b5eff4",9);
   for(let k=0;k<5;k++){R(c,x+43,125+k*65,249,9,"#f4ffff");R(c,x+43,134+k*65,249,6,"#6cbad0");}
   jar(c,x+63,120,"#d9a7c5");jar(c,x+171,120,"#f2d79c");mug(c,x+109,250,"#8b9fd4");
   for(let k=0;k<4;k++){R(c,x+58+k*69,60,6,29,"#ecffff");R(c,x+58+k*69,88,2,14,"#fff");}
  } else if(idx===2){
   Q(c,x+20,68,290,356,"#287c98",11);Q(c,x+33,81,265,282,"#b9f2e6",8);
   R(c,x+44,210,243,15,"#faffee");R(c,x+44,227,243,120,"#5cafb9");
   Q(c,x+122,113,95,36,"#f6d7b6");R(c,x+157,150,12,49,"#e9ffff");
   R(c,x+112,102,11,80,"#e8faff");R(c,x+120,101,86,12,"#fff");R(c,x+193,107,12,34,"#d5fdff");
   for(let k=0;k<7;k++){O(c,x+44+k*36,377-(k%3)*26+Math.sin(t/30+k)*7,6+k%3*2,"#d1ffff9b");}
   if(v===2)jar(c,x+105,424,"#a0ed8e");
  } else if(idx===3){
   Q(c,x+20,45,290,387,"#592542",11);Q(c,x+34,60,263,360,"#bb4563",9);
   Q(c,x+52,80,225,156,"#3a233f");Q(c,x+65,92,200,132,"#ed815d");
   for(let k=0;k<3;k++){R(c,x+57,250+k*52,221,12,"#632a48");Q(c,x+78+k*48,265+k*52,67,30,"#f8b26b");}
   for(let k=0;k<4;k++){O(c,x+75+k*63,393,12,"#3b2843");O(c,x+75+k*63,393,4,"#fbe29a");}
  } else {
   Q(c,x+20,42,295,393,"#36245b",12);Q(c,x+33,58,267,363,"#7755a5",8);
   for(let k=0;k<4;k++){R(c,x+45,111+k*65,241,4,"#eaa7f3");R(c,x+45,123+k*65,241,32,"#4d3475");}
   for(let k=0;k<5;k++){O(c,x+66+k*49,377,7,Math.sin(t/14+k)>0?"#8df4dd":"#f58ac1");}
   R(c,x+167,58,7,38,"#ffd3eb");Q(c,x+153,39,35,18,"#ff8ba3");
  }
 }
 // depth sparkles and suspended particles
 for(let i=0;i<24;i++){let x=((i*176-cam*(.07+i%3*.04)+2000)%1140)-60;
  let y=64+(i*63)%330+Math.sin(t/25+i)*8;
  if(idx===1)star(c,x,y,"#ffffffb9",.28);
  else if(idx===2){c.strokeStyle="#ecffff80";c.lineWidth=2;c.beginPath();c.arc(x,y,5+i%4,0,7);c.stroke();}
  else if(idx===3)O(c,x,y,2+i%2,"#ffe4a47e");
  else star(c,x,y,idx===4?"#f9c7f0a0":"#fff4ad8a",.19);}
 R(c,0,450,W,90,idx===1?"#293c62":idx===3?"#3a253c":"#2d2448");
}
function hero(c,p,x,y,scale,t,mode){
 if(p.invuln>0&&Math.floor(t/5)%2===0&&mode==="playing")return;
 c.save();c.translate(Math.round(x),Math.round(y));const s=scale||1;c.scale(p.dir*s,s);
 const move=p.ground&&Math.abs(p.vx)>1,step=move?Math.sin(p.walking/6)*3:0,bob=move?Math.sin(p.walking/10):Math.sin(t/17)*.6;
 c.translate(0,bob);
 if(scale===1)E(c,0,50,20,4,"#20153155");
 R(c,-13+step,37,12,13,"#34263b");R(c,3-step,37,12,13,"#34263b");
 R(c,-16+step,45,18,6,"#fff3da");R(c,1-step,45,18,6,"#fff3da");
 Q(c,-19,15,38,30,"#342743");Q(c,-16,18,32,26,"#62bcd1");R(c,-14,23,28,6,"#81e1e4");
 R(c,-9,25,18,18,"#ffe9bb");T(c,"M",0,34,15,"#bb4c75","center");
 R(c,-22,22,9,20,"#f3bd99");R(c,15,22,9,20,"#f3bd99");R(c,-22,35,10,7,"#fff");R(c,16,35,10,7,"#fff");
 Q(c,-19,-5,38,29,"#432943");Q(c,-16,-2,32,26,"#f7bd92");
 R(c,-17,-5,34,9,"#583a43");R(c,-18,0,8,11,"#634144");
 R(c,-10,9,7,8,"#fff9ed");R(c,4,9,7,8,"#fff9ed");
 if(Math.sin(t/111)>.997){R(c,-9,12,7,2,"#2e253b");R(c,4,12,7,2,"#2e253b");}
 else {R(c,-7,10,3,6,"#292638");R(c,7,10,3,6,"#292638");R(c,-7,10,1,2,"#fff");R(c,7,10,1,2,"#fff");}
 R(c,-3,18,8,2,"#ad5363");R(c,-13,16,5,3,"#ec9c99");R(c,10,16,5,3,"#ec9c99");
 Q(c,-18,-19,37,20,"#fffaf0");Q(c,-17,-22,13,16,"#fff");Q(c,-7,-25,18,20,"#fff");
 R(c,-20,-3,40,8,"#f1e3d5");R(c,-12,-10,23,4,"#f4c9b4");
 c.save();c.translate(20,31);
 if(p.attack>0)c.rotate(-1.1+(12-p.attack)/12*2.2);
 R(c,0,-12,6,25,p.super>0?"#ffd95b":"#ac784e");
 Q(c,-10,-25,26,17,p.super>0?"#ffe88f":"#d3e8ea",3);R(c,-8,-23,22,3,"#fff");
 for(let i=0;i<3;i++)R(c,-6+i*8,-17,3,6,"#708aa3");
 c.restore();
 if(p.attack>0){c.save();c.globalAlpha=.8;c.strokeStyle=p.super>0?"#ffe35c":"#ffffff";c.lineWidth=p.super>0?8:4;
 c.beginPath();c.arc(18,24,p.super>0?43:33,-.8,1.2);c.stroke();c.restore();}
 if(p.super>0){star(c,0,-38,"#ffe77a",.6);O(c,-21,20,3,"#fff09c");}
 c.restore();
}
function enemy(c,e,x,y,t){
 c.save();c.translate(Math.round(x),Math.round(y+Math.sin(t/12+e.phase)*2));
 E(c,17,34,17,3,"#1d153a67");R(c,2,28,11,6,"#322645");R(c,23,28,10,6,"#322645");
 const z=e.type;
 if(z==="ice"){Q(c,0,4,35,27,"#5088a7",5);Q(c,3,1,29,28,"#bcf9ff",5);R(c,6,4,23,4,"#fff");}
 else if(z==="yogurt"){Q(c,0,5,35,27,"#834f88");Q(c,4,8,27,24,"#fff5f9");Q(c,5,1,25,11,"#d88bc2");}
 else if(z==="toast"){Q(c,0,2,35,31,"#8d5660");Q(c,3,5,29,26,"#efb979");Q(c,6,9,23,19,"#ffe3a0");R(c,10,7,12,3,"#fff8bf");}
 else if(z==="duck"){O(c,17,18,16,"#c48644");O(c,17,16,13,"#ffd457");O(c,25,6,8,"#ffdd68");Q(c,-4,16,16,7,"#ff8c57");}
 else if(z==="pepper"){Q(c,4,5,28,27,"#d04b5a",10);R(c,16,-2,5,10,"#4ebb70");R(c,11,-3,15,4,"#85e58f");}
 else if(z==="sponge"){Q(c,0,5,35,27,"#d5c347",4);Q(c,3,6,29,23,"#f0dc65",3);for(let i=0;i<5;i++)O(c,6+(i*7)%22,11+(i%3)*6,3,"#bfae51");}
 else if(z==="pea"){O(c,17,16,17,"#3e8459");O(c,17,14,14,"#83d568");O(c,11,8,6,"#c2e68a");}
 else {E(c,17,17,17,15,"#815a4d");E(c,17,15,15,13,"#cda067");R(c,6,10,4,4,"#e5c389");R(c,27,20,4,4,"#8f5c43");}
 R(c,7,10,8,3,"#67435a");R(c,22,10,8,3,"#67435a");
 Q(c,8,13,7,10,"#fffbe7",2);Q(c,21,13,7,10,"#fffbe7",2);
 R(c,11+(e.dir>0?1:0),16,3,5,"#33283d");R(c,24+(e.dir>0?1:0),16,3,5,"#33283d");R(c,13,25,10,3,"#7e3f56");
 if(e.hp>1){R(c,5,-5,25,4,"#36263c");R(c,7,-4,21,2,"#ffe288");}
 c.restore();
}
function item(c,it,icon,t,cam){
 const x=it.x-cam,y=it.y+Math.sin(t/13+it.x)*5;
 c.save();c.translate(x,y);O(c,0,0,29,"#fff4bd41");star(c,20,-19,"#fff9bd",.45);
 if(icon==="bread"){Q(c,-19,-19,38,38,"#885b55");Q(c,-16,-16,32,32,"#f1b46c");Q(c,-12,-13,24,25,"#ffe5a1");}
 else if(icon==="cheese"){c.beginPath();c.moveTo(-20,18);c.lineTo(10,-20);c.lineTo(22,18);c.closePath();c.fillStyle="#ffe071";c.fill();
 O(c,0,9,4,"#eeb255");O(c,13,6,4,"#eeb255");O(c,9,-4,3,"#eeb255");}
 else if(icon==="veggie"){O(c,0,2,18,"#8a4359");O(c,0,0,15,"#f45d6e");R(c,-2,-23,6,12,"#60c67e");R(c,-13,-16,18,6,"#7be89b");}
 else {Q(c,-18,-22,36,44,"#8c4863");Q(c,-15,-19,30,37,"#ffe1ac");R(c,-19,-25,38,11,"#bd567b");R(c,-11,-1,22,17,"#ec6474");T(c,"S",0,7,16,"#fff2c1","center");}
 c.restore();
}
function boss(c,b,x,y,t){
 if(x>1100||x<-210)return;
 c.save();c.translate(x,y+Math.sin(t/14)*2);
 E(c,75,192,105,10,"#1b12365c");
 R(c,13,173,37,24,"#302443");R(c,105,173,37,24,"#302443");
 R(c,-28,76,49,29,"#46315b");R(c,132,76,51,29,"#46315b");
 Q(c,-40,95,32,59,"#d475a1");Q(c,164,95,33,59,"#d475a1");
 Q(c,-6,-1,171,184,"#322042",17);Q(c,3,7,153,166,b.open?"#ffd47b":"#b277b8",14);
 Q(c,19,20,122,64,"#3a2548");
 for(let i=0;i<2;i++){let ex=30+i*72;Q(c,ex,28,30,40,b.open?"#fff0a0":"#ff7690",5);
 Q(c,ex+7,34,16,28,"#2e2640");R(c,ex+11,37,5,5,"#fff");}
 Q(c,42,90,72,24,b.open?"#fff2c5":"#5d3256");R(c,52,95,52,10,"#4a2c49");
 Q(c,37,121,83,41,"#4b305b");T(c,"ХРУМ",79,143,21,"#fff4af","center");
 for(let i=0;i<5;i++)R(c,22+i*28,12,13,5,"#fff3d088");
 if(b.open){for(let i=0;i<12;i++)O(c,-5+i*13,5-Math.abs(Math.sin(t/12+i))*32,2+i%3,"#ffefaa");star(c,78,-17,"#fff09a",.7);}
 if(b.awake)T(c,b.open?"ПЕРЕГРІВ! БИЙ J!":"ОБЕРЕЖНО: ТОСТИ!",75,-42,16,b.open?"#fff08a":"#ffd9e7","center",true);
 for(const sh of b.shots){let sx=sh.x-b.x,sy=sh.y-b.y;Q(c,sx,sy,sh.w,sh.h,"#8f5761",5);Q(c,sx+3,sy+3,sh.w-6,sh.h-6,"#f9c779",3);R(c,sx+9,sy+7,5,4,"#fff3b2");}
 c.restore();
}
function hud(c,data){
 const {idx,hero,stage,score,t,banner,message,messageFrames,floating,camera,power,secretCount}=data;
 const p=P[idx];Q(c,12,12,936,78,"#241b38e8",12);R(c,14,14,7,74,p[3]);R(c,25,15,911,3,"#ffffff32");
 T(c,"LV."+(idx+1)+" "+data.stageName,39,35,19,"#ffeaa5");
 for(let i=0;i<3;i++){let x=35+i*31,y=58,a=i<hero.hearts;R(c,x,y,8,7,a?"#ff7c9a":"#5b4d67");R(c,x+11,y,8,7,a?"#ff7c9a":"#5b4d67");R(c,x-1,y+7,21,7,a?"#ec527f":"#574961");R(c,x+3,y+14,13,5,a?"#da3e71":"#4c4058");}
 if(idx<4){T(c,data.itemName+" "+stage.items.filter(v=>v.taken).length+"/3",432,38,19,"#fff0cd");
  T(c,stage.switches.length?"ВАЖЕЛІ "+stage.switches.filter(v=>v.on).length+"/"+stage.switches.length:"ЗБЕРИ ІНГРЕДІЄНТИ",432,67,15,"#b0ffe5");}
 else{T(c,"БОС ХРУМ-3000",432,37,18,"#fff");for(let i=0;i<3;i++)Q(c,432+i*48,56,40,14,i<stage.boss.hp?"#ff7599":"#5b4b67",4);}
 T(c,"★ "+score,918,38,20,"#ffe47e","right");T(c,"✦ "+secretCount+"/4",918,68,16,"#b7ffe1","right");
 if(power>0){Q(c,280,97,400,22,"#322746ed");Q(c,284,101,392*Math.min(1,power/840),14,"#ffe072",4);T(c,"СУПЕР-ЛОПАТКА",480,108,14,"#352543","center");}
 if(messageFrames>0){Q(c,177,128,606,40,"#2f2545eb");T(c,message,480,148,Math.min(18,820/(message.length*.8)),"#fff2af","center");}
 for(const f of floating)T(c,f.text,f.x-camera,f.y,20,"#ffed7c","center",true);
 if(banner>0){c.save();c.globalAlpha=Math.min(1,banner/30);Q(c,120,169,720,139,"#291c45ee",16);R(c,134,178,692,3,"#ffe9a6");
 T(c,"РІВЕНЬ "+(idx+1),480,194,20,"#ffe69b","center");T(c,data.stageName,480,237,27,"#fff","center",true);
 T(c,data.line,480,274,15,"#b8ffe6","center");c.restore();}
}
window.KitchenArt={background,hero,enemy,item,boss,hud,star,T,R,Q,O,P};
})();