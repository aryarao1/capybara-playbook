(() => {
  'use strict';
  const pages=window.BOOK_PAGES,book=document.getElementById('book'),previous=document.getElementById('previous'),next=document.getElementById('next'),picker=document.getElementById('page-picker'),dots=document.getElementById('dots'),grid=document.getElementById('page-grid');
  const wide=matchMedia('(min-width: 1000px)'),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let current=-1,visible=[],animation;
  const parsePage=()=>{const m=location.hash.match(/^#page=(\d+)$/);return m?Math.max(0,Math.min(pages.length-1,Number(m[1])-1)):0;};
  pages.forEach((page,i)=>{const dot=document.createElement('button');dot.className='dot';dot.setAttribute('aria-label',`${i+1}: ${page.title}`);dot.title=page.title;dot.addEventListener('click',()=>go(i));dots.append(dot);const thumbnail=document.createElement('button');thumbnail.className='thumbnail';const preview=document.createElement('img');preview.src=`${page.src}?v=${page.sha256.slice(0,12)}`;preview.alt='';preview.loading='lazy';preview.width=page.width;preview.height=page.height;thumbnail.append(preview,`${String(i+1).padStart(2,'0')} · ${page.title}`);thumbnail.addEventListener('click',()=>{go(i);picker.close();});grid.append(thumbnail);});
  function show(index,force=false){if(index===current&&!force)return;const old=current;current=index;window.CapyPlay.unmount();
    visible=wide.matches&&index>0&&index<9?[index%2===1?index:index-1,index%2===1?index+1:index]:[index];
    book.replaceChildren();book.classList.toggle('spread',visible.length===2);book.classList.toggle('cover',index===0||index===9);
    visible.forEach(i=>{const shell=document.createElement('section');shell.className='page-shell';shell.setAttribute('aria-label',pages[i].title);const stage=document.createElement('div');stage.className='scene';stage.setAttribute('aria-label',`${pages[i].title} activity`);const toolbar=document.createElement('div');toolbar.className='activity-tools';toolbar.setAttribute('aria-label',`${pages[i].title} tools`);shell.append(stage,toolbar);book.append(shell);window.CapyPlay.mount(stage,toolbar,i);});
    document.getElementById('page-title').textContent=visible.map(i=>pages[i].title).join(' · ');
    document.getElementById('counter').textContent=`${visible.map(i=>String(i+1).padStart(2,'0')).join('–')} / ${pages.length}`;
    document.getElementById('announcement').textContent=visible.map(i=>pages[i].title).join(' and ');
    previous.disabled=current===0;next.disabled=current===9;
    [...dots.children,...grid.children].forEach((b,i)=>visible.includes(i%pages.length)?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'));
    animation?.cancel();if(old>=0&&!reducedMotion.matches)animation=book.animate([{opacity:.5,transform:'translateX(6px)'},{opacity:1,transform:'translateX(0)'}],{duration:200,easing:'ease-out'});
  }
  function go(i){const n=Math.max(0,Math.min(9,i));history.replaceState(null,'',`#page=${n+1}`);show(n);}
  function forward(){go(visible.at(-1)+1);}function backward(){go(visible[0]-1);}
  previous.addEventListener('click',backward);next.addEventListener('click',forward);
  document.getElementById('browse').addEventListener('click',()=>picker.showModal());document.getElementById('close-picker').addEventListener('click',()=>picker.close());
  picker.addEventListener('click',e=>{const r=picker.getBoundingClientRect();if(e.target===picker&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))picker.close();});
  window.addEventListener('hashchange',()=>show(parsePage()));wide.addEventListener('change',()=>show(current,true));
  document.addEventListener('keydown',e=>{if(picker.open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,.play-piece,canvas'))return;if(e.key==='ArrowRight'){e.preventDefault();forward();}if(e.key==='ArrowLeft'){e.preventDefault();backward();}if(e.key==='Home'){e.preventDefault();go(0);}if(e.key==='End'){e.preventDefault();go(9);}});
  let start;book.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.target.closest('.is-activity,button,input'))return;start={x:e.clientX,y:e.clientY,id:e.pointerId};});book.addEventListener('pointerup',e=>{if(!start||start.id!==e.pointerId)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4){if(dx<0)forward();else backward();}});book.addEventListener('pointercancel',()=>start=null);
  const sound=document.getElementById('sound');function soundLabel(){sound.textContent=window.CapySound.muted?'🔇 Sound off':'🔊 Sound on';sound.setAttribute('aria-pressed',String(!window.CapySound.muted));}sound.addEventListener('click',()=>{const muted=window.CapySound.toggle();soundLabel();if(!muted)window.CapySound.play('sip');});soundLabel();
  show(parsePage());
})();
