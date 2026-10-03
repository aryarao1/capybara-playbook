const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
class Element{
 constructor(){this.children=[];this.style={};this.dataset={};this.attrs={};this.listeners={};this.isConnected=true;this.classList={add(){},remove(){},toggle(){}};}
 append(...children){this.children.push(...children);}replaceChildren(){this.children=[];}
 setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,f){this.listeners[k]=f;}setPointerCapture(){}remove(){}
 querySelector(selector){return this.children.find(e=>e.className===selector.slice(1));}
 getBoundingClientRect(){return{left:10,top:20,width:this.width,height:this.width*1.2};}
}
for(const [pointerType,width]of [['mouse',625],['touch',358]]){
 for(const winner of [0,1]){
  const stored=new Map([['capy-play-v1',JSON.stringify({bed:{awake:true,mask:false},board:{positions:[20,12],remaining:3,active:1}})]]),sounds=[];
  const context={window:{CapySound:{play:n=>sounds.push(n),stop(){}}},structuredClone,setTimeout,performance,console,document:{createElement:()=>new Element(),getElementById:()=>new Element()},localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)}};
  for(const file of ['pages.js','pieces.js','game-rules.js','activities.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
  let play=context.window.CapyPlay;const R=context.window.CapyRules,stage=new Element(),toolbar=new Element();stage.width=width;
  play.mount(stage,toolbar,6);assert.deepEqual(Array.from(play.getState().board.positions),[0,0]);assert.equal(play.getState().bed.awake,true);
  const dragTo=(player,destination)=>{
   const el=stage.children.find(e=>e.dataset.player===player),r=stage.getBoundingClientRect();
   const x=r.left+(parseFloat(el.style.left)+parseFloat(el.style.width)/2)/100*r.width,y=r.top+(parseFloat(el.style.top)+parseFloat(el.style.height)/2)/100*r.height;
   const [tx,ty]=R.routes[player][destination],endX=r.left+tx*r.width/1145,endY=r.top+ty*r.height/1374;
   const evt=(clientX,clientY)=>({button:0,isPrimary:true,pointerType,pointerId:1,clientX,clientY,preventDefault(){},stopPropagation(){}});
   el.listeners.pointerdown(evt(x,y));el.listeners.pointermove(evt(endX,endY));el.listeners.pointerup(evt(endX,endY));
  };
  let turns=0;
  while(play.getState().board.winner===null&&turns++<30){
   const b=play.getState().board,player=b.active,die=player===winner?6:1;R.roll=()=>die;
   stage.querySelector('.dice').listeners.click();
   const before=JSON.stringify(play.getState().board);dragTo(1-player,1);assert.equal(JSON.stringify(play.getState().board),before);
   dragTo(player,Math.min(b.positions[player]+die,R.routes[player].length-1));
  }
  assert.equal(play.getState().board.winner,winner);assert.equal(stage.querySelector('.dice').disabled,true);
  assert.ok(toolbar.children.some(e=>e.attrs['aria-label']==='Winner'&&e.textContent.includes('wins!')));
  assert.ok(sounds.includes('clunk'));
  play.unmount();play.mount(stage,toolbar,6);assert.equal(play.getState().board.winner,winner);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','activities.js'),'utf8'),context);play=context.window.CapyPlay;play.mount(stage,toolbar,6);assert.equal(play.getState().board.winner,winner);
  toolbar.children.find(e=>e.attrs['aria-label']==='Play again').listeners.click();
  assert.equal(play.getState().board.winner,null);assert.deepEqual(Array.from(play.getState().board.positions),[0,0]);assert.equal(stage.querySelector('.dice').disabled,false);
  console.log(`PASS: ${pointerType} ${width}px, winner ${winner}, actual roll/drag handlers, turn blocking, migration, winner persistence and replay`);
 }
}
