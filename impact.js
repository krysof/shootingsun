/* Transient, world-space combat response only. Corpses are visual snapshots, never targets. */
const impactFX=(()=>{
 const states=new Map(),falls=[],pools=[],voices=new Set(),stepRay=new THREE.Raycaster(),segment=new THREE.Line3(),near=new THREE.Vector3();
 const cap=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),smooth=x=>(x=cap(x))*x*(3-2*x),between=(a,b)=>a+(b-a)*Math.random();
 let arena,fxRoot,bodyPivot,noise;
 function setup(){if(arena===S)return;arena=S;fxRoot=new T.Group();fxRoot.name='战斗瞬态';S.add(fxRoot);
  const configs=[['spark',288,new T.OctahedronGeometry(1,0),new T.MeshBasicMaterial({toneMapped:false})],['feather',104,new T.OctahedronGeometry(1,0),new T.MeshStandardMaterial({metalness:.12,roughness:.63})],['chip',136,new T.IcosahedronGeometry(1,0),new T.MeshStandardMaterial({flatShading:true,metalness:.31,roughness:.77})],['ash',180,new T.TetrahedronGeometry(1),new T.MeshBasicMaterial({})]];
  for(let [kind,count,geo,mat] of configs){let draw=new T.InstancedMesh(geo,mat,count);draw.frustumCulled=false;draw.name='瞬态 · '+kind;draw.instanceMatrix.setUsage(T.DynamicDrawUsage);draw.count=0;fxRoot.add(draw);pools.push({draw,kind,next:0,items:Array.from({length:count},()=>({ttl:0,P:V(),U:V(),spin:V(),ang:V(),size:V(),rgb:new T.Color()}))})}
  bodyPivot=new T.Group();bodyPivot.name='金乌受击重心';enemy.add(bodyPivot);bodyPivot.add(motion.bird.body)
 }
 function state(o){let s=states.get(o);if(!s){s={bank:new Map(),parts:[],flash:0,life:0,stun:0,debt:0,offset:V(),velocity:V(),sway:0,side:1};states.set(o,s)}return s}
 function isolate(o,s){if(s.parts.length)return;o.traverse(n=>{if(!n.isMesh||!n.material?.emissive)return;let source=n.material,m=s.bank.get(source);
   if(!m){m=source.clone();s.bank.set(source,m)}s.parts.push([n,source]);n.material=m})}
 function flash(s,p){for(let [orig,m] of s.bank){m.color.copy(orig.color).lerp(white,.45*p);
   m.emissive.copy(orig.emissive).multiplyScalar(orig.emissiveIntensity);m.emissive.r+=1.38*p;m.emissive.g+=.62*p;m.emissive.b+=.49*p;m.emissiveIntensity=1}}
 const white=new THREE.Color(0xf3eeed);
 function restore(s){for(let [n,m] of s.parts)n.material=m;s.parts.length=0;for(let m of s.bank.values())m.dispose();s.bank.clear()}
 function resetBoss(){if(!enemy)return;let s=states.get(enemy);if(s){restore(s);states.delete(enemy)}if(bodyPivot){bodyPivot.position.set(0,0,0);bodyPivot.rotation.set(0,0,0)}}
 function purge(o){o.root.removeFromParent();for(let m of o.materials)m.dispose()}
 function reset(){setup();for(let s of states.values())restore(s);states.clear();resetBoss();for(let c of falls)purge(c);falls.length=0;
  for(let p of pools){for(let s of p.items)s.ttl=0;p.draw.count=0}for(let o of critters){o.rotation.x=o.rotation.z=0}}
 // Keep original generous body hit volumes; when possible use a real mesh intersection for the hit effect.
 function contact(o,a,b){if(!o.visible)return null;segment.set(a,b);segment.closestPointToPoint(o.position,true,near);let ds=near.distanceToSquared(o.position),boss=o===enemy,core=ds<(boss?3.1**2:.98**2);
  if(!core&&(!boss||ds>(10*o.scale.x)**2))return null;let dir=b.clone().sub(a),len=dir.length();if(!len)return null;dir.divideScalar(len);
  const model=o.isLOD?o.levels[0].object:o;o.updateWorldMatrix(true,true);stepRay.set(a,dir);stepRay.near=0;stepRay.far=len+(core?(boss?3.6:1.15):0);let h=stepRay.intersectObject(model,true)[0];if(h)return h.point;
  if(!core)return null;let outward=near.clone().sub(o.position);if(outward.lengthSq()<.01)outward.copy(dir).negate();outward.normalize();
  stepRay.set(o.position.clone().addScaledVector(outward,boss?6:2),outward.clone().negate());stepRay.far=boss?10:3;return stepRay.intersectObject(model,true)[0]?.point||o.position.clone()}
 function emit(kind,p,v,scale,life,col){let pool=pools[kind],s=pool.items[pool.next++%pool.items.length];s.P.copy(p);s.U.copy(v);s.ttl=s.total=life;s.rgb.set(col);s.ang.set(between(0,6),between(0,6),between(0,6));s.spin.set(between(-9,9),between(-7,7),between(-9,9));s.seed=between(0,6);
  if(kind===0)s.size.set(scale*.38,scale*2.3,scale*.38);if(kind===1)s.size.set(scale*.56,scale*.14,scale*1.65);if(kind===2)s.size.set(scale*.85,scale*1.15,scale*.67);if(kind===3)s.size.setScalar(scale);s.floor=height(p.x,p.z)+.025;s.bounces=0}
 const hues=[[0xffe8df,0xffac95,0xe56f54],[0x443e41,0x795c51,0x575356],[0x71534e,0x4d4e56,0x713f39],[0xaaa09a,0x8b8383,0xd6c8c1]];
 function spray(kind,p,d,count,energy,size,life){for(let i=0;i<count;i++){let v=V(between(-1,1),between(-.35,1.30),between(-1,1)).addScaledVector(d,between(-.24,.76));v.normalize().multiplyScalar(energy*between(.42,1.12));
   emit(kind,p.clone().addScaledVector(v,.013),v,size*between(.68,1.32),life*between(.70,1.23),hues[kind][i%3])}}
 const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),unit=new THREE.Vector3(),color=new THREE.Color();
 function particles(dt){for(let p of pools){let n=0,k=p.kind;for(let s of p.items){if(s.ttl<=0)continue;s.ttl-=dt;if(s.ttl<=0)continue;let t=1-s.ttl/s.total,fade=Math.max(.008,1-smooth((t-.29)/.71));
    if(dt){s.U.y+=(k===1?-3.7:k===3?-1.9:k===2?-10.5:-7.2)*dt;let drag=Math.exp(-dt*(k===0?2.4:k===3?2.5:1.15));s.U.x*=drag;s.U.z*=drag;s.P.addScaledVector(s.U,dt);
     if(k===1||k===3)s.P.x+=Math.sin(s.seed+t*10)*dt*(k===1?.43:.23);
     if(s.P.y<s.floor){s.P.y=s.floor;if(s.U.y<0){s.U.y*=k===2&&s.bounces<2?-.30:0;s.U.x*=.58;s.U.z*=.58;s.bounces++}}
     s.ang.addScaledVector(s.spin,dt*(s.bounces?.16:1))}
    dummy.position.copy(s.P);if(k===0&&s.U.lengthSq()>.001)dummy.quaternion.setFromUnitVectors(up,unit.copy(s.U).normalize());else dummy.rotation.set(s.ang.x,s.ang.y,s.ang.z);
    dummy.scale.copy(s.size).multiplyScalar(k===0?fade:.22+.78*fade);if(k!==0&&t>.79)dummy.scale.multiplyScalar(cap((1-t)/.21));dummy.updateMatrix();p.draw.setMatrixAt(n,dummy.matrix);
    color.copy(s.rgb).multiplyScalar(k===0?.28+2.40*fade:.74+.30*fade);p.draw.setColorAt(n,color);n++}
   p.draw.count=n;p.draw.instanceMatrix.needsUpdate=true;if(p.draw.instanceColor)p.draw.instanceColor.needsUpdate=true}}
 // Noise transient + resonant body + material tail; bounded voices and stereo placement. No music changes.
 function sfx(kind,p,big=false,landing=false){if(mute||!ac||ac.state!=='running'||voices.size>15)return;let t=ac.currentTime,c=ac,dist=p.distanceTo(pos()),sp=c.createStereoPanner(),gain=c.createGain(),d=landing?(big?.75:.43):big?.32:.22;
  let rel=p.clone().sub(C.position),right=V().setFromMatrixColumn(C.matrixWorld,0);sp.pan.value=cap(rel.dot(right)/Math.max(2,rel.length()),-.8,.8);
  gain.gain.value=(landing?.50:.42)/(1+dist*.014);gain.connect(sp).connect(c.destination);voices.add(gain);
  if(!noise){noise=c.createBuffer(1,Math.ceil(c.sampleRate*.9),c.sampleRate);let a=noise.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}
  let parts=[],src=c.createBufferSource(),filter=c.createBiquadFilter(),env=c.createGain();src.buffer=noise;filter.type='bandpass';filter.frequency.setValueAtTime(landing?(big?370:690):kind==='stone'?2900:1770,t);filter.frequency.exponentialRampToValueAtTime(landing?115:400,t+d*.85);filter.Q.value=kind==='stone'?.86:.58;
  env.gain.setValueAtTime(.001,t);env.gain.exponentialRampToValueAtTime(landing?.66:.58,t+.006);env.gain.exponentialRampToValueAtTime(.0001,t+d);src.connect(filter).connect(env).connect(gain);src.start(t);src.stop(t+d);parts.push(src,filter,env);
  function partial(f,to,amp,len,lag=0,type='sine'){let o=c.createOscillator(),e=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t+lag);o.frequency.exponentialRampToValueAtTime(to,t+lag+len);e.gain.setValueAtTime(.0001,t+lag);e.gain.exponentialRampToValueAtTime(amp,t+lag+.005);e.gain.exponentialRampToValueAtTime(.0001,t+lag+len);o.connect(e).connect(gain);o.start(t+lag);o.stop(t+lag+len+.01);parts.push(o,e)}
  partial(big?115:kind==='stone'?240:175,big?33:58,landing?.65:.47,d*.87);if(kind==='stone'){partial(1190,630,.16,.115,.013,'triangle');partial(1760,990,.095,.093,.044)}else partial(landing?285:545,landing?89:195,.14,.13,.016,'triangle');
  setTimeout(()=>{for(let node of parts)node.disconnect();gain.disconnect();sp.disconnect();voices.delete(gain)},(d+.21)*1000)}
 function strike(o,damage,where,direction){setup();let boss=o===enemy,stone=o.name==='焰灵',s=state(o),d=direction?.clone()||o.position.clone().sub(pos());if(d.lengthSq()<.001)d.set(0,0,-1);d.normalize();
  const at=where?.clone()||o.position.clone().add(V(0,boss?.40:.06,0));isolate(o,s);s.life=s.flash=boss?.17:.135;s.side=d.clone().applyQuaternion(o.quaternion.clone().invert()).x<0?-1:1;flash(s,boss?.62:1);
  let hard=damage>=20||boss;const shove=V(d.x,boss?0:.18,d.z);if(shove.lengthSq()<.001)shove.z=-1;shove.normalize();
  if(!boss){s.stun=Math.max(s.stun,damage>=20?.28:stone?.19:.23);s.velocity.addScaledVector(shove,Math.min(10,(stone?5.6:7.5)+damage*.10));s.velocity.clampLength(0,11);s.sway=1}
  else{s.velocity.addScaledVector(shove,Math.min(3,1+damage*.056));s.velocity.clampLength(0,3.6);s.sway=1}
  spray(0,at,d,hard?22:13,boss?7.4:4.8,boss?.082:.055,.32);spray(stone?2:1,at,d,hard?8:4,boss?4.7:2.7,boss?.125:.069,.72);spray(3,at,d,boss?9:5,2,.033,.51);particles(0);
  sfx(stone?'stone':'feather',at,boss);return d}
 function spring(s,dt){s.velocity.addScaledVector(s.offset,-86*dt);s.velocity.multiplyScalar(Math.exp(-8*dt));s.offset.addScaledVector(s.velocity,dt);s.sway=Math.max(0,s.sway-dt*4.3)}
 function minion(m,dt){let s=states.get(m),held=s&&s.stun>0;if(s){s.stun=Math.max(0,s.stun-dt);spring(s,dt)}
  minionAI.frame(m,dt,held);if(s){let flat=V(s.offset.x,0,s.offset.z),len=flat.length();if(len>.001)rockField.move(m.position,flat.normalize(),len);m.position.y+=s.offset.y;m.rotation.x-=s.sway*.26;m.rotation.z+=s.side*s.sway*.31}return !held}
 function rock(p,velocity){let d=velocity.clone().normalize().negate();spray(2,p,d,7,2.8,.054,.46);spray(3,p,d,5,1.35,.039,.36);particles(0);sfx('stone',p)}
 function burnMaterial(src,uniform,flare){const m=src.clone();const old=src.onBeforeCompile,cache=src.customProgramCacheKey();m.customProgramCacheKey=()=>cache+'|corpse-ash-v1';
  m.onBeforeCompile=function(shader,renderer){old.call(this,shader,renderer);shader.uniforms.uAsh=uniform;shader.uniforms.uFlare=flare;
   shader.vertexShader='varying vec3 vAshP;\n'+shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vAshP=(modelMatrix*vec4(transformed,1.)).xyz;');
   shader.fragmentShader='varying vec3 vAshP;uniform float uAsh,uFlare;float flake(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}\n'+shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight+=vec3(1.4,.70,.52)*uFlare;if(uAsh>0.){float a=.64*flake(floor(vAshP*14.))+.36*flake(floor(vAshP*4.8));if(a<uAsh)discard;outgoingLight+=vec3(1.55,.46,.25)*(1.-smoothstep(.0,.095,a-uAsh));}\n#include <opaque_fragment>')};return m}
 function capture(o){let orig=o.isLOD?o.levels[0].object:o,root=orig.clone(true),table=new Map(),materials=new Map(),uniform={value:0},flare={value:1};
  function link(a,b){table.set(a,b);for(let i=0;i<a.children.length;i++)link(a.children[i],b.children[i])}link(orig,root);
  root.traverse(n=>{if(!n.isMesh)return;let m=materials.get(n.material);if(!m){m=burnMaterial(n.material,uniform,flare);materials.set(n.material,m)}n.material=m});
  root.position.copy(o.position);root.quaternion.copy(o.quaternion);root.scale.copy(o.scale);root.visible=true;root.name=o.name+' · 余烬';fxRoot.add(root);
  return {root,table,uniform,flare,materials:[...materials.values()]}}
 function death(o,d){const boss=o===enemy,stone=o.name==='焰灵',s=states.get(o);if(s)flash(s,0);
  const c=capture(o);if(s){restore(s);states.delete(o)}c.boss=boss;c.stone=stone;c.age=0;c.emit=0;c.landed=false;c.burn=false;c.dir=d.clone();c.dir.y=0;if(c.dir.lengthSq()<.002)c.dir.set(1,0,0);c.dir.normalize();c.side=s?.side||1;c.start=o.position.clone();c.rot=o.quaternion.clone();
  c.end=c.start.clone().addScaledVector(c.dir,boss?2.8:stone?.62:1.15);c.end.y=height(c.end.x,c.end.z)+(boss?.77*o.scale.x:stone?.30:.19);
  c.drop=cap(Math.sqrt(2*Math.max(.12,c.start.y-c.end.y)/(boss?18:11))+.095,boss?.44:.30,boss?1.25:1.02);
  c.finish=boss?2.08:c.drop+(stone?.92:.80);c.fade=c.drop+(boss?.23:stone?.29:.23);
  c.bones=[];function bind(n,axis,angle){if(n)c.bones.push({n,axis,from:n.rotation[axis],to:angle})}
  if(boss){const b=motion.bird;for(let w of b.spars){bind(c.table.get(w.shoulder),'z',w.a*-.37);bind(c.table.get(w.wrist),'y',w.a*-.98)}bind(c.table.get(b.neck),'x',-.47);bind(c.table.get(b.jaw),'x',-.32);bind(c.table.get(b.tail),'x',.28)}
  else if(stone){bind(c.root.getObjectByName('leftArm'),'z',-.55);bind(c.root.getObjectByName('rightArm'),'x',-.93);bind(c.root.getObjectByName('mask'),'x',-.49)}
  else{bind(c.root.getObjectByName('leftWing'),'z',.63+c.side*.29);bind(c.root.getObjectByName('rightWing'),'y',-.88)}
  c.table.clear();falls.push(c);spray(stone?2:1,c.start,c.dir,boss?22:stone?13:10,boss?6.5:3.3,boss?.21:.089,1.04);spray(0,c.start,c.dir,boss?31:13,boss?7.3:4.4,boss?.096:.060,.38);
  if(boss)sfx('feather',c.start,true,true);particles(0)}
 const rollQ=new THREE.Quaternion(),angles=new THREE.Euler();
 function advanceFall(c,dt){c.age+=dt;const t=cap(c.age/c.drop),impact=Math.max(0,c.age-c.drop),settle=Math.sin(Math.min(1,impact/.32)*Math.PI)*Math.exp(-impact*6);
  const p=c.root.position;p.copy(c.start).lerp(c.end,1-(1-t)**1.25);p.y=c.start.y+(c.end.y-c.start.y)*t**1.7+Math.sin(t*Math.PI)*(c.boss?.44:.19)+settle*(c.boss?.20:.085);
  c.root.quaternion.copy(c.rot).multiply(rollQ.setFromEuler(angles.set((c.stone?1.29:c.boss?-.30:-.44)*smooth(t),c.side*(c.boss?.28:.52)*smooth(t),c.side*(c.stone?.49:c.boss?.76:1.21)*smooth(t)+settle*.075)));
  const fold=smooth(t*.96+impact*.85);for(let b of c.bones)b.n.rotation[b.axis]=b.from+(b.to-b.from)*fold;
  if(t>=1&&!c.landed){c.landed=true;const ground=p.clone();ground.y=height(p.x,p.z)+.13;const n=c.boss?2.7:1;
    spray(0,ground,up,Math.round(16*n),5.8*n**.52,.064*n**.60,.39);spray(c.stone?2:1,ground,up,Math.round(12*n),3.7*n**.6,.094*n**.72,.81);
    spray(3,ground,up,Math.round(19*n),3.1*n**.7,.078*n,1.0);sfx(c.stone?'stone':'feather',ground,c.boss,true);if(c.boss)shake=Math.max(shake,.46)}
  const fade=cap((c.age-c.fade)/Math.max(.1,c.finish-c.fade));c.uniform.value=smooth(fade);c.flare.value=(1-smooth(c.age/.14))*(c.boss?.58:1);
  if(fade>0&&!c.burn){c.burn=true;c.root.traverse(n=>{if(n.isMesh)n.castShadow=false})}
  c.emit+=dt*(c.boss?25:12);while(c.emit>=1){c.emit--;let off=c.boss?1.45:.37;let at=p.clone().add(V(between(-off,off),between(.08,off+.17),between(-off,off)));
    if(fade>0){emit(3,at,V(between(-.65,.65),between(1,2.7),between(-.65,.65)),c.boss?.084:.043,.50,fade>.44?0xd8cccc:0x94888b);if(fade<.75)emit(0,at,V(between(-.6,.6),between(1.0,2.8),between(-.6,.6)),c.boss?.059:.034,.27,0xffc8b9)}
    else if(!c.landed)emit(c.stone?2:1,at,V(between(-1,1),between(-1,1),between(-1,1)),c.boss?.14:.062,.73,c.stone?0x56545a:0x705850)}
  return c.age>=c.finish}
 function update(dt){if(!arena)return;
  for(let [o,s] of states){if(s.flash>0){s.flash=Math.max(0,s.flash-dt);flash(s,(s.flash/s.life)**1.25*(o===enemy?.62:1))}
   if(o===enemy){spring(s,dt);bodyPivot.position.copy(s.offset).applyQuaternion(enemy.quaternion.clone().invert());bodyPivot.rotation.set(-.13*s.sway,0,s.side*.145*s.sway)}}
  for(let i=falls.length-1;i>=0;i--)if(advanceFall(falls[i],dt)){purge(falls[i]);falls.splice(i,1)}
  particles(dt)}
 return {rock,reset,resetBoss,contact,strike,death,minion,update}
})();
