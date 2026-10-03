const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const stored=new Map();let started=0,stopped=0,created=0;
const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
const node=()=>({connect(){return this;},start(){started++;},stop(){stopped++;},frequency:param(),gain:param(),Q:{value:0}});
class AudioContext {
 constructor(){created++;this.currentTime=0;this.sampleRate=1000;this.state='running';}
 createBuffer(_,length){return{getChannelData:()=>new Float32Array(length)};}
 createBufferSource(){return node();} createBiquadFilter(){return node();} createGain(){return node();} createOscillator(){return node();}
}
const context={window:{AudioContext},localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)},performance:{now:()=>1000},Math,Set};
const source=fs.readFileSync(require.resolve('../sounds.js'),'utf8');vm.runInNewContext(source,context);
const S=context.window.CapySound;
const actions=['wake','crunch','munch','sip','splash','snip','clunk','hiss','roll'];
actions.forEach(S.play);S.marker();assert.equal(created,0);
assert.equal(S.toggle(),false);actions.forEach(S.play);assert.ok(started>0);const playing=started;
assert.equal(S.toggle(),true);assert.equal(stopped,playing*2); // scheduled ends plus immediate mute
const before=started;actions.forEach(S.play);S.marker();assert.equal(started,before);
vm.runInNewContext(source,context);assert.equal(context.window.CapySound.muted,true);
context.window.CapySound.toggle();vm.runInNewContext(source,context);assert.equal(context.window.CapySound.muted,false);
console.log('PASS: default mute, every action, immediate stop, mute persistence and unmute persistence');
