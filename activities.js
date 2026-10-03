(() => {
  'use strict';
  const W=1145,H=1374,A=window.CapyArt,S=window.CapySound,R=window.CapyRules;
  const defaults={bed:{awake:false,mask:true,pos:[400,408,345,455],blanket:null},closet:{pos:[456,540,350,450],clothes:null,seated:false,eaten:[],tea:false},lake:{pos:[60,160,300,390],waist:false,head:false,swimming:false},art:{color:'#ed7a9f',size:20,strokes:[]},salon:{cut:662,bow:false,glasses:false},board:{positions:[-1,-1],active:0,remaining:0,die:1},toca:{worn:[],companion:null},gacha:{worn:[]}};
  let state=structuredClone(defaults),uid=0;const mounted=new Map();
  try {const saved=JSON.parse(localStorage.getItem('capy-play-v1')||'null');if(saved) for(const k of Object.keys(defaults)) if(saved[k])state[k]={...defaults[k],...saved[k]};} catch{}
  const save=()=>{try{localStorage.setItem('capy-play-v1',JSON.stringify(state));}catch{}};
  const say=text=>{document.getElementById('announcement').textContent=text;};
  const center=p=>[p[0]+p[2]/2,p[1]+p[3]/2];
  const inside=(p,r,pad=0)=>p[0]>=r[0]-pad&&p[0]<=r[0]+r[2]+pad&&p[1]>=r[1]-pad&&p[1]<=r[1]+r[3]+pad;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function place(el,p){el.style.left=p[0]/W*100+'%';el.style.top=p[1]/H*100+'%';el.style.width=p[2]/W*100+'%';el.style.height=p[3]/H*100+'%';}
  function cut(key,box=A[key].box){const a=A[key],id='piece-clip-'+(++uid);const p=window.BOOK_PAGES[a.page];return `<svg aria-hidden="true" viewBox="${box.join(' ')}" preserveAspectRatio="none"><defs><clipPath id="${id}"><path d="${a.path}" clip-rule="evenodd"/></clipPath></defs><image href="${p.src}?v=${p.sha256.slice(0,12)}" width="1145" height="1374" clip-path="url(#${id})"/></svg>`;}
  function decorate(el,key,relative){const layer=document.createElement('span');layer.className='worn-piece';layer.innerHTML=cut(key);Object.assign(layer.style,{left:relative[0]+'%',top:relative[1]+'%',width:relative[2]+'%',height:relative[3]+'%'});el.append(layer);}
  function effect(stage,name,pos){const e=document.createElement('span');e.className='effect '+name;place(e,[pos[0]-100,pos[1]-100,200,200]);e.innerHTML=name==='splash'?'<i></i><i></i><i></i><i></i><i></i><i></i>':'♥';stage.append(e);setTimeout(()=>e.remove(),1100);}
  function artPiece(stage,key,label,pos,options={}) {
    const el=document.createElement(options.static?'div':'button');el.className='play-piece '+(options.className||'');el.dataset.piece=key;el.setAttribute('aria-label',label);if(!options.static)el.type='button';
    el.innerHTML=key==='capy'?'<img src="assets/play/capy.png" alt="" draggable="false">':cut(key);place(el,pos);stage.append(el);
    if(options.z)el.style.zIndex=options.z;
    if(!options.static)drag(el,stage,pos,options);
    return el;
  }
  function drag(el,stage,initial,options){
    let p=[...initial],start=null,moved=false,skipClick=false;
    const coordinates=e=>{const r=stage.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height];};
    el.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;e.preventDefault();e.stopPropagation();const xy=coordinates(e);start={xy,p:[...p],id:e.pointerId};moved=false;el.setPointerCapture(e.pointerId);el.classList.add('held');options.start?.();});
    el.addEventListener('pointermove',e=>{if(!start||start.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();const xy=coordinates(e),dx=xy[0]-start.xy[0],dy=xy[1]-start.xy[1];if(Math.hypot(dx,dy)>8)moved=true;if(options.movable!==false){p=[clamp(start.p[0]+dx,-p[2]*.15,W-p[2]*.85),clamp(start.p[1]+dy,-p[3]*.1,H-p[3]*.9),p[2],p[3]];place(el,p);}options.move?.(p,xy,el);});
    function end(e,cancel=false){if(!start||start.id!==e.pointerId)return;e.stopPropagation();el.classList.remove('held');start=null;skipClick=true;setTimeout(()=>skipClick=false,0);if(cancel){p=[...initial];place(el,p);return;}if(moved){const result=options.drop?.(p,el);if(result){p=[...result];place(el,p);}else if(!options.drop){p=[...initial];place(el,p);}}else options.tap?.(el);save();}
    el.addEventListener('pointerup',e=>end(e));el.addEventListener('pointercancel',e=>end(e,true));
    el.addEventListener('click',e=>{e.stopPropagation();if(!skipClick&&e.detail===0){options.tap?.(el);save();}});
    el.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();e.stopPropagation();if(options.movable===false)return;const delta={ArrowLeft:[-35,0],ArrowRight:[35,0],ArrowUp:[0,-35],ArrowDown:[0,35]}[e.key];p=[clamp(p[0]+delta[0],0,W-p[2]),clamp(p[1]+delta[1],0,H-p[3]),p[2],p[3]];place(el,p);const result=options.drop?.(p,el);if(result){p=result;place(el,p);}save();});
  }
  function base(stage,name){const img=document.createElement('img');img.className='scene-background';img.alt='';img.src=name.startsWith('assets/')?name:`assets/play/${name}.png`;img.draggable=false;stage.append(img);}
  function rerender(index){const m=mounted.get(index);if(m&&m.stage.isConnected)render(m.stage,m.tools,index);save();}
  function button(tools,label,action,className=''){const b=document.createElement('button');b.className='activity-tool '+className;b.type='button';b.textContent=label;b.addEventListener('click',action);tools.append(b);return b;}
  function reset(index){const keys={1:'bed',2:'closet',3:'lake',4:'art',5:'salon',6:'board',7:'toca',8:'gacha'};state[keys[index]]=structuredClone(defaults[keys[index]]);S.stop();rerender(index);if(index===1)rerender(2);say('Put back');}
  function bedroom(stage){base(stage,'bedroom');const b=state.bed;
    if(!b.awake)artPiece(stage,'sleeping','Sleeping capybara',A.sleeping.box,{static:true,z:3});
    else {const capy=artPiece(stage,'capy','Capybara out of bed',b.pos,{z:4,drop:p=>{b.pos=p;rerender(1);return p;},tap:()=>{b.pos=[815,858,310,410];rerender(1);say('Capybara is out of bed');}});capy.classList.add('awake');
      if(b.mask){const p=b.pos;const maskPos=[p[0]+p[2]*.14,p[1]+p[3]*.277,p[2]*.73,p[3]*.18];artPiece(stage,'mask','Put sleeping mask on closet hook',maskPos,{z:9,tap:removeMask,drop:()=>{removeMask();return maskPos;}});}
    }
    function removeMask(){b.mask=false;rerender(1);rerender(2);say('Sleeping mask is on the closet hook');}
    const blanket=b.blanket||(b.awake?[205,873,740,205]:A.blanket.box);
    artPiece(stage,'blanket',b.awake?'Blanket':'Wake capybara',blanket,{z:5,drop:p=>{if(!b.awake){b.awake=true;b.blanket=[205,873,740,205];S.play('wake');}else b.blanket=p;rerender(1);return p;},tap:()=>{if(!b.awake){b.awake=true;S.play('wake');say('Capybara wakes up');}else b.blanket=b.blanket?null:[190,1055,740,170];rerender(1);}});
  }
  function closet(stage){base(stage,'closet');const c=state.closet;
    if(!state.bed.mask){const strap=document.createElement('div');strap.className='mask-strap';place(strap,[683,197,266,140]);strap.innerHTML='<svg viewBox="0 0 266 140"><path d="M5 137 132 0 261 137" fill="none" stroke="#8555b5" stroke-width="10"/></svg>';stage.append(strap);artPiece(stage,'mask','Sleeping mask on hook',[662,278,311,116],{static:true});}
    const capy=artPiece(stage,'capy',c.seated?'Seated capybara':'Move capybara',c.pos,{z:5,drop:p=>{if(inside([p[0]+p[2]/2,p[1]+p[3]*.9],[245,887,375,270])){c.pos=[273,664,335,427];c.seated=true;say('Capybara sits on the mushroom seat');}else{c.pos=p;c.seated=false;}rerender(2);return c.pos;},tap:()=>{c.pos=[273,664,335,427];c.seated=true;rerender(2);say('Capybara sits on the mushroom seat');}});
    if(c.clothes==='dress')decorate(capy,'dress',[19,48,66,40]);if(c.clothes==='sweater')decorate(capy,'sweater',[6,53,89,35]);
    for(const key of ['dress','sweater']) if(c.clothes!==key)artPiece(stage,key,key==='dress'?'Blue dress':'Pink sweater',A[key].box,{z:7,tap:()=>{c.clothes=key;rerender(2);},drop:p=>{if(inside(center(p),c.pos,90)){c.clothes=key;rerender(2);}return A[key].box;}});
    if(c.clothes)button(mounted.get(2).tools,'↶ Clothes',()=>{c.clothes=null;rerender(2);});
    for(const key of ['orange','leaf1','leaf2','tea']){if(c.eaten.includes(key))continue;const feed=()=>{if(key==='tea'){c.tea=true;S.play('sip');say('Capybara drinks tea');}else{c.eaten.push(key);S.play('crunch');say('Capybara eats');}rerender(2);const node=stage.querySelector('[data-piece="capy"]');node?.classList.add('munch');effect(stage,'heart',center(c.pos));};
      const food=artPiece(stage,key,key==='tea'?'Give tea':key==='orange'?'Feed orange':'Feed leaf',A[key].box,{z:8,tap:feed,drop:p=>{if(inside(center(p),c.pos,80))feed();return A[key].box;}});
      if(key==='tea'&&c.tea){const empty=document.createElement('span');empty.className='empty-tea';food.append(empty);}
    }
  }
  function lake(stage){base(stage,'lake');const l=state.lake;
    const capy=artPiece(stage,'capy',l.swimming?'Swimming capybara':'Move capybara into water',l.pos,{z:5,drop:p=>{const swimming=center(p)[1]>620;if(swimming&&!l.swimming){S.play('splash');setTimeout(()=>effect(stage,'splash',[p[0]+p[2]/2,p[1]+p[3]*.62]),0);}l.swimming=swimming;l.pos=p;rerender(3);return p;},tap:()=>{l.pos=l.swimming?[60,160,300,390]:[430,755,330,429];l.swimming=!l.swimming;if(l.swimming)S.play('splash');rerender(3);if(l.swimming)effect(stage,'splash',[595,1000]);}});
    if(l.waist)decorate(capy,'waistTowel',[13,65,76,27]);if(l.head)decorate(capy,'headTowel',[15,2,72,29]);
    if(l.swimming){capy.classList.add('swimming');const ripple=document.createElement('div');ripple.className='water-ripple';place(ripple,[l.pos[0]+20,l.pos[1]+l.pos[3]*.6,l.pos[2]-40,55]);stage.append(ripple);}
    for(const [key,flag,label] of [['waistTowel','waist','Pink waist towel'],['headTowel','head','Purple head towel']]) if(!l[flag])artPiece(stage,key,label,A[key].box,{z:8,tap:()=>{l[flag]=true;rerender(3);},drop:p=>{if(inside(center(p),l.pos,85)){l[flag]=true;rerender(3);}return A[key].box;}});
    if(l.waist||l.head)button(mounted.get(3).tools,'↶ Towels',()=>{l.waist=false;l.head=false;rerender(3);});
  }
  function coloring(stage,tools){base(stage,'assets/page-04.png');const a=state.art;const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;canvas.className='color-canvas';canvas.setAttribute('aria-label','Color the capybara drawing');canvas.tabIndex=0;stage.append(canvas);const ctx=canvas.getContext('2d');
    // Paper on the easel. Drawing is clipped here, never over the room.
    function clip(){ctx.beginPath();ctx.moveTo(272,268);ctx.lineTo(872,268);ctx.lineTo(902,986);ctx.lineTo(238,986);ctx.closePath();ctx.clip();}
    function stroke(s){ctx.save();clip();ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=s.size;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();s.points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));if(s.points.length===1){ctx.arc(...s.points[0],s.size/2,0,Math.PI*2);ctx.fill();}else ctx.stroke();ctx.restore();}
    function redraw(){ctx.clearRect(0,0,W,H);a.strokes.forEach(stroke);}redraw();let active=null,pointer=null;
    function xy(e){const r=canvas.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height];}
    canvas.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;const p=xy(e);if(!inside(p,[238,268,664,718]))return;e.preventDefault();e.stopPropagation();canvas.setPointerCapture(e.pointerId);pointer=e.pointerId;active={color:a.color,size:a.size,points:[p]};a.strokes.push(active);stroke(active);S.marker();});
    canvas.addEventListener('pointermove',e=>{if(!active||pointer!==e.pointerId)return;e.preventDefault();e.stopPropagation();const p=xy(e),last=active.points.at(-1);active.points.push(p);stroke({...active,points:[last,p]});S.marker();});
    const end=e=>{if(pointer!==e.pointerId)return;active=null;pointer=null;save();};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
    const palette=document.createElement('div');palette.className='palette';palette.setAttribute('aria-label','Color palette');
    for(const [name,color]of[['Pink','#ed7a9f'],['Red','#d95c53'],['Orange','#f5a340'],['Yellow','#f4d255'],['Green','#77ad62'],['Blue','#69afe2'],['Purple','#a07ccc'],['Brown','#9f704d']]){const b=button(palette,'',()=>{a.color=color;palette.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));save();},'swatch');b.style.background=color;b.setAttribute('aria-label',name);b.setAttribute('aria-pressed',String(a.color===color));}tools.append(palette);
    const width=document.createElement('input');width.type='range';width.min=5;width.max=48;width.value=a.size;width.setAttribute('aria-label','Marker width');width.className='marker-size';width.addEventListener('input',()=>{a.size=Number(width.value);save();});tools.append(width);
    button(tools,'↶',()=>{a.strokes.pop();redraw();save();}).setAttribute('aria-label','Undo last marker stroke');
  }
  function salon(stage,tools){base(stage,'salon');const s=state.salon;const hair=artPiece(stage,'hair','Hair',A.hair.box,{static:true,z:3,className:'hair-layer'});hair.style.clipPath=`inset(0 0 ${100-s.cut/662*100}% 0)`;
    const updateCut=value=>{const before=s.cut;s.cut=clamp(value,80,662);hair.style.clipPath=`inset(0 0 ${100-s.cut/662*100}% 0)`;if(Math.abs(before-s.cut)>7&&performance.now()-last>110){last=performance.now();S.play('snip');}save();};
    const scissors=document.createElement('button');scissors.className='play-piece scissors';scissors.type='button';scissors.setAttribute('aria-label','Scissors');scissors.innerHTML='<svg viewBox="0 0 160 180"><path d="m55 112 70-99-39 111M107 116 10 28 72 134" fill="#d5dce2" stroke="#566573" stroke-width="6"/><circle cx="48" cy="142" r="25" fill="none" stroke="#ef8d9e" stroke-width="14"/><circle cx="110" cy="147" r="25" fill="none" stroke="#ef8d9e" stroke-width="14"/><circle cx="80" cy="112" r="8" fill="#5b6065"/></svg>';stage.append(scissors);const home=[60,1080,160,180];place(scissors,home);let last=0;
    drag(scissors,stage,home,{move:(p,xy)=>{if(inside(xy,[280,280,580,600])){updateCut(Math.min(s.cut,xy[1]-231));slider.value=s.cut;}},drop:()=>home,tap:()=>{updateCut(s.cut-90);slider.value=s.cut;}});
    const slider=document.createElement('input');slider.type='range';slider.min=80;slider.max=662;slider.value=s.cut;slider.setAttribute('aria-label','Hair length');slider.className='hair-length';slider.addEventListener('input',()=>updateCut(Number(slider.value)));tools.append(slider);
    for(const [key,target,label] of [['bow',[415,730,315,175],'Pink neck bow tie'],['glasses',[327,296,500,254],'Star sunglasses']]){const pos=s[key]?target:A[key].box;artPiece(stage,key,label,pos,{z:8,tap:()=>{s[key]=!s[key];rerender(5);},drop:p=>{s[key]=inside(center(p),[275,270,600,645]);rerender(5);return s[key]?target:A[key].box;}});}
  }
  function dressup(stage,tools,index){const isGacha=index===8,k=isGacha?'gacha':'toca',d=state[k];base(stage,k);
    const items=isGacha?[
      ['gachaPants',[126,752,270,377],'Baggy jeans'],['gachaTop',[104,574,320,254],'Cropped sweatshirt'],['gachaShoes',[156,1062,220,154],'Sneakers'],['headphones',[0,180,535,420],'Capybara headphones'],['handbag',[382,776,155,162],'Capybara handbag']
    ]:[['tocaSkirt',[177,595,249,164],'Brown skirt'],['tocaTop',[155,466,290,200],'Brown capybara shirt'],['tocaShoes',[193,794,210,109],'Brown shoes'],['tocaPurse',[333,465,145,276],'Capybara purse'],['hood',[91,111,421,416],'Open-face capybara hood']];
    const body=isGacha?[20,210,500,1000]:[35,120,510,805];
    items.forEach(([key,target,label],i)=>{const worn=d.worn.includes(key),home=A[key].box;const el=artPiece(stage,key,label,worn?target:home,{z:worn?9+i:3+i,tap:()=>{d.worn=worn?d.worn.filter(x=>x!==key):[...d.worn,key];rerender(index);say(worn?`${label} put back`:`Wearing ${label}`);},drop:p=>{const equip=inside(center(p),body,60);d.worn=d.worn.filter(x=>x!==key);if(equip)d.worn.push(key);rerender(index);return equip?target:home;}});el.setAttribute('aria-pressed',String(worn));if(worn&&key==='headphones'){el.innerHTML='';for(const [box,p] of [[[837,288,292,160],[3,0,94,63]],[[837,448,91,152],[10,58,19,37]],[[1007,448,122,152],[73,58,23,37]]]){const layer=document.createElement('span');layer.className='worn-piece';layer.innerHTML=cut(key,box);Object.assign(layer.style,{left:p[0]+'%',top:p[1]+'%',width:p[2]+'%',height:p[3]+'%'});el.append(layer);}}});
    if(!isGacha)artPiece(stage,'companion','Move little capybara beside her',d.companion||A.companion.box,{z:7,tap:()=>{d.companion=[390,751,310,310];rerender(7);},drop:p=>{d.companion=p;return p;}});
  }
  function board(stage,tools){base(stage,'board');const b=state.board;const names=['Trashcan capybara','Beach-ball capybara'];
    function pawnPos(i){const pos=b.positions[i];if(pos<0)return i===0?[832,1122,180,196]:[936,1179,180,168];const[x,y]=R.track[pos];return i===0?[x-54+(i===b.active?0:12),y-110,111,121]:[x-61,y-96,123,115];}
    function choose(i){if(b.remaining&&b.active!==i){say('Finish the current dice move first');return;}b.active=i;rerender(6);}
    function attempt(destination){const i=b.active,result=R.move(b.positions[i],b.remaining,destination);if(!result.valid){stage.querySelector(`[data-player="${i}"]`)?.classList.add('blocked');say('That move is not available');return false;}b.positions[i]=result.position;b.remaining=result.won?0:result.remaining;if(i===0)S.play('clunk');if(result.hazard)S.play(result.hazard==='snake'?'hiss':'munch');save();rerender(6);if(result.hazard){effect(stage,'heart',R.track[destination]);say(`${result.hazard}. Back to the start`);}else if(result.won){say(`${names[i]} reached the end`);effect(stage,'heart',R.track.at(-1));}else say(`${b.remaining} spaces remaining`);return true;}
    for(let i=0;i<2;i++){const pos=pawnPos(i),key=i===0?'trashPawn':'beachPawn';const pawn=artPiece(stage,key,names[i],pos,{z:10+i,className:b.active===i?'selected-pawn':'',tap:()=>choose(i),start:()=>{if(!b.remaining)b.active=i;},drop:p=>{if(i!==b.active)return pos;const pt=center(p);let best=-1,dist=Infinity;R.track.forEach((t,j)=>{const v=Math.hypot(t[0]-pt[0],t[1]-pt[1]);if(v<dist){dist=v;best=j;}});if(dist<150&&attempt(best))return pawnPos(i);return pos;}});pawn.dataset.player=i;}
    R.track.forEach((p,i)=>{const t=document.createElement('button');t.className='track-target';place(t,[p[0]-54,p[1]-47,108,94]);t.type='button';t.setAttribute('aria-label',`Move to space ${i+1}`);t.disabled=!R.move(b.positions[b.active],b.remaining,i).valid;t.addEventListener('click',()=>attempt(i));stage.append(t);});
    const dice=document.createElement('button');dice.type='button';dice.className='dice';dice.setAttribute('aria-label','Roll dice');dice.disabled=b.remaining>0;place(dice,[455,696,215,215]);stage.append(dice);
    const dotMap={1:[[50,50]],2:[[25,25],[75,75]],3:[[25,25],[50,50],[75,75]],4:[[25,25],[75,25],[25,75],[75,75]],5:[[25,25],[75,25],[50,50],[25,75],[75,75]],6:[[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]]};
    function face(n){dice.innerHTML=`<svg viewBox="0 0 100 100">${dotMap[n].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="#493c33"/>`).join('')}</svg>`;}face(b.die);
    dice.addEventListener('click',()=>{if(b.remaining)return;b.die=R.roll();b.remaining=b.die;S.play('roll');rerender(6);stage.querySelector('.dice')?.classList.add('rolling');say(`Rolled ${b.die}`);});
    for(let i=0;i<2;i++){const pick=button(tools,i===0?'🗑️':'🏖️',()=>choose(i));pick.setAttribute('aria-label',`Choose ${names[i]}`);pick.setAttribute('aria-pressed',String(b.active===i));pick.disabled=b.remaining>0&&b.active!==i;}
    const count=document.createElement('output');count.className='move-count';count.setAttribute('aria-label','Spaces remaining');count.textContent=b.remaining?`${b.remaining} ${b.remaining===1?'step':'steps'}`:'';tools.append(count);
  }
  function render(stage,tools,index){stage.replaceChildren();tools.replaceChildren();stage.dataset.page=index;stage.classList.toggle('is-activity',index>0&&index<9);mounted.set(index,{stage,tools});
    const fns={1:bedroom,2:closet,3:lake,4:coloring,5:salon,6:board,7:dressup,8:dressup};
    if(fns[index]){fns[index](stage,tools,index);const put=button(tools,'↶ Put back',()=>reset(index),'reset-page');put.setAttribute('aria-label',`Put back ${window.BOOK_PAGES[index].title}`);}else base(stage,window.BOOK_PAGES[index].src);
  }
  window.CapyPlay={mount:render,unmount(){mounted.clear();S.stop();},getState:()=>structuredClone(state)};
})();
