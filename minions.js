/* One locomotion/attack state per creature. Damage is applied once during the
   committed strike, never by passive contact. Timers use simulation time. */
const minionAI=(()=>{
 const brains=new Map(),Y=new THREE.Vector3(0,1,0);
 function reset(){brains.clear()}
 function data(m){let b=brains.get(m);if(!b){let a=m.userData;
   b={p:V(a.base.x,height(a.base.x,a.base.z)+(m.name==='火鸦'?2.35:.745),a.base.z),phase:'patrol',clock:0,gait:a.time,yaw:a.time,side:Math.sin(a.time)>0?1:-1,alert:false,cool:.6+a.time*.12,dir:V(),goal:V(),stuck:0,speed:0};brains.set(m,b)}return b}
 function see(a,b){return !Number.isFinite(rockField.first(a,b))}
 function change(b,name,time){b.phase=name;b.clock=time}
 function frame(m,dt,stunned){
  let b=data(m),bird=m.name==='火鸦',home=m.userData.base,p=b.p;
  const prey=decoy>0&&clones.length?clones[clones.length-1].obj.position:pos(),bait=prey!==pos(),gap=Math.hypot(prey.x-p.x,prey.z-p.z),homeDist=Math.hypot(p.x-home.x,p.z-home.z),ground=height(p.x,p.z);
  const target=V(prey.x,prey.y+.95,prey.z),stride=(dir,len)=>{
    if(!dir.lengthSq()||!len)return;
    // Look ahead and steer round rocks rather than walking into the same face.
    let eye=V(p.x,bird?p.y:ground+.48,p.z),travel=dir;
    const clear=d=>see(eye,eye.clone().addScaledVector(d,1.5+len));
    if(!clear(dir)&&b.phase!=='strike'){for(let a of [.57,1.05,1.55,2.04]){let alt=dir.clone().applyAxisAngle(Y,b.side*a);if(clear(alt)){travel=alt;break}}}
    if(bird){if(clear(travel))p.addScaledVector(travel,len)}else rockField.move(p,travel,len);
    const desired=Math.atan2(-travel.x,-travel.z),delta=desired-b.yaw;b.yaw+=Math.atan2(Math.sin(delta),Math.cos(delta))*Math.min(1,dt*12)};
  if(stunned){if(b.phase==='windup'||b.phase==='strike')change(b,'recover',.42);b.speed=0}
  else{
   b.cool=Math.max(0,b.cool-dt);b.clock-=dt;
   if(!b.alert&&gap<29&&homeDist<48&&see(V(p.x,p.y+.2,p.z),target))b.alert=true;
   if(gap>43||homeDist>52)b.alert=false;
   if(b.phase==='patrol'||b.phase==='chase'){
    b.phase=b.alert?'chase':'patrol';
    if(b.alert)b.goal.copy(prey);else{let t=gameT*.53+m.userData.time;b.goal.set(home.x+Math.sin(t)*3,0,home.z+Math.cos(t)*2.3)}
    let d=b.goal.clone().sub(p);d.y=0;b.speed=b.alert?(bird?5.9:5.25):(bird?1.65:1.35);
    if(b.alert&&gap<(bird?6.2:2.35)&&b.cool<=0&&see(V(p.x,p.y+.1,p.z),target)){
     b.dir.copy(d.normalize());if(!b.dir.lengthSq())b.dir.set(-Math.sin(b.yaw),0,-Math.cos(b.yaw));
     b.yaw=Math.atan2(-b.dir.x,-b.dir.z);b.goal.copy(target);b.diveSpeed=Math.min(15,gap/.41);b.spent=false;b.bait=bait;change(b,'windup',bird?.55:.44);b.speed=0
    }else{if(bird&&b.alert&&b.cool>0&&gap<6){d.normalize().applyAxisAngle(Y,b.side*(gap<3?2.25:1.55)).multiplyScalar(2.4);b.speed=3.2}
     let len=Math.min(d.length(),b.speed*dt);stride(d.normalize(),len);b.gait+=len*(bird?2:4.1)}
   }else if(b.phase==='windup'){if(b.clock<=0){change(b,'strike',bird?.54:.32);b.fromY=p.y}}
   else if(b.phase==='strike'){
    stride(b.dir,dt*(bird?b.diveSpeed:6.2));
    if(bird){let t=Math.min(1,(.54-b.clock)/.41);p.y=Math.max(height(p.x,p.z)+.52,b.fromY+(b.goal.y-b.fromY)*t)}
    let toHero=pos().clone().add(V(0,.95,0)).sub(p),front=b.dir.dot(toHero);
    if(!b.spent&&!b.bait&&!bait&&front>-.38&&front<1.6&&Math.abs(toHero.y)<1.3&&Math.hypot(toHero.x,toHero.z)<(bird?1.3:1.5)&&see(p,target)){
     b.spent=true;hurt(bird?7:9,m)}
    if(b.clock<=0){change(b,'recover',bird?.83:.64);b.cool=bird?1.6:1.0}
   }else if(b.phase==='recover'&&b.clock<=0)change(b,b.alert?'chase':'patrol',0)
  }
  const h=height(p.x,p.z);if(!bird)p.y=h+.745+(!stunned&&b.phase==='chase'?.042*Math.abs(Math.sin(b.gait)):0);
  else if(b.phase!=='strike'){let y=h+(b.phase==='windup'?3.35:2.35)+.28*Math.sin(gameT*2.7+m.userData.time);p.y+=(y-p.y)*Math.min(1,dt*6)}
  m.position.copy(p);m.rotation.set(bird&&b.phase==='strike'?-.46:0,b.yaw,0);
  const wind=b.phase==='windup',swipe=b.phase==='strike';if(!stunned)motion.poseMinion(m,bird?gameT+m.userData.time:b.gait);
  if(!bird){let hi=m.levels[0].object;if(!b.limbs)b.limbs=['leftArm','rightArm','leftLeg','rightLeg'].map(n=>hi.getObjectByName(n));
   let [la,ra,ll,rl]=b.limbs,k=b.phase==='chase'?.76:b.phase==='patrol'?.32:0,f=Math.sin(b.gait)*k;
   ll.rotation.x=f;rl.rotation.x=-f;la.rotation.x=wind?-.62:swipe?.88:-f*.73;ra.rotation.x=wind?-1.96:swipe?1.16:f*.79;
   m.rotation.x=wind?.18:swipe?-.32:0
  }else if(wind)m.rotation.x=.31;
 }
 return {frame,reset,alert(m){data(m).alert=true}}
})();
