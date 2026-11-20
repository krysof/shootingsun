/* Articulated figures. Logic roots never roll or bob: all secondary motion lives below them. */
const motion=(()=>{
  let h,b,palette,reflections; const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n)),ease=t=>(t=clamp(t))*t*(3-2*t),lerp=(a,b,t)=>a+(b-a)*t,tau=2*Math.PI;
  function node(p,x=0,y=0,z=0){let n=new T.Group();p?.add(n);n.position.set(x,y,z);return n}
  function surface(color,m=.05,r=.75,map=null){return new T.MeshStandardMaterial({color,metalness:m,roughness:r,envMap:reflections||null,envMapIntensity:.76,...map&&{map,bumpMap:map,bumpScale:.009}})}
  function swatch(kind){let c=document.createElement('canvas');c.width=c.height=128;let g=c.getContext('2d'),im=g.createImageData(128,128),rand=seed(89+kind);
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){let i=(x+y*128)*4,w=kind===0?(y%4===0?-29:0)+(x%3===0?-16:0):kind===1?10*Math.sin(.42*x+Math.sin(y*.18)*4):4*Math.sin(.63*y);let v=221+w+rand()*25;im.data.set([v,v-3,v-6,255],i)}
    g.putImageData(im,0,0);if(kind===1){for(let i=0;i<83;i++){let x=rand()*128,y=rand()*128;line(g,x,y,x+rand()*5,y+rand()*18,'#7a766c55',.55)}}let t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);t.colorSpace=T.SRGBColorSpace;return t}
  let workshop;
  function mats(){if(!palette){workshop=houyiWorkshop({node,oval,form,band,pipe,batch,surface});palette=workshop.materials()}return palette}
  function oval(p,m,x,y,z,a,b,c){let o=mesh(new T.SphereGeometry(1,16,12),m,p,x,y,z);o.scale.set(a,b,c);return o}
  function form(p,m,rows,x=0,y=0,z=0,depth=.8,n=24){let geo=new T.LatheGeometry(rows.map(([r,h])=>new T.Vector2(r,h)),n);geo.scale(1,1,depth);return mesh(geo,m,p,x,y,z)}
  function band(p,m,y,r,zScale=.76,w=.042){return form(p,m,[[r-.01,-w],[r,0],[r,w*.65],[r-.012,w]],0,y,0,zScale)}
  function pipe(p,m,pts,r){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),Math.max(10,pts.length*4),r,6,false),m,p)}
  // Combine stationary meshes on each individual joint without merging across articulations.
  function batch(p){let map=new Map();for(let o of [...p.children]){if(!o.isMesh||o.isInstancedMesh)continue;let a=map.get(o.material)||[];a.push(o);map.set(o.material,a)}
    for(let [m,list] of map){if(list.length<2)continue;let at={position:[],normal:[],uv:[]},cnt=0,idx=[];if(m.vertexColors)at.color=[];for(let o of list){o.updateMatrix();let geo=o.geometry.clone().applyMatrix4(o.matrix),src=geo.attributes,n=src.position.count;for(let key of Object.keys(at)){let v=src[key];if(v)at[key].push(...v.array);else for(let k=0;k<n*(key==='uv'?2:3);k++)at[key].push(0)}if(geo.index){for(let j of geo.index.array)idx.push(j+cnt)}else for(let j=0;j<n;j++)idx.push(j+cnt);cnt+=n;geo.dispose();p.remove(o);o.geometry.dispose()}
      let g=new T.BufferGeometry();for(let key of Object.keys(at))g.setAttribute(key,new T.Float32BufferAttribute(at[key],key==='uv'?2:3));g.setIndex(idx);mesh(g,m,p)}}
  function arrow(p,M,len=1.14){return workshop.arrow(p,M,len)}
  function limb(p,L1,L2,arm,sign,M){let top=node(p),mid=node(top,0,-L1,0),end=node(mid,0,-L2,0);
    if(arm){workshop.sleeve(top,mid,end,M,sign,L1,L2);
    }else{workshop.lowerLimb(top,mid,end,M,sign,L1,L2)}
    for(let n of [top,mid,end])batch(n);return {top,mid,end,L1,L2,sign,plant:null,swing:null,stance:false}
  }
  // Two-bone IK in the shoulder/hip parent's frame. The pole fixes elbow and knee bend direction.
  const down=()=>V(0,-1,0);
  function solve(l,start,goal,pole){let axis=goal.clone().sub(start),d=clamp(axis.length(),Math.abs(l.L1-l.L2)+.001,l.L1+l.L2-.0002);axis.normalize();let bend=pole.clone().addScaledVector(axis,-pole.dot(axis));if(bend.lengthSq()<.000001)bend.set(1,0,0);bend.normalize();let a=(l.L1*l.L1-l.L2*l.L2+d*d)/(2*d),joint=start.clone().addScaledVector(axis,a).addScaledVector(bend,Math.sqrt(Math.max(0,l.L1*l.L1-a*a)));
    l.top.position.copy(start);l.top.quaternion.setFromUnitVectors(down(),joint.clone().sub(start).normalize());let q=new T.Quaternion().setFromUnitVectors(down(),start.clone().addScaledVector(axis,d).sub(joint).normalize());l.mid.quaternion.copy(l.top.quaternion).invert().multiply(q);l.end.quaternion.copy(q).invert()}
  function archeryBow(p,M){let grip=node(p),limbs=[],nocks=[];for(let a of [-1,1]){let root=node(grip,0,a*.078,0);workshop.bowLimb(root,M,a);let tip=node(root,0,a*.90,.11);limbs.push(root);nocks.push(tip);batch(root)}
    workshop.bowHandle(grip,M);let geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(9),3).setUsage(T.DynamicDrawUsage));let string=new T.Line(geom,new T.LineBasicMaterial({color:0xf0e3c8}));string.frustumCulled=false;grip.add(string);return {grip,limbs,nocks,string}}
  function makeReflections(){if(reflections)return;let c=document.createElement('canvas');c.width=256;c.height=128;let g=c.getContext('2d'),sk=g.createLinearGradient(0,0,0,128);sk.addColorStop(0,'#adc0c9');sk.addColorStop(.38,'#d8dcd2');sk.addColorStop(.5,'#dbcaab');sk.addColorStop(.61,'#8d7962');sk.addColorStop(1,'#625746');g.fillStyle=sk;g.fillRect(0,0,256,128);let patch=g.createRadialGradient(76,40,1,76,40,23);patch.addColorStop(0,'#fffadf');patch.addColorStop(1,'#fff1ce00');g.fillStyle=patch;g.fillRect(0,0,256,128);let tex=new T.CanvasTexture(c);tex.mapping=T.EquirectangularReflectionMapping;tex.colorSpace=T.SRGBColorSpace;let pm=new T.PMREMGenerator(R);reflections=pm.fromEquirectangular(tex).texture;tex.dispose();pm.dispose()}
  function heroFigure(){makeReflections();let M=mats(),root=node(),pivot=node(root,0,1.12,0),body=node(pivot,0,-1.12,0),pelvis=node(body,0,1.34,0),chest=node(pelvis),head=node(chest,0,.86,0);
    form(pelvis,M.cloth,[[.22,-.2],[.305,-.1],[.31,.015],[.27,.14]],0,0,0,.71);
    workshop.torso(chest,pelvis,M);workshop.face(head,M);workshop.hair(head,M);let quiv=workshop.quiver(chest,M);
    let panels=[];for(let a of [-1,1]){let tail=node(pelvis,a*.14,.018,.131);workshop.panel(tail,M,a);panels.push(tail)}
    let arms=[-1,1].map(a=>limb(chest,.465,.442,true,a,M)),legs=[-1,1].map(a=>limb(body,.67,.65,false,a,M));let bow=archeryBow(body,M),ready=arrow(body,M);ready.visible=false;
    for(let n of [pelvis,chest,head,quiv])batch(n);
    h={root,pivot,body,pelvis,chest,head,arms,legs,bow,ready,panels,phase:0,weight:0,lift:0,pull:0,injury:0,seq:null,prev:null,side:1,lastOrigin:V(),roll:0};return root
  }
  function resetHero(){if(!h)return;h.prev=null;h.seq=null;h.weight=h.lift=h.pull=h.injury=0;h.roll=0;h.legs.forEach(l=>{l.plant=l.swing=null;l.stance=false});h.ready.visible=false}
  function shot(powered,damage,charged){if(!h)return;let primed=charged&&h.pull>.12;h.seq={t:0,delay:primed?.018:.147,primed,startPull:h.pull,startLift:h.lift,damage,powered,spent:false}}
  function wounded(){if(h)h.injury=.40}
  function direction(){return mouseSight.point.clone()}
  function animateHero(dt,move,speed){
    if(!h)return;let {root,pivot,body,pelvis,chest,head,legs,arms,bow,ready,seq}=h;
    let wp=root.position.clone(),t=gameT,distance=h.prev?Math.hypot(wp.x-h.prev.x,wp.z-h.prev.z):0;
    if(distance>3){legs.forEach(l=>{l.plant=l.swing=null});distance=0}h.prev=wp;
    const roll=dodge>0?clamp(1-dodge/.43):0,impact=clamp(h.injury/.4);h.injury=Math.max(0,h.injury-dt);let flinch=Math.sin((1-impact)*Math.PI*1.7)*impact;
    let g=move.lengthSq()>.0001&&dodge<=0,hz=1-Math.exp(-dt*17);h.weight=lerp(h.weight,+g,hz);
    let run=aim?0:1,cycle=aim?2.16:3.24,contact=aim?.51:.34;h.phase=(h.phase+(g?distance/cycle:dt*h.weight*.75))%1;
    let phase=tau*h.phase,stance=Math.sin(phase),breath=Math.sin(t*2.25);
    let pulling=aim&&hold,draw=pulling?ease(clamp(charge/1.15)):0,raise=(aim||pulling)?1:0,drawLive=false,loose=false,recoil=0,readying=0,follow=0;
    if(aim){h.aimAge=(h.aimAge||0)+dt;if(!seq)readying=1-ease((h.aimAge-.035)/.205)}else h.aimAge=0;
    if(seq){seq.t+=dt;let p=clamp(seq.t/seq.delay);
      if(!seq.spent){raise=lerp(seq.startLift,1,ease(p/.35));draw=seq.primed?seq.startPull:ease((p-.19)/.64)*.86;drawLive=true;readying=seq.primed?0:1-ease(p/.36);if(seq.t>=seq.delay){loose=true;raise=1;draw=seq.primed?seq.startPull:.86}}
      else{let q=clamp((seq.t-seq.delay)/.155);recoil=Math.sin(q*Math.PI)*(.9-q*.45);draw=(seq.primed?seq.startPull:.86)*(1-ease(q/.32));follow=(seq.primed?seq.startPull:.86)*(1-ease((q-.3)/.7));raise=aim?1:1-ease((q-.35)/.65);if(q>=1)h.seq=null}}
    h.lift=lerp(h.lift,raise,drawLive?1:1-Math.exp(-dt*18));h.pull=draw;let lift=h.lift,rollTuck=roll?Math.sin(roll*Math.PI):0;
    // The tumble pivots at the centre of mass, not through the feet.
    let invYaw=new T.Quaternion().setFromAxisAngle(V(0,1,0),-root.rotation.y),local=move.clone().applyQuaternion(invYaw);if(roll){if(!h.roll){h.rollAxis=V(local.z,0,-local.x);if(h.rollAxis.lengthSq()<.1)h.rollAxis.set(0,0,-1);h.rollAxis.normalize()}pivot.quaternion.setFromAxisAngle(h.rollAxis,tau*ease(roll))}else pivot.quaternion.identity();h.roll=roll;
    pivot.position.y=1.12-.25*rollTuck+.06*Math.sin(2*Math.PI*roll)*rollTuck;
    let bob=h.weight*(.035+.049*run)*(-Math.cos(phase*2)),shift=h.weight*.075*stance;
    pelvis.position.set(shift,1.33+bob+breath*.009-.16*rollTuck,0);pelvis.rotation.set(-.08*h.weight-.48*rollTuck,-.15*stance*h.weight,-.07*stance*h.weight);
    chest.rotation.set(-.09*h.weight+.034*breath+.73*flinch-.36*rollTuck,-lift*(.86+.27*draw)+h.weight*.22*stance+.22*flinch,-.06*breath*.24+.075*h.weight*stance-.19*flinch+lift*.055);
    let sight=mouseSight.point,tilt=Math.atan2(sight.y-wp.y-2.2,Math.max(.1,Math.hypot(sight.x-wp.x,sight.z-wp.z)));head.rotation.set(-.06*breath-.17*flinch+.14*rollTuck+clamp(tilt*.49,-.39,.46)*(1-rollTuck),lift*.88-.10*h.weight*stance,-.04*stance*h.weight);
    for(let i=0;i<2;i++){let tail=h.panels[i];tail.rotation.set(-.07-.32*h.weight-.13*Math.sin(phase+i*1.8)*h.weight-.56*rollTuck,.07*Math.sin(t*2.9+i),.06*(i?1:-1)+.06*Math.sin(phase+i))}
    root.updateMatrixWorld(true);
    let footPoses=[],lower=0;for(let l of legs){let a=l.sign,p=(h.phase+(a>0?.5:0))%1,base=V(a*.174,0,0).applyQuaternion(root.quaternion).add(wp),foot;
      let projected=base.clone().addScaledVector(move,g?cycle*contact*.5:0);
      if(!l.plant){l.plant=projected.clone();l.swing=base.clone();l.stance=false}
      let on=p<contact;if(!g){if(l.stance||!l.swing)l.swing=l.plant.clone();foot=(l.current||base).clone().lerp(base,hz);l.plant=foot.clone();l.swing=foot.clone();l.stance=false}
      else if(on){if(!l.stance){l.plant=projected.clone().addScaledVector(move,-p*cycle);l.stance=true}foot=l.plant.clone()}
      else{if(l.stance){l.swing=l.plant.clone();l.stance=false}let u=(p-contact)/(1-contact);let dest=projected.clone().addScaledVector(move,(1-p)*cycle);foot=l.swing.clone().lerp(dest,ease(u))}
      let swing=g&&!on?Math.sin(Math.PI*(p-contact)/(1-contact)):0;foot.y=height(foot.x,foot.z)+.12+swing*(.29+.21*run);l.current=foot.clone();
      let goal=body.worldToLocal(foot),hip=V(pelvis.position.x+a*.168,pelvis.position.y-.006,.008);
      if(rollTuck)goal.lerp(V(a*.21,.70,-.14+(a>0?.1:-.1)),rollTuck);
      if(on&&g){let horiz=(goal.x-hip.x)**2+(goal.z-hip.z)**2;lower=Math.max(lower,hip.y-goal.y-Math.sqrt(Math.max(.01,(l.L1+l.L2-.006)**2-horiz)))}footPoses.push({l,hip,goal,a,swing});
    }
    lower=clamp(lower,0,.24);pelvis.position.y-=lower;for(let {l,hip,goal,a,swing} of footPoses){hip.y-=lower;solve(l,hip,goal,V(a*.12,-.15,-1));l.end.rotateX(swing*(.33+.14*run)-rollTuck*.6)}
    // One bow space drives both hands, bent limbs, moving string centre and the nocked arrow.
    let worldAnchor=head.localToWorld(V(.103,.033,-.112)),shootDir=direction().sub(worldAnchor).normalize().applyQuaternion(body.getWorldQuaternion(new T.Quaternion()).invert());
    let anchor=body.worldToLocal(worldAnchor),extension=Math.max(draw,follow),shoulder=body.worldToLocal(chest.localToWorld(V(-.302,.675,-.005))),offset=anchor.clone().sub(shoulder),proj=offset.dot(shootDir),reach=clamp(-proj+Math.sqrt(Math.max(0,proj*proj+.895**2-offset.lengthSq())),.48,.99),gripAim=anchor.clone().addScaledVector(shootDir,.43+(reach-.43)*extension);
    let carry=V(-.46,1.11+.25*Math.sin(phase)*h.weight,-.08-.35*Math.sin(phase)*h.weight);
    let grip=carry.lerp(gripAim,lift);if(rollTuck)grip.lerp(V(-.25,1.83,-.22),rollTuck*.94);bow.grip.position.copy(grip);
    let pitch=Math.asin(clamp(shootDir.y,-1,1)),az=Math.atan2(-shootDir.x,-shootDir.z);
    bow.grip.rotation.set(0,0,0);bow.grip.rotation.order='YXZ';bow.grip.rotation.set(pitch*lift-.23*(1-lift),az*lift,(1-lift)*-.72-.11*lift);
    for(let i=0;i<2;i++){let a=i?1:-1;bow.limbs[i].rotation.x=a*(.055+.205*draw-.045*recoil)}
    let stringData=bow.string.geometry.attributes.position,center=V(0,0,.171+(reach-.171)*draw);for(let i=0;i<2;i++){let n=bow.nocks[i].position.clone().applyMatrix4((bow.limbs[i].updateMatrix(),bow.limbs[i].matrix));stringData.setXYZ(i*2,n.x,n.y,n.z)}
    stringData.setXYZ(1,center.x,center.y,center.z);stringData.needsUpdate=true;
    const nock=grip.clone().add(center.clone().applyQuaternion(bow.grip.quaternion));
    let trail=V(.45,1.14-.18*Math.sin(phase)*h.weight,.01+.44*Math.sin(phase)*h.weight);
    let drawing=nock.clone();if(follow>draw)drawing.addScaledVector(shootDir,-(follow-draw)*(reach-.171));drawing.x+=.016;drawing.z+=recoil*.19;drawing.y+=recoil*.04;
    if(readying) drawing.lerp(body.worldToLocal(head.localToWorld(V(.28,.015,.23))),readying);
    for(let l of arms){let a=l.sign,w=a<0?grip:trail.clone().lerp(drawing,lift);
      if(rollTuck&&a>0)w.lerp(V(a*.25,1.89,-.23),rollTuck*.94);
      let q=chest.worldToLocal(body.localToWorld(w.clone()));
      let pole=V(a*.87,-.52,.41);if(a>0&&lift>.05){let aimPole=V(.91,.22,1.18).applyQuaternion(body.getWorldQuaternion(new T.Quaternion())).applyQuaternion(chest.getWorldQuaternion(new T.Quaternion()).invert());pole.lerp(aimPole,lift)}solve(l,V(a*.302,.675,-.005),q,pole);l.end.rotation.z+=a*.13;if(a<0&&lift>.1){let gripQ=bow.grip.getWorldQuaternion(new T.Quaternion()),parentQ=l.mid.getWorldQuaternion(new T.Quaternion());l.end.quaternion.slerp(parentQ.invert().multiply(gripQ),lift)}else if(a>0)l.end.rotateX(-.86*lift)}
    ready.visible=(drawLive||pulling||aim&&(!seq||!seq.spent))&&lift>.18;
    ready.position.copy(readying?body.worldToLocal(arms[1].end.getWorldPosition(V())):nock);ready.quaternion.copy(bow.grip.quaternion);if(readying)ready.rotateX(-1.05*readying);
    if(loose){let origin=body.localToWorld(nock.clone());h.lastOrigin.copy(origin);seq.spent=true;ready.visible=false;launchBolt(origin,seq.powered,seq.damage,false)}
  }
  // Curved feather blades with coloured rachis and alternating barbs, drawn as a single surface.
  function feather(p,x,y,z,tip,width,shade,seedNo){let along=tip.clone(),w=V(-along.z,0,along.x).normalize(),pts=[],col=[],ix=[],uv=[],c=new T.Color(shade);
    for(let i=0;i<=12;i++){let t=i/12,span=Math.pow(Math.sin(Math.PI*t),.72)*width*(1-.29*t)+.003;for(let j=0;j<5;j++){let s=[-1,-.045,0,.045,1][j],v=along.clone().multiplyScalar(t).addScaledVector(w,s*span*(s<0?.78:1));v.z+=.17*Math.sin(t*Math.PI);v.y+=Math.sin(t*Math.PI)*.10-Math.abs(s)*span*.16;pts.push(v.x,v.y,v.z);uv.push(j/4,t);let glow=j===2?1.44:lerp(1.12,.71,t)*(1+.14*Math.sin(i*2.2+seedNo));let cc=c.clone().multiplyScalar(glow);col.push(cc.r,cc.g,cc.b);if(i&&j){let n=i*5+j;ix.push(n-6,n-1,n,n-6,n,n-5)}}}
    let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(g,b.featherMat,p,x,y,z)}
  function beak(p,m,upper){let points=upper?[[0,.22,.33],[-.4,.19,.26],[-.79,.085,.10],[-.91,-.10,.015]]:[[0,-.11,.27],[-.42,-.105,.18],[-.70,-.036,.014]],verts=[],ids=[];points.forEach(([z,y,w],i)=>{for(let j=0;j<8;j++){let a=j*tau/8;verts.push(Math.cos(a)*w,y+Math.sin(a)*w*.57,z);if(i){let n=i*8+j,l=i*8+(j+1)%8;ids.push(n-8,l,n,l-8,l,n-8)}}});let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(ids);g.computeVertexNormals();let o=mesh(g,m,p);o.material.side=T.DoubleSide;return o}
  function birdFigure(){let root=node(),body=node(root),neck=node(body,0,.37,-1.16),head=node(neck,0,.48,-.53),jaw=node(head,0,-.05,-.4),tail=node(body,0,.08,1.32);
    b={root,body,neck,head,jaw,tail,spars:[],fans:[],streamers:[],feet:[],phase:0,diveStart:null,lastTele:0,lastYaw:0};
    let fmat=b.featherMat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.45,metalness:.42,envMap:reflections,envMapIntensity:.92});
    let mantle=surface(0x73512d,.33,.53,swatch(1)),dark=surface(0x494033,.38,.55),gold=surface(0xc6964a,.59,.37),horn=surface(0xe4b868,.46,.37),eye=new T.MeshStandardMaterial({color:0xffb62b,emissive:0xff8700,emissiveIntensity:1.5}),pupil=surface(0x211e18,.06,.36);
    oval(body,mantle,0,.04,.13,.94,.79,2.09);oval(neck,mantle,0,.11,-.13,.58,.75,.74);oval(head,mantle,0,.02,-.06,.49,.55,.63);beak(head,horn,true).position.z=-.37;beak(jaw,dark,false);
    for(let a of [-1,1]){oval(head,eye,a*.418,.137,-.31,.09,.088,.105);oval(head,pupil,a*.482,.137,-.324,.045,.068,.042);stick(head,gold,V(a*.31,.29,-.49),V(a*.49,.25,-.15),.067,.096);
      for(let j=0;j<5;j++)feather(head,a*.055*j,.28+j*.006,.06,V(a*(.18+j*.10),.58+j*.10,.51+j*.14),.105,0xb58a4d,3*j);
      let shoulder=node(body,a*.64,.16,-.41),wrist=node(shoulder,a*2.18,.09,-.29);b.spars.push({a,shoulder,wrist});
      let arm=oval(shoulder,mantle,a*1.03,.055,.10,1.47,.25,.69);arm.rotation.y=a*.12;
      for(let row=0;row<2;row++)for(let j=0;j<8;j++){let u=j/7;feather(shoulder,a*(.12+1.83*u),.105+row*.08,-.39*u-row*.19,V(a*(.49+.28*u),-.20+u*.19,2.53-u*.24-row*.65),.28-row*.04,[0x7e5831,0x976b38,0xae8045][(j+row)%3],j)}
      for(let j=0;j<11;j++){let u=j/10,fan=node(wrist,a*(.08+1.15*u),.07+u*.12,-.08-.36*u);b.fans.push({fan,u,a});feather(fan,0,0,0,V(a*(1.02+3.5*u),.28+u*.34,2.61-1.74*u),.36-.105*u,[0x695438,0xa27c43,0x856439][j%3],j);feather(fan,0,.063,-.075,V(a*(.76+1.44*u),.16+u*.25,1.5-.84*u),.23,[0xc1944f,0xa77c41][j%2],j+3)}
    }
    for(let row=0;row<4;row++)for(let j=-4;j<=4;j++){let a=j*.35+(row%2)*.07,r=.72+.13*Math.sin(row*.95),sx=Math.sin(a)*r,sy=.49-row*.20,sz=-1.29*Math.cos(a)-.16;feather(body,sx,sy,sz,V(Math.sin(a)*.23,-.56+Math.abs(j)*.012,.17+.18*Math.cos(a)),.176,[0xae8044,0x946633,0xb28d53,0x795830][(row+Math.abs(j))%4],j+row)}
    for(let a of [-1,1])for(let j=0;j<5;j++){let v=j/4;feather(neck,a*(.13+.31*v),.4-v*.19,-.44+v*.18,V(a*(.07+.25*v),-.44,.29+v*.14),.127,j%2?0xb78b4e:0x936c3e,j)}
    for(let j=-5;j<=5;j++){let stem=node(tail,j*.09,0,0);b.streamers.push({stem,j});feather(stem,0,0,0,V(j*.45,-.46+Math.abs(j)*.038,4.13-Math.abs(j)*.30),.34,Math.abs(j)%2?0x98703d:0xb48c4f,j)}
    for(let j=-1;j<=1;j++){let leg=node(body,j*.49,-.45,j===0?.74:-.11),ankle=node(leg,0,-.69,.28);stick(leg,gold,V(),ankle.position,.105,.078);stick(ankle,gold,V(),V(0,-.41,-.1),.084,.058);for(let d=-1;d<=1;d++){let p=V(d*.18,-.45,-.40);stick(ankle,horn,V(0,-.4,-.09),p,.056,.026);stick(ankle,dark,p,V(d*.21,-.56,-.44),.031,.002)}b.feet.push({leg,ankle,j});batch(ankle)}
    for(let n of [body,neck,head,jaw,...b.spars.map(s=>s.shoulder),...b.fans.map(s=>s.fan)])batch(n);
    return root}
  function flight(dt){if(!b||!enemy.visible||freeze>0)return;
    let {body,neck,head,jaw,tail}=b,rage=bhp<bmax*.5,warning=tele>0,progress=warning?clamp(1-tele/(rage?.88:1.46)):0;
    let dive=attackType===0&&warning?ease(progress/.74):0,tucked=stagger>0?1:dive;
    b.phase+=dt*(stagger>0?1.1:attackType===3&&warning?10.8:rage?7.5:5.8);let p=b.phase,downbeat=Math.sin(p);
    let yawNow=enemy.rotation.y,bank=clamp(Math.atan2(Math.sin(yawNow-b.lastYaw),Math.cos(yawNow-b.lastYaw)),-.14,.14);b.lastYaw=yawNow;
    const blend=1-Math.exp(-dt*10);body.rotation.x=lerp(body.rotation.x,-.89*dive+.084*Math.cos(p)+.17*(stagger>0),blend);
    body.rotation.z=lerp(body.rotation.z,clamp(-bank*2.4,-.34,.34)+Math.sin(p*.51)*.055,blend);body.position.y=.18*Math.sin(p-.52)*(1-tucked);
    neck.rotation.x=.11*Math.sin(p-.72)-.19*dive;head.rotation.x=-body.rotation.x*.35+.07*Math.sin(p-.97);head.rotation.y=.13*Math.sin(p*.28);
    jaw.rotation.x=lerp(jaw.rotation.x,-(.055+.09*Math.max(0,downbeat)+(warning?.58*Math.sin(Math.PI*progress):0)),blend);
    tail.rotation.x=-.13*Math.cos(p-.84)-.29*dive;tail.rotation.z=-body.rotation.z*.8;
    for(let {a,shoulder,wrist} of b.spars){shoulder.rotation.z=a*lerp(.09+.63*downbeat,-.12,tucked);shoulder.rotation.y=a*(tucked*.65+.13*Math.cos(p));wrist.rotation.z=a*lerp(.49*Math.sin(p-.8),-.25,tucked);wrist.rotation.y=a*(-.23+.19*Math.cos(p-.65)-.59*tucked)}
    for(let {fan,u,a} of b.fans){fan.rotation.z=a*(.09+.14*u)*Math.sin(p-.95-u*.7)*(1-.7*tucked);fan.rotation.y=a*(.035*Math.cos(p-u)-tucked*.11)*u}
    for(let {stem,j} of b.streamers){stem.rotation.x=.13*Math.sin(p-.8-Math.abs(j)*.14);stem.rotation.y=j*.017*(downbeat+.55*dive)}
    for(let {leg,ankle,j} of b.feet){leg.rotation.x=-.48+.1*Math.sin(p+j)+dive*.93;ankle.rotation.x=.51-.06*Math.sin(p-.64+j)-dive*.75}}
  function divePoint(pos,mark,remain,rage){let t=clamp(1-remain/(rage?.88:1.46));if(!b.diveStart||remain>b.lastTele+.07)b.diveStart=pos.clone();b.lastTele=remain;let v=b.diveStart.clone().lerp(mark.clone().add(V(0,2,0)),ease((t-.13)/.87));v.y+=Math.sin(Math.PI*t)*2.65;return v}
  function rimLight(){let key=new T.DirectionalLight(0xdce4e1,1.30);key.position.set(30,42,34);S.add(key);let sun=S.userData.sun;sun.shadow.normalBias=.022;sun.shadow.radius=2.5}
  return {heroFigure,birdFigure,animateHero,flight,shot,wounded,resetHero,divePoint,rimLight,arrowModel:()=>arrow(null,mats()),get hero(){return h},get bird(){return b}};
})();
