/* Matvii 2.1: layout-aware touch controls, physical keyboard event bridge.
   No dependencies, no network, works when index.html opened locally. */
(() => {
  "use strict";
  const buttons=[...document.querySelectorAll(".touch-key[data-key],.touch-small[data-key]")];
  const pressed=new Map();
  const keyValues={
    ArrowLeft:"ArrowLeft",ArrowRight:"ArrowRight",Space:" ",
    KeyJ:"j",KeyE:"e",KeyP:"p",KeyC:"c",KeyM:"m",Enter:"Enter"
  };
  function fire(code,isDown) {
    window.dispatchEvent(new KeyboardEvent(isDown?"keydown":"keyup",{
      key:keyValues[code]||code,code,bubbles:true,cancelable:true
    }));
  }
  function releasePointer(id){
    const previous=pressed.get(id);
    if(!previous)return;
    pressed.delete(id);
    const code=previous.dataset.key;
    if(![...pressed.values()].some(node=>node.dataset.key===code))fire(code,false);
    previous.classList.remove("is-down");
  }
  function releaseAll(){
    for(const id of [...pressed.keys()]) releasePointer(id);
  }
  for(const button of buttons){
    button.addEventListener("pointerdown", e=>{
      if(!e.isPrimary && e.pointerType==="mouse")return;
      e.preventDefault();
      try{button.setPointerCapture(e.pointerId);}catch(_){}
      if(![...pressed.values()].some(node=>node.dataset.key===button.dataset.key)){
        fire(button.dataset.key,true);
      }
      pressed.set(e.pointerId,button);
      button.classList.add("is-down");
    });
    for(const event of ["pointerup","pointercancel","lostpointercapture"])
      button.addEventListener(event,e=>{e.preventDefault();releasePointer(e.pointerId);});
    button.addEventListener("contextmenu",e=>e.preventDefault());
  }
  document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseAll();});
  window.addEventListener("blur",releaseAll);
  document.getElementById("touch-fullscreen").addEventListener("click",async ()=>{
    const target=document.documentElement;
    try {
      if(document.fullscreenElement) await document.exitFullscreen();
      else if(target.requestFullscreen)await target.requestFullscreen({navigationUI:"hide"});
    } catch(_) {
      // Fullscreen may be restricted by the mobile browser.
    }
  });
  const levelLabel=document.getElementById("mobile-level");
  const progressLabel=document.getElementById("mobile-progress");
  const continueBtn=document.getElementById("touch-continue");
  let lastMode="",lastStr="",stamp=0;
  function update({mode,stageIndex,hero,stage}) {
    if(mode!==lastMode){document.body.dataset.gameMode=mode;lastMode=mode;}
    const now=performance.now();
    if(now-stamp<100)return;
    stamp=now;
    if(mode==="title"){
      let unlocked=0;try{unlocked=Math.max(0,Math.min(4,Number(localStorage.getItem("matviiLevel"))||0));}catch(_){}
      continueBtn.hidden=unlocked===0;
    }
    const names=["🍞 СТІЛЬНИЦЯ","🧊 ХОЛОДИЛЬНИК","🫧 МИЙКА","🔥 ПЛИТА","🤖 ХРУМ-3000"];
    let left=mode==="title"?"🎮 МАТВІЙ DELUXE 2.1":mode==="victory"?"🏆 ПЕРЕМОГА!":names[stageIndex]||"МАТВІЙ";
    let right=mode==="title"?"5 РІВНІВ":mode==="victory"?"СУПЕР-СЕНДВІЧ":("❤️"+(hero?.hearts||0)+"   "+(stageIndex===4
      ? "БОС "+(stage?.boss?.hp??3)+"/3":((stage?.items?.filter(v=>v.taken).length)||0)+"/3"));
    const str=left+"|"+right;
    if(str!==lastStr){levelLabel.textContent=left;progressLabel.textContent=right;lastStr=str;}
  }
  window.MatviiMobile={update};
})();