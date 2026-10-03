const assert=require('node:assert/strict');const R=require('../game-rules.js');
for(let roll=1;roll<=6;roll++){
 assert.equal(R.move(4,roll,4+roll).valid,true);
 assert.equal(R.move(4,roll,5+roll).valid,false);
 assert.equal(R.move(4,roll,3).valid,false);
 const first=R.move(4,roll,5);assert.equal(first.remaining,roll-1);
 assert.equal(R.move(first.position,first.remaining,4+roll+1).valid,false);
}
assert.equal(R.move(-1,3,2).hazard,'crocodile');assert.equal(R.move(16,2,18).hazard,'snake');
assert.equal(R.move(16,3,18).hazard,undefined);assert.equal(R.move(16,3,18).remaining,1);
assert.equal(R.move(22,1,23).won,true);assert.equal(R.move(23,1,24).valid,false);
assert.equal(R.move(4,0,5).valid,false);assert.equal(R.move(4,3,5.5).valid,false);
assert.equal(R.roll(()=>0),1);assert.equal(R.roll(()=>.9999),6);
console.log('PASS: all dice amounts, forward-only movement, remaining-step limits, hazards, finish, and roll bounds');
