const assert=require('node:assert/strict');const R=require('../game-rules.js');
assert.deepEqual(R.routes[0][0],R.track[0]);assert.deepEqual(R.routes[1][0],R.track.at(-1));
for(let player=0;player<2;player++){
 const finish=R.routes[player].length-1;
 assert.deepEqual(R.routes[player][finish],R.trophy);
 for(let roll=1;roll<=6;roll++){
  assert.equal(R.move(0,roll,roll,player).valid,true);
  assert.equal(R.move(0,roll,roll+1,player).valid,false);
  assert.equal(R.move(1,roll,0,player).valid,false);
  const first=R.move(0,roll,1,player);assert.equal(first.remaining,roll-1);
  assert.equal(R.move(first.position,first.remaining,roll+1,player).valid,false);
 }
 assert.equal(R.move(finish-1,6,finish,player).won,true);
 assert.equal(R.move(finish,1,finish+1,player).valid,false);
 const game=R.newGame();game.active=player;game.positions[player]=finish-1;
 assert.ok(R.beginRoll(game,2));assert.ok(!R.beginRoll(game,6));
 assert.equal(R.advance(game,1-player,1).valid,false);
 assert.equal(R.advance(game,player,finish).won,true);assert.equal(game.winner,player);
 assert.ok(!R.beginRoll(game,3));assert.equal(R.advance(game,1-player,1).valid,false);
}
for(const [player,destination,hazard]of [[0,2,'crocodile'],[1,5,'snake']]){
 const game=R.newGame();game.active=player;R.beginRoll(game,destination);
 assert.equal(R.advance(game,player,destination).hazard,hazard);
 assert.equal(game.positions[player],0);assert.equal(game.active,1-player);
 assert.equal(R.move(0,destination+1,destination,player).hazard,undefined);
}
assert.equal(R.move(4,0,5).valid,false);assert.equal(R.move(4,3,5.5).valid,false);
assert.equal(R.roll(()=>0),1);assert.equal(R.roll(()=>.9999),6);
assert.deepEqual(R.newGame(),{version:2,positions:[0,0],active:0,remaining:0,die:1,winner:null});
console.log('PASS: opposite ends, both trophy routes, dice bounds, forward moves, own-end hazards, alternating turns, either winner, winner lock and replay');
