/* Route progress is always forward, even when a pawn travels from the top end. */
(function(root) {
  const track = [[654,1234],[470,1221],[291,1192],[143,1140],[122,1000],[248,918],[418,938],[586,987],[755,979],[925,917],[1012,800],[1007,650],[930,525],[800,461],[641,453],[460,445],[279,437],[180,337],[226,217],[371,153],[540,169],[686,227],[820,280],[970,275]];
  const trophy=[575,565],hazards={2:'crocodile',18:'snake'};
  // The trophy covers the central track square. Each route follows the printed
  // squares from its own end until it meets the same trophy.
  const routeTiles=[Array.from({length:14},(_,i)=>i),Array.from({length:9},(_,i)=>23-i)];
  const routes=routeTiles.map(tiles=>[...tiles.map(i=>track[i]),trophy]);
  const newGame=()=>({version:2,positions:[0,0],active:0,remaining:0,die:1,winner:null});
  function move(position,remaining,destination,player=0) {
    const route=routes[player],distance=destination-position;
    if(!route||!Number.isInteger(position)||!Number.isInteger(remaining)||remaining<1||remaining>6||position<0||position>=route.length-1||!Number.isInteger(destination)||destination>=route.length||distance<=0||distance>remaining)return{valid:false,position,remaining};
    const left=remaining-distance,won=destination===route.length-1;
    const hazard=left===0?hazards[routeTiles[player][destination]]:undefined;
    return{valid:true,position:hazard?0:destination,remaining:hazard||won?0:left,hazard,won};
  }
  function roll(random=Math.random){return Math.min(6,Math.floor(random()*6)+1);}
  function beginRoll(game,die){
    if(game.winner!==null||game.remaining||!Number.isInteger(die)||die<1||die>6)return false;
    game.die=die;game.remaining=die;return true;
  }
  function advance(game,player,destination){
    if(game.winner!==null||player!==game.active)return{valid:false};
    const result=move(game.positions[player],game.remaining,destination,player);
    if(!result.valid)return result;
    game.positions[player]=result.position;game.remaining=result.remaining;
    if(result.won)game.winner=player;
    else if(!game.remaining)game.active=1-player;
    return result;
  }
  const rules={track,trophy,hazards,routeTiles,routes,newGame,move,roll,beginRoll,advance};
  if(typeof module!=='undefined')module.exports=rules;else root.CapyRules=rules;
})(typeof window==='undefined'?globalThis:window);
