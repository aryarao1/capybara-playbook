(() => {
  let context, muted=true, brush, lastBrush=0;
  const active=new Set();
  try { muted=localStorage.getItem('capy-muted')!=='false'; } catch {}
  function get() {
    if(muted) return null;
    context ||= new (window.AudioContext||window.webkitAudioContext)();
    if(context.state==='suspended') context.resume().catch(()=>{});
    return context;
  }
  function noise(duration,frequency,gain=.12,delay=0,q=.5) {
    const c=get();if(!c)return;
    const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),d=buffer.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1);
    const s=c.createBufferSource(),filter=c.createBiquadFilter(),volume=c.createGain();
    s.buffer=buffer;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=q;
    const t=c.currentTime+delay;volume.gain.setValueAtTime(0,t);volume.gain.linearRampToValueAtTime(gain,t+.012);volume.gain.exponentialRampToValueAtTime(.0001,t+duration);
    s.connect(filter).connect(volume).connect(c.destination);s.start(t);s.stop(t+duration);active.add(s);s.onended=()=>active.delete(s);return s;
  }
  function tone(frequency,duration,gain=.1,delay=0,end=frequency,type='sine') {
    const c=get();if(!c)return;const s=c.createOscillator(),v=c.createGain(),t=c.currentTime+delay;
    s.type=type;s.frequency.setValueAtTime(frequency,t);s.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);
    v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(gain,t+.014);v.gain.exponentialRampToValueAtTime(.0001,t+duration);
    s.connect(v).connect(c.destination);s.start(t);s.stop(t+duration);active.add(s);s.onended=()=>active.delete(s);
  }
  function play(name) {
    if(muted)return;
    if(name==='wake') { // Warm voiced breath, with falling ah-like formants.
      noise(.9,700,.075,0,1.1);tone(190,.9,.07,0,135);tone(760,.85,.018,0,580);tone(1120,.8,.011,0,950);
    }
    if(name==='crunch'||name==='munch') for(let i=0;i<4;i++){noise(.12,1100+i*230,.2,i*.17,1);tone(150,.07,.045,i*.17,80);}
    if(name==='sip') {noise(.7,1400,.09,0,2.5);for(let i=0;i<4;i++)tone(400+i*40,.06,.035,i*.15,220);}
    if(name==='splash') {noise(.65,1100,.22);noise(.45,3500,.09,.06);for(let i=0;i<5;i++)tone(500+i*90,.13,.025,i*.09,120);}
    if(name==='snip') {noise(.07,3200,.14);noise(.065,2200,.13,.12);}
    if(name==='clunk') {tone(180,.24,.2,0,90);tone(780,.35,.07);tone(1120,.25,.045);noise(.045,1100,.17);}
    if(name==='hiss') noise(.75,5000,.13,0,1.2);
    if(name==='roll') for(let i=0;i<5;i++)noise(.035,900,.065,i*.08);
  }
  function marker() {
    const now=performance.now();if(now-lastBrush<65)return;lastBrush=now;
    brush=noise(.10,650,.045,0,.55); // Soft broadband friction, no pitched squeak.
  }
  function stop(){active.forEach(s=>{try{s.stop();}catch{}});active.clear();brush=null;}
  function toggle(){muted=!muted;if(muted)stop();try{localStorage.setItem('capy-muted',String(muted));}catch{}return muted;}
  window.CapySound={play,marker,stop,toggle,get muted(){return muted;}};
})();
