/* Board rules are independent of presentation so pointer and keyboard moves agree. */
(function(root) {
  const track = [[654,1234],[470,1221],[291,1192],[143,1140],[122,1000],[248,918],[418,938],[586,987],[755,979],[925,917],[1012,800],[1007,650],[930,525],[800,461],[641,453],[460,445],[279,437],[180,337],[226,217],[371,153],[540,169],[686,227],[820,280],[970,275]];
  const hazards = {2:'crocodile',18:'snake'};
  function move(position, remaining, destination) {
    const distance = destination-position;
    if (!Number.isInteger(destination) || destination<0 || destination>=track.length || distance<=0 || distance>remaining) return {valid:false,position,remaining};
    const left = remaining-distance;
    // Hazards trigger only on the square where the dice move finishes, not while passing it.
    const hazard = left===0 ? hazards[destination] : undefined;
    return {valid:true,position:hazard ? -1 : destination,remaining:hazard ? 0 : left,hazard,won:destination===track.length-1};
  }
  function roll(random=Math.random) { return Math.min(6,Math.floor(random()*6)+1); }
  const rules={track,hazards,move,roll};
  if(typeof module!=='undefined') module.exports=rules;
  else root.CapyRules=rules;
})(typeof window==='undefined'?globalThis:window);
