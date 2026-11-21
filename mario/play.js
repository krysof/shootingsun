'use strict';
const $=s=>document.querySelector(s),T=window.THREE;
function boot(){
const R=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});R.setPixelRatio(Math.min(devicePixelRatio,1.6));R.setClearColor(0,0);R.outputColorSpace=T.SRGBColorSpace;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.18;$('#world').appendChild(R.domElement);
const scene=new T.Scene(),cam=new T.OrthographicCamera(),sun=new T.DirectionalLight(0xffdfae,3.3);sun.position.set(-7,13,6);scene.add(sun,new T.HemisphereLight(0xffe4cf,0x735853,2.0));
const rand=s=>()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296),rng=rand(82),group=(p=scene)=>{let o=new T.Group();p.add(o);return o};
const mats=new Map();function mat(c,metal=false){let k=c+':'+metal;if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({color:c,roughness:metal?.44:.84,metalness:metal?.42:.02}));return mats.get(k)}
const B=new T.BoxGeometry(),E=new T.SphereGeometry(1,16,12),geos=new Map();function mesh(p,g,m,x,y,z){let o=new T.Mesh(g,m);p.add(o);o.position.set(x,y,z);return o}
function box(p,c,x,y,z,a,b,d){let o=mesh(p,B,mat(c),x,y,z);o.scale.set(a,b,d);return o}
function egg(p,c,x,y,z,a,b,d){let o=mesh(p,E,mat(c),x,y,z);o.scale.set(a,b,d);return o}
function cyl(p,c,x,y,z,a,b,h,n=16,metal=false){let k=[a,b,h,n].join();if(!geos.has(k))geos.set(k,new T.CylinderGeometry(a,b,h,n));return mesh(p,geos.get(k),mat(c,metal),x,y,z)}
const red=0xa72f29,denim=0x304c63,skin=0xf4ad80,bootC=0x51332d,bronze=0xad7446,jade=0x427269,gold=0xf6b65c;
function label(str,bg,fg){let c=document.createElement('canvas');c.width=c.height=128;let g=c.getContext('2d');if(bg){g.fillStyle=bg;g.fillRect(0,0,128,128)}g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.font='bold 96px Georgia';g.fillText(str,64,68);
 let tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false})}
const em=label('M',null,'#ab302d'),qm=label('?',null,'#fff0c2');
function mario(){let root=group(),model=group(root),head=group(model);head.position.y=1.06;
 egg(model,red,0,.78,0,.32,.35,.24);egg(model,denim,0,.59,.025,.32,.24,.25);box(model,denim,0,.79,.211,.36,.26,.05);
 for(let s of [-1,1]){box(model,denim,s*.15,.91,.193,.078,.27,.061);egg(model,gold,s*.14,.84,.25,.036,.037,.016)}
 egg(head,skin,0,.19,.01,.32,.32,.265);egg(head,0x56372e,0,.22,-.13,.32,.29,.21);
 for(let s of [-1,1]){egg(head,skin,s*.297,.18,0,.08,.105,.075);egg(head,0xfff4de,s*.115,.239,.241,.061,.079,.032);egg(head,0x304950,s*.115,.237,.274,.028,.048,.011);egg(head,0x4b3028,s*.112,.32,.219,.077,.023,.033);let st=egg(head,0x48302a,s*.105,.105,.256,.126,.059,.063);st.rotation.z=s*.17}
 egg(head,skin,0,.175,.299,.118,.097,.104);egg(head,red,0,.405,-.015,.366,.211,.302);egg(head,0xb6382b,0,.361,.191,.349,.066,.206);egg(head,0xf8ead1,0,.47,.253,.097,.084,.018);mesh(head,new T.PlaneGeometry(.145,.145),em,0,.465,.276);
 const legs=[],arms=[];for(let s of [-1,1]){let l=group(model);l.position.set(s*.154,.55,0);egg(l,denim,0,-.15,0,.141,.203,.15);egg(l,bootC,0,-.39,.064,.152,.119,.193);legs.push(l);let a=group(model);a.position.set(s*.302,.90,0);egg(a,red,s*.025,-.10,0,.115,.157,.119);egg(a,0xf3dcc2,s*.04,-.285,.03,.122,.116,.115);arms.push(a)}
 return {root,model,legs,arms}}
