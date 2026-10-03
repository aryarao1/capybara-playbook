const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
// Exercise the actual scene listeners at desktop and phone coordinate scales.
class Element {
 constructor(){this.children=[];this.style={};this.dataset={};this.attrs={};this.listeners={};this.isConnected=true;this.classList={add(){},remove(){},toggle(){}};}
 append(...children){this.children.push(...children);}
 replaceChildren(){this.children=[];}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,f){this.listeners[k]=f;}
 setPointerCapture(){}
 getBoundingClientRect(){return{left:10,top:20,width:this.width||625,height:(this.width||625)*1.2};}
}
for(const [pointerType,width] of [['mouse',625],['touch',358]]){
 const stored=new Map(),announcement=new Element();
 const context={window:{CapySound:{play(){},stop(){}},CapyRules:require('../game-rules.js')},structuredClone,setTimeout,performance,console,
 document:{createElement:()=>new Element(),getElementById:()=>announcement},
 localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)}};
 for(const file of ['pages.js','pieces.js','activities.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
 const stage=new Element(),toolbar=new Element(),closet=new Element();stage.width=width;
 let play=context.window.CapyPlay;play.mount(stage,toolbar,1);play.mount(closet,new Element(),2);
 const piece=key=>stage.children.find(e=>e.dataset.piece===key);
 const tap=key=>piece(key).listeners.click({detail:0,stopPropagation(){}});
 const drag=(key,dx,dy,cancel=false)=>{
  const el=piece(key),r=stage.getBoundingClientRect();
  const x=r.left+(parseFloat(el.style.left)+parseFloat(el.style.width)/2)/100*r.width;
  const y=r.top+(parseFloat(el.style.top)+parseFloat(el.style.height)/2)/100*r.height;
  const event=(clientX,clientY)=>({button:0,isPrimary:true,pointerType,pointerId:1,clientX,clientY,preventDefault(){},stopPropagation(){}});
  el.listeners.pointerdown(event(x,y));el.listeners.pointermove(event(x+dx*r.width/1145,y+dy*r.height/1374));
  el.listeners[cancel?'pointercancel':'pointerup'](event(x+dx*r.width/1145,y+dy*r.height/1374));
 };
 const asleep=()=>{assert.equal(play.getState().bed.awake,false);assert.ok(piece('sleeping'));assert.ok(!piece('capy'));assert.equal(play.getState().bed.mask,true);assert.ok(!closet.children.some(e=>e.dataset.piece==='mask'));};
 asleep();tap('blanket');assert.equal(play.getState().bed.awake,true);
 tap('mask');assert.ok(closet.children.some(e=>e.dataset.piece==='mask'));
 tap('blanket');asleep(); // tuck in while still on bed, with mask returned
 drag('sleeping',420,460);assert.equal(play.getState().bed.awake,true);
 drag('capy',-420,-460);asleep(); // return directly to bed
 tap('blanket');tap('mask');drag('blanket',0,-180);asleep();
 tap('blanket');drag('capy',410,430);assert.equal(play.getState().bed.awake,true);
 const outside=play.getState().bed.pos;tap('blanket');assert.equal(play.getState().bed.awake,true); // no teleport
 drag('capy',-410,-430,true);assert.deepEqual(play.getState().bed.pos,outside); // cancelled drag
 drag('capy',-410,-430);asleep();
 play.unmount();play.mount(stage,toolbar,1);asleep(); // page changes
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','activities.js'),'utf8'),context);
 play=context.window.CapyPlay;play.mount(stage,toolbar,1);play.mount(closet,new Element(),2);asleep(); // reload
 tap('blanket');assert.equal(play.getState().bed.awake,true); // can still wake
 console.log(`PASS: ${pointerType} at ${width}px: wake, tuck, drag out/back, mask transfer, cancel, page change and reload`);
}
