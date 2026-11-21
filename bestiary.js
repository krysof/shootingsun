/* Geometry and maps only. The game owns targeting, flight phases, damage and spawning. */
function createSolarBestiary({node,surface,batch,reflections}){
 const TAU=2*Math.PI,clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),mix=(a,b,t)=>a+(b-a)*t;
 const rand=seed(19011),templates=new Map(),minorRig=new WeakMap();let M,coarse=false;
 function maps(kind){
  let w=192,h=256,cs=[0,1,2].map(()=>Object.assign(document.createElement('canvas'),{width:w,height:h})),cx=cs.map(c=>c.getContext('2d')),im=cx.map(g=>g.createImageData(w,h));
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){let x=i/(w-1),t=1-j/(h-1),s=x*2-1,k=Math.abs(s),grain=rand(),n=.5+.25*Math.sin(x*19+t*13+Math.sin(t*27))+.18*Math.cos(x*37-t*18);
   let tone,relief,rough;if(kind==='vane'){let axis=Math.exp(-k*k*1600),barb=.5+.5*Math.sin(2*Math.PI*(t*60-k*(9+6*t)+.44*Math.sin(t*9+k*4))),lines=.5+.5*Math.cos(TAU*(t*110-k*24)),edge=k**3;
    tone=(.71+.16*barb+.07*lines+.06*edge+.13*axis)*(.91+.09*Math.sin((t+k*.22)*19));relief=.31+.22*barb+.15*lines+.29*axis;rough=.66+.2*(1-axis)+.09*grain
   }else if(kind==='scute'){let row=Math.floor(t*18),f=(x*9+(row%2)*.5)%1,v=(t*18)%1,lip=.5+.5*Math.cos(TAU*f),seam=Math.min(1,Math.abs(v-.18-.12*lip)*14,Math.min(f,1-f)*19);tone=.64+.25*seam+.09*n;relief=.23+.48*seam+.11*n;rough=.67+.23*n
   }else if(kind==='stone'){let veins=Math.abs(Math.sin(x*22+3*Math.sin(t*13)+1.7*Math.sin(9*x+t*24)));tone=.60+.29*n+.09*grain-.14*Math.exp(-veins*12);relief=.24+.43*n+.15*grain;rough=.55+.35*n
   }else{let stria=.5+.5*Math.sin(x*183+.9*Math.sin(t*14)+.8*Math.cos(x*18+t*11));tone=.72+.14*n+.10*stria+.03*grain;relief=.39+.18*stria+.18*n;rough=.63+.23*n}
   [tone,relief,rough].forEach((v,k)=>{let c=clamp(v)*255;im[k].data.set([c,c,c,255],(j*w+i)*4)})}
  let ts=cx.map((g,k)=>{g.putImageData(im[k],0,0);let t=new T.CanvasTexture(cs[k]);if(k===0)t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,R.capabilities.getMaxAnisotropy());return t});return {map:ts[0],bumpMap:ts[1],roughnessMap:ts[2]}}
 // A seamless mantle atlas covers the skin BETWEEN sculpted contour feathers, including the wing undersides.
 function coatAtlas(){
  const W=384,H=384,can=()=>Object.assign(document.createElement('canvas'),{width:W,height:H}),c=can(),h=can(),ctx=c.getContext('2d'),hg=h.getContext('2d');ctx.fillStyle='#3d4148';ctx.fillRect(0,0,W,H);hg.fillStyle='#404040';hg.fillRect(0,0,W,H);
  for(let row=-2;row<13;row++)for(let j=-1;j<13;j++){let rr=seed(1701+((row%12+12)%12)*161+((j%12+12)%12)*19),x=(j+(row%2===0?0:.5))*32+(rr()-.5)*6,y=row*32+(rr()-.5)*7,w=18+rr()*7,L=45+rr()*12,sl=(rr()-.5)*10;
   for(let [g,relief] of [[ctx,false],[hg,true]]){g.save();g.translate(x,y);let grad=g.createLinearGradient(0,0,sl,L);grad.addColorStop(0,relief?'#4e4e4e':'#363c44');grad.addColorStop(.64,relief?'#a9a9a9':'#8b9191');grad.addColorStop(.9,relief?'#bdbdbd':'#aaa79b');grad.addColorStop(1,relief?'#5d5d5d':'#626562');g.beginPath();g.moveTo(-w*.60,0);g.bezierCurveTo(-w*1.2,L*.35,-w*.9+sl,L*.84,sl,L);g.bezierCurveTo(w+sl*.6,L*.77,w,L*.28,w*.51,0);g.closePath();g.fillStyle=grad;g.fill();g.clip();
    for(let k=0;k<15;k++){let t=k/16,yy=L*t;for(let sign of [-1,1]){g.beginPath();g.moveTo(sl*t,yy);g.quadraticCurveTo(sl*t+sign*w*.5,yy-L*.09,sl*t+sign*w,yy-L*.33);g.strokeStyle=relief?'#65656588':'#363c457a';g.lineWidth=.7;g.stroke()}}
    g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(sl*.12,L*.53,sl,L*.96);g.strokeStyle=relief?'#dddddd':'#cebc9b';g.lineWidth=.95;g.stroke();g.restore()}}
  let tx=(a,color)=>{let t=new T.CanvasTexture(a);if(color)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,1.3);t.anisotropy=4;return t};return {map:tx(c,true),bumpMap:tx(h,false)}
 }
 function faultMap(){let c=document.createElement('canvas');c.width=c.height=256;let g=c.getContext('2d'),im=g.createImageData(256,256);function h(x,y,k){return .15+.70*((Math.sin(((x%8+8)%8)*81.7+((y%8+8)%8)*27.1+k*91)*45375.34)%1+1)% .70}
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){let u=x/32+.07*Math.sin(y*.147),v=y/32+.06*Math.sin(x*.21),i=Math.floor(u),j=Math.floor(v),a=20,b=20;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){let d=(i+dx+h(i+dx,j+dy,1)-u)**2+(j+dy+h(i+dx,j+dy,2)-v)**2;if(d<a){b=a;a=d}else if(d<b)b=d}let line=clamp(1-(Math.sqrt(b)-Math.sqrt(a))*27),heat=.4+.6*clamp(Math.sin(u*1.6+v*2)*.8+.4),q=line*heat;im.data.set([q*239,q*69,q*33,255],(x+256*y)*4)}g.putImageData(im,0,0);let t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t}
 function palette(){if(M)return M;let vane=maps('vane'),horn=maps('keratin'),scute=maps('scute'),rock=maps('stone');
  function mat(color,m,r,set,depth){let p=surface(color,m,r);Object.assign(p,set);p.bumpScale=depth;p.envMapIntensity=.83;return p}
  M={feather:mat(0xffffff,.23,.74,vane,.018),mantle:mat(0x574138,.18,.81,vane,.019),crown:mat(0x946640,.29,.65,vane,.012),bill:mat(0x5b4841,.25,.56,horn,.009),tip:mat(0x383637,.28,.50,horn,.006),foot:mat(0xa16c49,.13,.78,scute,.013),iris:surface(0x9f5137,.12,.3),eye:surface(0x211f22,.16,.2),lid:mat(0x413539,.08,.81,horn,.003),mouth:surface(0x693a3d,.01,.82),obsidian:mat(0x3b4147,.41,.60,rock,.011),cinder:mat(0x63453e,.19,.88,rock,.015),coal:mat(0x292d30,.21,.75,rock,.012),ember:mat(0x9c4033,.09,.78,rock,.007)};
  let coat=coatAtlas();Object.assign(M.mantle,coat);M.mantle.color.setHex(0x6e7384);M.mantle.bumpScale=.035;M.covert=M.mantle.clone();M.covert.color.setHex(0x9c8265);
  M.brood=M.mantle.clone();M.brood.color.setHex(0x4b5261);M.obsidian.flatShading=true;M.coal.flatShading=true;
  M.cinder.emissiveMap=faultMap();M.cinder.emissive.setHex(0xffad89);M.cinder.emissiveIntensity=.72;M.cinder.color.setHex(0x51423e);M.ember.emissive.setHex(0x43100b);M.ember.emissiveIntensity=.45;M.feather.vertexColors=true;M.feather.side=T.DoubleSide;return M}
 function grid(p,m,n,k,fun,flip=false,tint=null){if(coarse){n=Math.max(3,Math.ceil(n*.45));k=Math.max(3,Math.ceil(k*.43))}let pts=[],uv=[],idx=[],col=[];for(let j=0;j<=k;j++)for(let i=0;i<=n;i++){let u=i/n,v=j/k,pos=fun(u,v);pts.push(pos.x,pos.y,pos.z);uv.push(u,v);if(tint){let c=tint(u,v);col.push(c.r,c.g,c.b)}if(i&&j){let d=j*(n+1)+i,a=d-n-2,b=a+1,c=d-1;idx.push(...(flip?[a,c,b,b,c,d]:[a,b,c,b,d,c]))}}
  let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));if(tint)g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return mesh(g,m,p)}
 function row(rows,v){let t=v*(rows.length-1),j=Math.min(rows.length-2,Math.floor(t)),f=t-j;return rows[j].map((n,i)=>mix(n,rows[j+1][i],f))}
 // Longitudinal section profiles: z, half-width, dorsal height, ventral depth, centre height.
 function shape(p,m,rows,sides=32){return grid(p,m,sides,rows.length*3,(u,v)=>{let a=u*TAU,[z,w,hi,lo,y]=row(rows,v),sn=Math.sin(a);return V(Math.cos(a)*w,y+sn*(sn>0?hi:lo),z)},rows.at(-1)[0]<rows[0][0])}
 function ell(p,m,x,y,z,w,h,d){let o=mesh(new T.SphereGeometry(1,coarse?8:16,coarse?6:12),m,p,x,y,z);o.scale.set(w,h,d);return o}
 function tapered(p,m,pts,radii,n=15){let c=new T.CatmullRomCurve3(pts),f=c.computeFrenetFrames(n,false);return grid(p,m,8,n,(u,t)=>{let j=Math.round(t*n),z=t*(radii.length-1),i=Math.min(radii.length-2,Math.floor(z)),r=mix(radii[i],radii[i+1],z-i);return c.getPointAt(t).addScaledVector(f.normals[j],r*Math.cos(u*TAU)).addScaledVector(f.binormals[j],r*Math.sin(u*TAU))})}
 const ink=[0x383a42,0x4d4a4d,0x393f46,0x554b49],bronze=[0xa78151,0xb1885d,0x936d50,0xb9996d],burn=[0x845043,0x995b47,0x714843,0xa67554];
 function plume(p,origin,delta,width,normal,pal,index,type='cover',bend=0){
  let d=delta.clone().normalize(),side=normal.clone().cross(d);if(side.lengthSq()<.00001)side.set(1,0,0);side.normalize();let norm=d.clone().cross(side).normalize(),len=delta.length(),long=type==='flight'||type==='tail',primary=new T.Color(pal[index%pal.length]),brim=new T.Color(long?0xb49974:0xc6a782),stem=new T.Color(0xbc9c75);
  return grid(p,M.feather,long?8:6,long?19:9,(u,t)=>{let s=u*2-1,k=Math.abs(s),wid=width*Math.pow(Math.sin(Math.PI*t),long?.64:.50)*mix(.78,1.12,t),nick=1-(k>.7&&t>.48?.13*Math.max(0,Math.sin(t*68+index*2.1))**7:0);
   return origin.clone().addScaledVector(delta,t).addScaledVector(side,s*wid*(s<0?.83:1)*nick+bend*len*t*t).addScaledVector(norm,width*(.27*(1-k*k)*Math.sin(Math.PI*t)-.08*k*k)+len*.046*Math.sin(Math.PI*t))},false,(u,t)=>{let k=Math.abs(2*u-1),bar=.5+.5*Math.cos((t-.22*k)*Math.PI*(long?9:5)+index*.58),c=primary.clone();c.lerp(brim,Math.max(0,(k-.65)*1.3)*(.32+.25*t));if(long)c.multiplyScalar(.65+.24*bar+.14*t);else c.multiplyScalar(.77+.30*t+.06*bar);if(k<.03)c.lerp(stem,long?.49:.32);if(type==='tail'&&t>.69&&t<.80)c.lerp(brim,.38);return c})}
 function bill(head,jaw,scale=1){let up=shape(head,M.bill,[[-.32,.22,.17,.035,.03],[-.48,.237,.17,.035,.026],[-.69,.185,.14,.026,.024],[-.89,.125,.090,.020,.008],[-1.04,.059,.052,.022,-.039],[-1.09,.023,.025,.012,-.122],[-1.086,.005,.006,.006,-.173]],24);
  shape(jaw,M.tip,[[.02,.19,.034,.087,.05],[-.20,.202,.030,.106,.056],[-.43,.151,.015,.083,.061],[-.62,.066,.021,.046,.059],[-.68,.006,.007,.008,.073]],20);
  ell(jaw,M.mouth,0,.091,-.19,.123,.024,.27);tapered(head,M.crown,[V(0,.20,-.34),V(0,.18,-.55),V(0,.117,-.81),V(0,.020,-1.005)],[.022,.016,.010,.002],14);
  for(let a of [-1,1]){ell(head,M.lid,a*.176,.134,-.514,.046,.025,.073);ell(head,M.tip,a*.20,.14,-.52,.024,.014,.046)}}
 function eye(head,a){let x=a*.377;ell(head,M.lid,x,.138,-.23,.112,.119,.153);ell(head,M.iris,a*.454,.135,-.25,.052,.077,.09);
  ell(head,M.eye,a*.487,.132,-.264,.033,.060,.060);
  for(let sign of [-1,1])tapered(head,sign===1?M.crown:M.lid,[V(a*.35,.15,-.40),V(a*.445,.14+sign*.073,-.323),V(a*.471,.14+sign*.083,-.220),V(a*.417,.17,-.126)],[.004,.021,.023,.004],13);
  for(let j=0;j<5;j++){let t=j/4;plume(head,V(a*(.30+.109*t),.233+.027*t,-.39+.25*t),V(a*.095,.095+.041*t,.21+.12*t),.052,V(a,.4,0),bronze,j)}}
 function foot(p,j,s){let leg=node(p,j*.49,-.44,j===0?.75:-.09),ankle=node(leg,0,-.69,.28);
  tapered(leg,M.foot,[V(),V(.012,-.24,.043),V(-.01,-.46,.17),V(0,-.69,.28)],[.145,.121,.082,.093],19);tapered(ankle,M.foot,[V(),V(0,-.16,.019),V(0,-.35,-.048),V(0,-.405,-.098)],[.095,.081,.090,.113],14);
  for(let k=0;k<6;k++){let t=k/6;ell(ankle,M.bill,0,-.042-.33*t,-.071-.05*t,.071-.015*t,.026,.028)}
  for(let q of [-1,0,1,2]){let back=q===2,x=back?0:q*.185,z=back?.22:-.46+Math.abs(q)*.045,dest=V(x,-.485,z);
   tapered(ankle,M.foot,[V(0,-.37,-.080),V(x*.40,-.413,z*.43-.04),V(x*.78,-.449,z*.81),dest],[.075,.061,.052,.044],14);
   tapered(ankle,M.tip,[dest,V(x*1.12,-.512,z+(back?.076:-.082)),V(x*1.14,-.585,z+(back?.099:-.099)),V(x*1.10,-.64,z+(back?.071:-.065))],[.047,.039,.023,.002],12)}
  batch(leg);batch(ankle);return {leg,ankle,j}}
 function wingWeb(p,a,length,chord,m){grid(p,m,18,21,(u,v)=>{let angle=u*TAU,root=1-.70*v,rad=Math.max(.018,Math.sin(Math.PI*(.14+.86*v))**.42),thickness=chord*.22*root*rad;return V(a*v*length,.06+.106*v+thickness*Math.sin(angle),-.30*v+.03+chord*root*rad*(.30+.65*Math.cos(angle)))},a>0)}
 function boss(){palette();let root=node(),body=node(root),neck=node(body,0,.37,-1.16),head=node(neck,0,.48,-.53),jaw=node(head,0,-.05,-.4),tail=node(body,0,.08,1.32);
  let b={root,body,neck,head,jaw,tail,spars:[],fans:[],streamers:[],feet:[],phase:0,diveStart:null,lastTele:0,lastYaw:0};root.name='三足金乌';
  shape(body,M.mantle,[[-1.72,.11,.18,.22,.21],[-1.44,.55,.53,.52,.16],[-.94,.87,.69,.85,.12],[-.38,1.01,.65,.89,.08],[.26,.89,.58,.77,.06],[.92,.62,.45,.52,.06],[1.58,.34,.25,.31,.06],[1.98,.07,.10,.11,.07]]);
  shape(neck,M.crown,[[-.80,.18,.27,.23,.39],[-.57,.46,.42,.45,.31],[-.22,.56,.49,.55,.16],[.15,.57,.46,.57,.02],[.41,.39,.30,.43,-.07]]);
  shape(head,M.mantle,[[-.63,.14,.16,.16,.035],[-.50,.33,.32,.25,.048],[-.24,.435,.37,.32,.077],[.07,.46,.41,.39,.052],[.37,.36,.32,.33,.025],[.55,.13,.13,.16,.0]]);bill(head,jaw);
  for(let a of [-1,1]){eye(head,a);for(let j=0;j<8;j++){let t=j/7;plume(head,V(a*(.052+.29*t),.36-.12*t,.05-.03*t),V(a*(.12+.39*t),.49-.33*t,.82+.52*t),.090+.018*t,V(a*.43,.8,-.21),j%3?bronze:burn,j,'flight',a*.04)}
   for(let j=0;j<11;j++){let t=j/10;plume(head,V(a*(.285+.105*Math.sin(Math.PI*t)),.21-.36*t,-.20+.075*t),V(a*.14,-.21-.11*t,.38+.14*t),.091,V(a,.1,-.1),j%3?ink:bronze,j)}
  }
  // Sickle hackles, an overlapping brow mantle and a contour hood wrap the skull.
  for(let j=0;j<3;j++)for(let i=0;i<13;i++){let a=(i+.5*(j%2))*TAU/13,z=-.33+j*.223,r=[.398,.446,.406][j],n=V(Math.sin(a),Math.cos(a),-.14);plume(head,V(r*Math.sin(a),.055+.87*r*Math.cos(a),z),V(.070*n.x,.054*n.y,.315),.100,n,j===2?bronze:ink,i+j)}
  // Mantle and pectoral feathers follow the ribcage rather than standing on an ellipsoid.
  for(let j=0;j<6;j++)for(let i=0;i<18;i++){let a=i*TAU/18+.10*(j%2),z=-1.22+j*.373,r=[.72,.88,.98,.91,.78,.57][j],n=V(Math.sin(a),Math.cos(a),-.19).normalize();
   let org=V(r*Math.sin(a),.11+r*(Math.cos(a)>0?.72:.85)*Math.cos(a),z);plume(body,org,V(.13*Math.sin(a),.10*Math.cos(a)-.04,.62+.19*(1-Math.cos(a))*.5),.155+.044*Math.sin(Math.PI*j/6),n,(j<2||Math.cos(a)>.67)?bronze:ink,i+j)}
  for(let j=0;j<3;j++)for(let i=0;i<15;i++){let a=(i+.40*(j%2))*TAU/15,n=V(Math.sin(a),.07,Math.cos(a)),r=.40+j*.073;plume(neck,V(r*n.x,.56-j*.19,-.28+r*n.z),V(.20*n.x,-.55-.13*Math.abs(n.z),.24+.10*n.z),.128,n,j===0?ink:bronze,i+j)}
  for(let a of [-1,1]){let shoulder=node(body,a*.64,.16,-.41),wrist=node(shoulder,a*2.18,.09,-.29);b.spars.push({a,shoulder,wrist});
    wingWeb(shoulder,a,2.34,.86,M.covert);for(let j=0;j<11;j++){let u=j/10;plume(shoulder,V(a*(.07+1.98*u),.14+u*.03,-.18-.26*u),V(a*(.29+.18*u),.021,1.01-.22*u),.204,V(0,1,0),bronze,j)}
    wingWeb(wrist,a,1.29,.43,M.mantle);
    for(let layer=0;layer<3;layer++)for(let j=0;j<10;j++){let u=j/9,z=.08-.35*u-.16*layer,y=.06+.112*layer+.084*u,org=V(a*(.03+2.02*u),y,z);
      plume(shoulder,org,V(a*(.38+.58*u),-.17+u*.08,2.16-.46*layer+.28*(1-u)),.278-layer*.035,V(0,1,0),layer===2?bronze:layer===1?burn:ink,j+layer,layer===0?'flight':'cover',a*.018)}
    for(let j=0;j<11;j++){let u=j/10,fan=node(wrist,a*(.06+1.19*u),.06+.14*u,-.08-.35*u);b.fans.push({fan,u,a});
     plume(fan,V(),V(a*(.94+3.44*u),.20+u*.28,2.85-1.80*u),.35-.075*u,V(0,1,0),j%4===0?burn:ink,j,'flight',a*.050);
     plume(fan,V(0,.079,-.032),V(a*(.57+1.77*u),.13+u*.16,1.67-.80*u),.23,V(0,1,0),bronze,j,'cover',a*.032);
     batch(fan)}
    batch(shoulder);batch(wrist)}
  for(let j=-5;j<=5;j++){let stem=node(tail,j*.088,0,0);b.streamers.push({stem,j});
   plume(stem,V(),V(j*.465,-.53+Math.abs(j)*.051,4.26-Math.abs(j)*.32),.33,V(0,1,.1),Math.abs(j)%3?ink:bronze,Math.abs(j),'tail',j*.012);
   plume(stem,V(0,.096,0),V(j*.32,-.26,2.31-Math.abs(j)*.14),.235,V(0,1,.1),bronze,Math.abs(j),'tail');batch(stem)}
  for(let j=-1;j<=1;j++)b.feet.push(foot(body,j));for(let part of [body,neck,head,jaw])batch(part);M.solar=M.feather.clone();root.traverse(o=>{if(o.material===M.feather)o.material=M.solar});return b}
 function raven(){let r=node(),le=node(r,-.17,.07,-.10),ri=node(r,.17,.07,-.10);le.name='leftWing';ri.name='rightWing';r.name='火鸦';
  shape(r,M.brood,[[-.50,.05,.09,.11,.09],[-.40,.185,.20,.21,.07],[-.18,.27,.233,.28,.04],[.08,.24,.206,.24,.03],[.34,.13,.14,.14,.03],[.49,.037,.044,.065,.045]],22);
  let hd=node(r,0,.13,-.39);shape(hd,M.brood,[[-.24,.07,.08,.09,.01],[-.16,.137,.136,.12,.025],[0,.159,.16,.147,.042],[.13,.139,.13,.127,.041],[.22,.073,.08,.07,.02]],20);
  shape(hd,M.bill,[[-.13,.098,.078,.031,.01],[-.27,.113,.074,.029,.0],[-.41,.084,.045,.022,-.014],[-.53,.041,.03,.019,-.028],[-.58,.009,.012,.008,-.055]],16);
  shape(hd,M.tip,[[-.16,.092,.015,.04,-.035],[-.30,.101,.015,.038,-.037],[-.46,.057,.013,.029,-.040],[-.555,.008,.006,.010,-.046]],16);
  for(let a of [-1,1]){ell(hd,M.iris,a*.13,.060,-.089,.035,.037,.040);ell(hd,M.eye,a*.153,.059,-.095,.016,.026,.024);
   for(let j=0;j<5;j++)plume(hd,V(a*(.073+j*.013),.122-j*.015,-.073),V(a*.061,.063-j*.013,.19+j*.009),.033,V(a,.7,0),burn,j);
   let wing=a<0?le:ri;wingWeb(wing,a,.54,.26,M.brood);for(let j=0;j<8;j++){let t=j/7;plume(wing,V(a*.45*t,.115,-.07-.12*t),V(a*.15,.014,.275),.061,V(0,1,0),ink,j)}
   tapered(hd,M.brood,[V(a*.095,.105,-.177),V(a*.149,.100,-.127),V(a*.164,.093,-.073)],[.008,.016,.007],8);
   for(let j=0;j<4;j++)plume(hd,V(a*(.075+j*.018),.128-j*.02,-.022),V(.033*a,.025-j*.007,.22+j*.01),.035,V(a,.6,0),ink,j);
   for(let j=0;j<10;j++){let u=j/9;plume(wing,V(a*.48*u,.015+.035*u,-.12*u),V(a*(.24+.69*u),-.034+u*.048,.58-.22*u),.099-.022*u,V(0,1,0),ink,j,'flight',a*.03);
    plume(wing,V(a*.45*u,.055,-.13*u),V(a*(.14+.41*u),.012,.34-.14*u),.074,V(0,1,0),j%3?burn:ink,j)}
   for(let j=0;j<5;j++)plume(r,V(a*.045*j,.015,.28),V(a*.064*j,-.072,.69-.063*j),.091,V(0,1,0),ink,j,'tail');
   let heel=V(a*.13,-.33,.12);tapered(r,M.foot,[V(a*.11,-.16,0),V(a*.126,-.26,.068),heel],[.038,.029,.020],8);
   for(let j=-1;j<=1;j++)tapered(r,M.tip,[heel,V(a*.13+.04*j,-.346,.043),V(a*.13+.063*j,-.365,-.024),V(a*.13+.065*j,-.40,-.035)],[.014,.013,.009,.001],8);
   batch(wing)}
  for(let j=0;j<3;j++)for(let i=0;i<9;i++){let t=i*TAU/9+.16*(j%2);plume(r,V(.22*Math.sin(t),.03+.209*Math.cos(t),-.24+j*.16),V(.045*Math.sin(t),-.025+.020*Math.cos(t),.24),.081,V(Math.sin(t),Math.cos(t),0),j?ink:burn,i)}batch(hd);batch(r);return r}
 function shard(p,origin,end,width,depth,material,j=0){
  let d=end.clone().sub(origin),axis=d.clone().normalize(),a=V(0,0,1).cross(axis);if(a.lengthSq()<.01)a=V(1,0,0);a.normalize();let b=axis.clone().cross(a);
  return grid(p,material,7,6,(u,t)=>{let theta=u*TAU+.10*Math.sin(j*.8+t*2),r=.015+.99*Math.sin(t**.65*Math.PI)**.76,fac=1+.105*Math.cos(3*theta+j);
   return origin.clone().addScaledVector(d,t).addScaledVector(a,Math.cos(theta)*width*r*fac).addScaledVector(b,Math.sin(theta)*depth*r*fac)},false)}
 // Convex fracture faces, bevelled margins and a buried back edge form armour out of the cooled shell itself.
 function shellPlate(p,out,cx,cy,cz,depth,m){let pts=[],ids=[],uv=[];pts.push(cx,cy,cz-depth);uv.push(.5,.5);
  for(let band of [0,1])for(let [x,y,z] of out){let f=band?1:.82;pts.push(mix(cx,x,f),mix(cy,y,f),band?z:z-.024-depth*.17);uv.push(.5+(x-cx)*2,.5+(y-cy)*2)}
  let n=out.length;for(let j=0;j<n;j++){let q=(j+1)%n;ids.push(0,j+1,q+1,1+j,1+j+n,1+q+n,1+j,1+q+n,1+q)}
  let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ids);g.computeVertexNormals();m.side=T.DoubleSide;return mesh(g,m,p)}
 function spirit(){let r=node();r.name='焰灵';let head=node(r,0,.34,-.085);head.name='mask';
  // Dense basalt spine and ribs over a kiln-red interior; seams are on the body surface.
  tapered(r,M.cinder,[V(0,-.38,.07),V(0,-.13,.035),V(0,.09,-.008),V(0,.27,.02),V(0,.39,.02)],[.13,.17,.255,.31,.129],17);
  for(let a of [-1,1]){for(let j=0;j<4;j++){let w=.30-.036*j;shard(r,V(a*.025,.242-j*.104,-.17+j*.012),V(a*w,.135-j*.113,-.018),.112-.011*j,.076,M.obsidian,j);
    tapered(r,M.ember,[V(a*.06,.194-j*.108,-.201+j*.015),V(a*w*.58,.171-j*.108,-.175+j*.011),V(a*w*.89,.114-j*.108,-.090)],[.006,.011,.002],8)}
   const A=(x,y,z)=>[a*x,y,z];
   shellPlate(r,[A(.018,.245,-.285),A(.164,.308,-.224),A(.299,.251,-.138),A(.285,.132,-.191),A(.166,.064,-.253),A(.055,.107,-.277)],a*.142,.195,-.258,.034,M.obsidian);
   for(let j=0;j<3;j++){let y=.035-j*.090,rr=.239-j*.022; shellPlate(r,[A(.025,y+.045,-rr),A(.167,y+.055,-rr*.90),A(.221,y+.014,-rr*.61),A(.136,y-.038,-rr*.93),A(.042,y-.049,-rr)],a*.11,y,-rr,.018,M.coal)}
   let arm=node(r,a*.284,.215,.013);arm.name=a<0?'leftArm':'rightArm';tapered(arm,M.cinder,[V(),V(a*.112,-.108,.012),V(a*.192,-.282,-.014),V(a*.227,-.453,-.088)],[.126,.114,.074,.083],13);
   shard(arm,V(-a*.052,-.025,.012),V(a*.170,.215,.044),.137,.119,M.obsidian,2);shard(arm,V(a*.06,-.08,-.01),V(a*.247,.078,.030),.099,.087,M.coal,4);
   shard(arm,V(a*.163,-.22,-.007),V(a*.30,-.53,-.122),.114,.083,M.obsidian,3);
   ell(arm,M.cinder,a*.247,-.49,-.12,.077,.093,.070);
   for(let j=0;j<3;j++){let x=a*(.222+.030*j),z=-.15+.025*j;let mid=V(x+a*.025,-.62+.018*j,z-.052);tapered(arm,M.coal,[V(x,-.51,z),mid,V(x-a*.013,-.658+.015*j,z-.114)],[.026,.019,.003],9)}
   tapered(arm,M.tip,[V(a*.196,-.49,-.14),V(a*.15,-.551,-.17),V(a*.172,-.592,-.197)],[.031,.022,.003],8);
   const pivot=node(r,a*.144,-.25,.056),leg=node(pivot,-a*.144,.25,-.056);pivot.name=a<0?'leftLeg':'rightLeg';
   let hip=V(a*.144,-.25,.056),knee=V(a*.218,-.446,-.011),heel=V(a*.188,-.586,.133);tapered(leg,M.cinder,[hip,knee,heel,V(a*.182,-.69,.047)],[.119,.088,.061,.050],12);shard(leg,hip.clone().add(V(0,0,-.049)),knee.clone().add(V(0,-.066,-.044)),.088,.067,M.obsidian,2);
   for(let j=-1;j<=1;j++)tapered(leg,M.coal,[V(a*.182,-.685,.068),V(a*.18+j*.044,-.71,-.014),V(a*.18+j*.069,-.741,-.083)],[.026,.018,.003],8);batch(leg);batch(arm)}
  shape(head,M.cinder,[[-.181,.071,.095,.077,0],[-.13,.15,.17,.137,.023],[0,.164,.187,.162,.031],[.13,.137,.156,.128,.019],[.19,.05,.08,.06,.02]],18);
  for(let a of [-1,1]){shard(head,V(a*.042,.10,-.144),V(a*.142,.289,.009),.077,.083,M.obsidian,3);shard(head,V(a*.023,.061,-.176),V(a*.168,.123,-.087),.047,.037,M.coal,1);
   ell(head,M.ember,a*.085,.044,-.156,.042,.016,.023);shard(head,V(a*.131,.033,-.103),V(a*.041,-.141,-.155),.052,.043,M.obsidian,6)}
  for(let a of [-1,1]){let A=(x,y,z)=>[a*x,y,z];
   shellPlate(head,[A(.008,.062,-.198),A(.041,.164,-.156),A(.139,.193,-.069),A(.158,.087,-.093),A(.119,.063,-.167),A(.055,.040,-.187)],a*.09,.11,-.165,.020,M.obsidian);
   shellPlate(head,[A(.037,.024,-.184),A(.114,.044,-.167),A(.163,.033,-.105),A(.144,-.073,-.103),A(.060,-.134,-.156),A(.042,-.065,-.177)],a*.095,-.031,-.155,.019,M.coal);
   tapered(head,M.ember,[V(a*.048,.037,-.189),V(a*.088,.042,-.179),V(a*.126,.056,-.159)],[.004,.008,.002],8);
   tapered(head,M.obsidian,[V(a*.104,.146,.045),V(a*.167,.220,.091),V(a*.185,.292,.15),V(a*.161,.377,.177)],[.071,.054,.026,.003],12)}
  shard(head,V(0,.085,-.15),V(0,-.087,-.23),.035,.030,M.obsidian,1);
  for(let j=0;j<5;j++)shard(r,V(0,.27-j*.116,.10),V(0,.45-j*.126,.30-j*.012),.092-j*.009,.080,M.obsidian,j);
  batch(head);batch(r);return r}
 function distant(builder){coarse=true;let src;try{src=builder()}finally{coarse=false}src.updateMatrixWorld(true);let xyz=[],col=[],idx=[],count=0;
  src.traverse(o=>{if(!o.isMesh)return;let geo=o.geometry.clone().applyMatrix4(o.matrixWorld),pos=geo.attributes.position,cc=geo.attributes.color,c=o.material.color;
   for(let j=0;j<pos.count;j++){xyz.push(pos.getX(j),pos.getY(j),pos.getZ(j));col.push(c.r*(cc?cc.getX(j):.76),c.g*(cc?cc.getY(j):.76),c.b*(cc?cc.getZ(j):.76))}if(geo.index){for(let n of geo.index.array)idx.push(n+count)}else for(let j=0;j<pos.count;j++)idx.push(j+count);count+=pos.count;geo.dispose();o.geometry.dispose()});
  let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(xyz,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();let low=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.74,metalness:.16}));low.name='远景轮廓';return low}
 function minion(i){palette();let type=i%3===1?'spirit':'raven',builder=type==='raven'?raven:spirit;if(!templates.has(type))templates.set(type,{hi:builder(),lo:distant(builder)});
  let sample=templates.get(type),hi=sample.hi.clone(true),root=new T.LOD();root.name=hi.name;root.addLevel(hi,0);root.addLevel(sample.lo.clone(),55,.13);
  minorRig.set(root,{type,left:hi.getObjectByName(type==='raven'?'leftWing':'leftArm'),right:hi.getObjectByName(type==='raven'?'rightWing':'rightArm'),mask:hi.getObjectByName('mask')});return root}
 function poseMinion(root,t){let r=minorRig.get(root);if(!r)return;if(r.type==='raven'){let f=.55*Math.sin(t*8.4);r.left.rotation.z=-f;r.right.rotation.z=f;r.left.rotation.y=-.11*Math.cos(t*8.4);r.right.rotation.y=-r.left.rotation.y}else{let f=Math.sin(t*2.75);r.left.rotation.x=.15*f;r.right.rotation.x=-.15*f;r.mask.rotation.y=.14*Math.sin(t*1.3)}}
 return {boss,minion,poseMinion,dress(k){M.solar.color.setHex([0xffeed6,0xe3e9eb,0xd5e3e9,0xf0e2da,0xdad9e8,0xffd6b7,0xe9e7e1,0xf2d6cb,0xffcf9e][k]??0xffffff)}}
}