const hero=mario(),solids=[],coins=[],foes=[],blocks=[],drops=[],sparks=[];
function solid(a,b,bottom,top,kind='rock',extra={}){let o={a,b,bottom,top,kind,...extra};solids.push(o);return o}
const slate=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.98});
slate.onBeforeCompile=s=>{
 s.vertexShader='varying vec3 cliffP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncliffP=position;');
 s.fragmentShader='varying vec3 cliffP;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  float seam=cliffP.y*3.9+cliffP.x*.35+.17*sin(cliffP.x*2.);
  float band=abs(fract(seam)-.5);float vein=1.-smoothstep(.025,.07+fwidth(seam),band);
  float grain=fract(sin(dot(floor(cliffP*56.),vec3(12.99,7.31,3.68)))*43758.545);
  diffuseColor.rgb*=.93+.1*grain+.09*sin(seam*6.283);diffuseColor.rgb+=vec3(.025,.021,.018)*vein;`);};
function cliff(a,b,top){solid(a,b,-12,top);let n=Math.ceil((b-a)/1.05),verts=[],colors=[],palette=['#675854','#897463','#595159','#746464','#554e53','#9a826b'];function tri(A,B,C,col){let c=new T.Color(col);verts.push(...A,...B,...C);for(let i=0;i<3;i++)colors.push(c.r,c.g,c.b)}
 let last;for(let i=0;i<=n;i++){let x=a+(b-a)*i/n,j=i===0||i===n?0:(rng()-.5)*.48;let col=[[x,top,1.05],[x+j,top-.37-rng()*.35,1.22+rng()*.22],[x+j*.6,top-1.52-rng()*.53,.99+rng()*.27],[x+j,top-5.8,.67+rng()*.35],[x,top,-1.4]];if(last){for(let k=0;k<3;k++){tri(last[k],last[k+1],col[k],palette[(rng()*6)|0]);tri(col[k],last[k+1],col[k+1],palette[(rng()*6)|0])}tri(last[4],last[0],col[0],'#b7a083');tri(last[4],col[0],col[4],'#c2ab89')}last=col}
 let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();mesh(scene,g,slate,0,0,0);
 for(let i=0;i<Math.floor((b-a)*1.6);i++){let x=a+rng()*(b-a),y=top-.24-rng()*1.65;let l=box(scene,i%4?0x766761:0xaf9680,x,y,1.36,.19+rng()*.62,.018+rng()*.025,.03);l.rotation.z=(rng()-.5)*.33}
 for(let x=a+.4;x<b-.25;x+=.6+rng()*1.6){for(let j=0;j<3;j++){let blade=box(scene,j%2?0x8a7653:0xa89a62,x+j*.05,top+.11,-.67,.027,.19+rng()*.23,.034);blade.rotation.z=(rng()-.5)*1.2}}
}
for(let [a,b,y] of [[-12,18,0],[20.5,34.8,0],[37.3,49,.48],[51.5,67.7,0],[74,80.4,.38],[83.1,98,0],[100.7,117,0]])cliff(a,b,y);
// A moving ferry bridges the wider cut after the shrine; riders inherit its movement.
const ferry=group();box(ferry,0x59463a,0,-.24,0,2.35,.25,1.18);
for(let i=-3;i<=3;i++)box(ferry,i%2?0x9e7351:0xad835e,i*.34,-.075,0,.32,.15,1.39);
for(let side of [-1,1]){box(ferry,0x544940,side*.83,-.19,0,.085,.34,1.45);cyl(ferry,bronze,side*.96,.14,-.50,.06,.07,.4,8)}
let ferryX=70.8;const deck=solid(ferryX-1.18,ferryX+1.18,.23,.6,'ferry');
function ferryAt(t,carry){let x=70.85+2.48*Math.sin(t*1.32);if(carry&&P.on&&Math.abs(P.y-deck.top)<.03&&P.x>deck.a-.2&&P.x<deck.b+.2)P.x+=x-ferryX;ferryX=x;deck.a=x-1.18;deck.b=x+1.18;ferry.position.set(x,deck.top,0)}
ferryAt(0,false);
function pipe(x,y,h){let p=group();p.position.set(x,y,0);cyl(p,0x34665c,0,h/2,0,.68,.7,h,16,true);cyl(p,jade,0,h-.13,0,.84,.84,.26,16,true);cyl(p,0x243f3d,0,h+.004,0,.66,.66,.014);for(let k of [.11,h-.25])cyl(p,bronze,0,k,0,.72,.72,.055,16,true);solid(x-.76,x+.76,y,y+h,'pipe')}
pipe(12,0,1.33);pipe(30,.0,1.65);pipe(61,0,1.28);pipe(94,0,1.48);
function block(x,y,type){let g=group();g.position.set(x,y,0);box(g,type==='brick'?0x885341:0xb97b36,0,0,0,.93,.91,.83);
 if(type==='brick'){for(let [xx,yy,a] of [[0,0,.92],[-.2,.22,.025],[.22,-.22,.025]])box(g,0x5f4037,xx,yy,.42,a,a>.5?.035:.41,.026)}
 else{box(g,0x86582e,0,0,.42,.8,.77,.024);mesh(g,new T.PlaneGeometry(.77,.77),qm,0,0,.448);for(let s of [-1,1])for(let t of [-1,1])egg(g,gold,.37*s,.35*t,.43,.035,.035,.018)}
 let z=solid(x-.475,x+.475,y-.465,y+.465,'block',{g,used:false,type,y,anim:0});blocks.push(z)}
for(let [x,y,types] of [[5.5,2.85,['brick','coin','brick','power']],[23,3,['coin','brick']],[42,3.35,['power','brick','coin']],[56,2.9,['brick','coin','brick']],[73,3.25,['coin','power']],[87,3.05,['brick','coin','brick']]])types.forEach((s,i)=>block(x+i*.96,y,s));
function coin(x,y){let g=group();g.position.set(x,y,.1);let c=cyl(g,0xe8a448,0,0,0,.19,.19,.075,16,true);c.rotation.x=Math.PI/2;box(g,0xffda83,0,0,.046,.049,.236,.02);coins.push({g,x,y,used:false})}
for(let [a,y,n] of [[2.7,1.45,3],[12,2.7,1],[17,1.65,5],[26,1.35,3],[34.5,1.9,5],[44,1.9,3],[48,2.05,5],[57,1.48,3],[67.1,1.75,5],[78.8,1.95,5],[90,1.32,3],[97.3,1.75,5],[105,1.35,4]])for(let j=0;j<n;j++)coin(a+j*.94,y+(n===5?Math.sin(j*Math.PI/4)*1.12:0));
function goomba(x,y,a,b){let g=group();egg(g,0xc28d62,0,.38,0,.32,.25,.24);egg(g,0x864932,0,.65,0,.46,.32,.30);for(let s of [-1,1]){egg(g,bootC,s*.23,.13,.04,.23,.13,.21);egg(g,0xffe7c5,s*.14,.67,.266,.091,.101,.036);egg(g,0x362b2b,s*.129,.67,.302,.033,.057,.017);let brow=box(g,0x463029,s*.145,.757,.286,.202,.049,.037);brow.rotation.z=s*.31}foes.push({g,x,y,a,b,v:-1.18,start:x,dead:0});g.position.set(x,y,0)}
for(let args of [[15,0,13.4,17.6],[25,0,21.3,28.8],[39,.48,37.9,43],[55,0,52,59],[65,0,62.3,67],[76,.38,74.5,79.6],[90,0,84.1,92.5],[104,0,101.4,106.3]])goomba(...args);
function gate(x,base){const g=group();g.position.set(x,base,-1.24);for(let s of [-1,1]){box(g,0x674537,s*1.32,1.45,0,.19,2.9,.22);box(g,0x9a826b,s*1.32,.21,0,.46,.42,.48)}box(g,0x924930,0,2.79,0,3.38,.24,.32);for(let i=-2;i<=2;i++)box(g,0x45494c,i*.65,3.02+.065*i*i,0,.78,.15,.57).rotation.z=i*.10}
gate(52.9,0);gate(112.6,0);function pennant(x,y,color){let g=group();g.position.set(x,y,-.31);cyl(g,bronze,0,2.03,0,.045,.065,4.06);egg(g,gold,0,4.13,0,.114,.114,.114);let v=new T.BufferGeometry();v.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-1.08,-.26,0,-.79,-.55,0,0,0,0,-.79,-.55,0,0,-.69,0],3));v.computeVertexNormals();let m=mat(color).clone();m.side=T.DoubleSide;return mesh(g,v,m,0,1.35,0)}
const checkpoint=pennant(53.5,0,0xce7045),flag=pennant(110,0,0xa82e24);
const keys=new Set(),touchMap=new Map(),P={x:1,y:0,vx:0,vy:0,facing:1,on:true},shadow=egg(scene,0x6c5d56,0,.012,0,.37,.015,.20);
let state='menu',camX=-1,clock=0,age=0,stock=3,points=0,big=false,saved=false,grace=0,buf=0,inv=0,hurtT=0,messageT=0,winT=0,stepNo=0,beat=0,ac=null,audio=true;
function beep(f,d,type='sine',volume=.06,end=f,delay=0){if(!ac||!audio||ac.state!=='running')return;let o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+delay;o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(end,t+d);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(volume,t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d+.02);o.onended=()=>{o.disconnect();g.disconnect()}}
function soundOn(){try{ac??=new(window.AudioContext||window.webkitAudioContext)();ac.resume().catch(()=>{})}catch{}}
function melody(dt){beat-=dt;if(beat>0)return;beat=.32;let n=stepNo++%32,p=[0,7,12,14,7,4,9,7,2,9,14,16,14,9,7,2,0,4,7,12,16,14,9,7,4,2,7,9,4,2,0,7];if(n%5!==4)beep(196*2**(p[n]/12),.34,'triangle',.031);if(n%4===0)beep(n<16?98:82.4,.52,'sine',.055);if(n%2===0)beep(n%4?105:72,.10,'sine',.055,38)}
function hud(){$('#score').textContent='◎ '+String(points).padStart(2,'0');$('#lives').textContent='马里奥 × '+stock;$('#area').textContent=saved?'山门古道':'赤霞山道'}
function msg(t,life=1.7){$('#toast').textContent=t;messageT=life}
function mode(s){state=s;const playing=s==='play'||s==='dying'||s==='win';document.body.classList.toggle('playing',playing);$('#panel').hidden=playing;$('#hud').hidden=s==='menu';$('#pause').hidden=!['play','pause'].includes(s);$('#pause').textContent=s==='pause'?'继续 ▷':'暂停 Ⅱ';if(!playing)keys.clear();
 const copy={pause:['旅途小憩','山道暂停','跳跃位置已保留。','继续冒险'],over:['卷末 · 再起','再闯山道','这一程暂告一段落。准备好就再出发。','从头再来'],end:['第一卷 · 通关','山门旗扬','你收集了 '+points+' 枚金币，穿过了赤霞山道。','再玩一次']};
 if(copy[s]){let [k,t,m,b]=copy[s];$('#kicker').textContent=k;$('#title').textContent=t;$('#summary').textContent=m;$('#action').innerHTML=b+' <strong>→</strong>'}}
function resetPlayer(){Object.assign(P,{x:saved?54.5:1,y:.02,vx:0,vy:0,facing:1,on:true});big=false;inv=.8;grace=.1;buf=0;camX=P.x+2.1;hero.root.visible=true}
function start(){points=0;stock=3;saved=false;age=stepNo=beat=0;ferryAt(0,false);checkpoint.position.y=flag.position.y=1.35;
 for(let c of coins){c.used=false;c.g.visible=true}for(let b of blocks){b.used=b.broken=false;b.g.visible=true;b.anim=0;b.g.position.y=b.y;b.g.children.forEach(c=>c.visible=true);if(b.type!=='brick')b.g.children[0].material=mat(0xb97b36)}
 for(let f of foes){f.x=f.start;f.dead=0;f.v=-1.18;f.g.visible=true;f.g.scale.set(1,1,1)}
 for(let d of drops)scene.remove(d.g);drops.length=0;for(let s of sparks)scene.remove(s.g);sparks.length=0;resetPlayer();hud();mode('play');msg('第一卷　·　赤霞山道')}
function pause(){if(state==='play'){mode('pause');buf=0}else if(state==='pause')mode('play')}
$('#action').onclick=()=>{soundOn();if(state==='pause')pause();else start()};$('#pause').onclick=pause;$('#music').onclick=()=>{audio=!audio;if(audio)soundOn();$('#music').textContent='声音 · '+(audio?'开':'关')};
function press(k){if(state==='play'&&!keys.has(k)&&['Space','ArrowUp','KeyW'].includes(k))buf=.14;keys.add(k)}
function release(k){keys.delete(k);if(['Space','ArrowUp','KeyW'].includes(k)&&P.vy>4.8)P.vy=4.8}
window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)&&state==='play')e.preventDefault();if(!e.repeat&&['Escape','KeyP'].includes(e.code)){pause();return}if(state==='play')press(e.code)});window.addEventListener('keyup',e=>release(e.code));
for(let b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);touchMap.set(e.pointerId,b.dataset.key);press(b.dataset.key)};b.onpointerup=b.onpointercancel=e=>{let k=touchMap.get(e.pointerId);touchMap.delete(e.pointerId);if(k&&![...touchMap.values()].includes(k))release(k)}}
window.addEventListener('blur',()=>{if(state==='play')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')pause()});
const rad=.27,bodyH=()=>big?1.92:1.52;function active(s){return !s.broken}
function topAt(x,y){let h=-20;for(let s of solids)if(active(s)&&x>=s.a&&x<=s.b&&s.top<=y+.035)h=Math.max(h,s.top);return h}
function burst(x,y,c,n=8){for(let i=0;i<n;i++){let g=box(scene,c,x,y,.31,.064,.10,.06);sparks.push({g,xv:(rng()-.5)*4,yv:1+rng()*3,t:.36+rng()*.22})}}
function earn(x,y){points++;beep(850,.11,'sine',.058,1080);beep(1430,.17,'sine',.04,1360,.075);burst(x,y,gold,6);hud()}
function mushroom(x,y){let g=group();g.position.set(x,y,0);egg(g,0xf7d1a3,0,.17,0,.16,.18,.15);egg(g,red,0,.34,0,.29,.18,.23);for(let s of [-1,1])egg(g,0xffe9c3,.13*s,.39,.16,.062,.046,.03);drops.push({g,x,y,v:1.65,vy:0})}
function bonk(s){if(s.kind!=='block'||s.used||s.broken)return;s.anim=.18;
 if(s.type==='brick'){beep(150,.09,'triangle',.055,70);if(big){s.broken=true;s.g.visible=false;burst((s.a+s.b)/2,s.y,0xbb7553,13)}return}
 s.used=true;s.g.children.forEach((c,i)=>c.visible=!i);s.g.children[0].material=mat(0x796653);let x=(s.a+s.b)/2;if(s.type==='power'){mushroom(x,s.top+.02);beep(340,.34,'triangle',.09,790)}else earn(x,s.top+.32)}
function die(){if(state!=='play')return;stock--;hud();hurtT=.86;P.vy=6;mode('dying');beep(290,.42,'triangle',.08,65)}
function damage(){if(inv>0||state!=='play')return;if(big){big=false;inv=1.65;beep(210,.28,'sawtooth',.04,80);msg('变小了！',.9)}else die()}
function step(dt){clock+=dt;if(['pause','menu','end','over'].includes(state))return;
 if(messageT>0&&(messageT-=dt)<=0)$('#toast').textContent='';
 if(state==='win'){flag.position.y=Math.min(3.99,flag.position.y+dt*2.7);if((winT-=dt)<=0)mode('end');return}
 if(state==='dying'){hurtT-=dt;P.y+=P.vy*dt;P.vy-=24*dt;if(hurtT<=0){if(stock<=0){hero.root.visible=false;mode('over')}else{resetPlayer();mode('play');msg(saved?'从山门驿旗再出发':'再试一次')}}return}
 age+=dt;ferryAt(age,true);melody(dt);inv=Math.max(0,inv-dt);grace=P.on?.105:Math.max(0,grace-dt);buf=Math.max(0,buf-dt);
 let dir=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA')),max=keys.has('ShiftLeft')||keys.has('ShiftRight')?8.6:6;
 let target=dir*max;P.vx+=Math.sign(target-P.vx)*Math.min(Math.abs(target-P.vx),(P.on?47:29)*dt);if(dir)P.facing=dir;
 if(buf>0&&grace>0){P.vy=11.15;P.on=false;grace=buf=0;beep(280,.17,'triangle',.065,620)}
 let oldX=P.x,nx=Math.max(-5,P.x+P.vx*dt),H=bodyH();for(let s of solids){if(!active(s)||P.y>=s.top-.012||P.y+H<=s.bottom+.012)continue;
 if(nx>oldX&&oldX+rad<=s.a+.008&&nx+rad>s.a){nx=s.a-rad;P.vx=0}if(nx<oldX&&oldX-rad>=s.b-.008&&nx-rad<s.b){nx=s.b+rad;P.vx=0}}
 P.x=nx;let oldY=P.y;P.vy-=27*dt;let ny=P.y+P.vy*dt;P.on=false;
 for(let s of solids){if(!active(s)||P.x+rad<=s.a+.001||P.x-rad>=s.b-.001)continue;
 if(P.vy<=0&&oldY>=s.top-.025&&ny<=s.top){ny=s.top;P.vy=0;P.on=true}
 else if(P.vy>0&&oldY+H<=s.bottom+.02&&ny+H>=s.bottom){ny=s.bottom-H;P.vy=0;bonk(s)}}
 P.y=ny;if(P.y< -4.2){die();return}
 for(let c of coins){if(c.used)continue;if(Math.abs(c.x-P.x)<rad+.22&&c.y>P.y-.16&&c.y<P.y+H+.13){c.used=true;c.g.visible=false;earn(c.x,c.y)}}
 for(let b of blocks){if(b.anim>0){b.anim=Math.max(0,b.anim-dt);b.g.position.y=b.y+Math.sin(b.anim/.18*Math.PI)*.22}}
 for(let f of foes){if(f.dead>0){f.dead+=dt;f.g.scale.y=Math.max(.08,1-(f.dead-.001)*7);if(f.dead>.34)f.g.visible=false;continue}
 f.x+=f.v*dt;if(f.x<f.a||f.x>f.b){f.x=T.MathUtils.clamp(f.x,f.a,f.b);f.v*=-1}
 if(Math.abs(f.x-P.x)<rad+.34&&P.y<f.y+.91&&P.y+H>f.y+.1){if(P.vy<0&&oldY>=f.y+.75){f.dead=.001;P.y=f.y+.87;P.vy=keys.has('Space')||keys.has('ArrowUp')?8.4:6.7;beep(110,.11,'triangle',.10,55);burst(f.x,f.y+.68,0xbd8a62,5)}else damage()}}
 for(let i=drops.length-1;i>=0;i--){let d=drops[i],h=d.y;d.x+=d.v*dt;d.vy-=22*dt;d.y+=d.vy*dt;let floor=topAt(d.x,h);if(d.y<floor){d.y=floor;d.vy=0}d.g.position.set(d.x,d.y,0);
 if(Math.abs(d.x-P.x)<.58&&d.y+.4>P.y&&d.y<P.y+H){big=true;inv=.8;beep(320,.38,'triangle',.09,890);msg('获得超级蘑菇');scene.remove(d.g);drops.splice(i,1)}else if(d.y< -6){scene.remove(d.g);drops.splice(i,1)}}
 if(P.x>=53.5&&!saved){saved=true;checkpoint.position.y=3.95;beep(540,.25,'triangle',.07,810);hud();msg('驿旗已升起　·　此处复活')}
 if(P.x>=109.65&&state==='play'){winT=1.65;mode('win');msg('山门旗扬',1.4);[392,494,587,784].forEach((f,i)=>beep(f,.32,'triangle',.08,f,i*.13))}
}
let width=0,height=0;function resize(){width=innerWidth;height=innerHeight;R.setSize(width,height);let span=Math.max(10.5,11.6*height/width);cam.top=span/2;cam.bottom=-span/2;cam.right=span*width/height/2;cam.left=-cam.right;cam.near=.1;cam.far=90;cam.updateProjectionMatrix()}
function render(dt){if(width!==innerWidth||height!==innerHeight)resize();let t=clock;
 if(state==='play'||state==='win'){let aimX=P.x+Math.min(3.15,cam.right*.24);camX+= (aimX-camX)*(1-Math.exp(-6*dt))}
 let cy=2.45;cam.position.set(camX,cy+3.5,20);cam.lookAt(camX,cy,0);vista(camX,t);
 hero.root.position.set(P.x,P.y,0);hero.root.visible=state!=='over'&&(inv<=0||state!=='play'||Math.floor(inv*12)%2===0);
 let k=state==='menu'?.98:big?1.25:1;hero.model.scale.setScalar(k);hero.model.rotation.y=T.MathUtils.lerp(hero.model.rotation.y,P.facing*1.05,1-Math.exp(-18*dt));let s=P.on?Math.sin(age*13)*(Math.abs(P.vx)/8.6):.72;
 hero.legs.forEach((o,i)=>o.rotation.x=(i?1:-1)*s*.86);hero.arms.forEach((o,i)=>o.rotation.x=P.on?(i?-1:1)*s*.72:(i?-.65:1.75));hero.model.position.y=P.on?Math.abs(s)*.043:0;
 let floor=topAt(P.x,P.y);shadow.visible=floor>-8&&state!=='over';shadow.position.set(P.x,floor+.012,0);
 for(let c of coins){if(!c.used&&Math.abs(c.x-camX)<cam.right+2){c.g.rotation.y=t*2.7+c.x;c.g.position.y=c.y+.055*Math.sin(t*2+c.x)}}
 for(let f of foes){f.g.position.set(f.x,f.y+(f.dead?0:.034*Math.abs(Math.sin(age*7+f.a))),0);f.g.rotation.z=f.dead?0:Math.sin(age*7+f.a)*.047}
 if(state!=='pause')for(let i=sparks.length-1;i>=0;i--){let s=sparks[i];s.t-=dt;s.g.position.x+=s.xv*dt;s.g.position.y+=s.yv*dt;s.yv-=8*dt;s.g.rotation.z+=dt*5;if(s.t<=0){scene.remove(s.g);sparks.splice(i,1)}}
 R.render(scene,cam)}
resize();hud();let last=performance.now(),bank=0;function loop(now){let dt=Math.min(.065,(now-last)/1000);last=now;bank+=dt;while(bank>=1/120){step(1/120);bank-=1/120}render(dt);requestAnimationFrame(loop)}requestAnimationFrame(loop);
}
try{boot()}catch(e){$('#summary').textContent='未能启动 3D 画面。请使用支持 WebGL 的浏览器并启用硬件加速。';$('#action').hidden=true;console.error(e)}
