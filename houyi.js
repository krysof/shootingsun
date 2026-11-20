/* Appearance-only workshop. Geometry is authored in the original rig's joint spaces. */
function houyiWorkshop({node,oval,form,band,pipe,batch,surface}){
 const tau=Math.PI*2,clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),mix=(a,b,t)=>a+(b-a)*t;
 const lerpRow=(rows,y)=>{let i=0;while(i<rows.length-2&&y>rows[i+1][0])i++;let a=rows[i],b=rows[i+1],t=clamp((y-a[0])/(b[0]-a[0]));return a.map((n,j)=>mix(n,b[j],t))};
 // All sampled maps are generated locally. Linear relief/gloss maps are separate from sRGB dyes.
 const rand=seed(69182),maps={};
 function textile(type){if(maps[type])return maps[type];let N=256,c=document.createElement('canvas'),b=document.createElement('canvas'),r=document.createElement('canvas');for(let t of [c,b,r])t.width=t.height=N;
  let cs=c.getContext('2d'),bs=b.getContext('2d'),rs=r.getContext('2d'),ci=cs.createImageData(N,N),bi=bs.createImageData(N,N),ri=rs.createImageData(N,N);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let u=x/N*tau,v=y/N*tau,q=rand(),field=.5+.22*Math.sin(3*u+.74*Math.sin(2*v))+.13*Math.cos(5*v+2*u)+.1*Math.sin(11*u-7*v),h=.5,l=.92,k=.8;
   switch(type){
    case 'cloth':{let weave=Math.cos(u*64)*.52+Math.cos(v*80+Math.sin(u*32)*.48)*.48;h=.5+.32*weave+.09*q;l=.83+.10*weave+.09*field+.025*q;k=.85+.12*field;break}
    case 'brocade':{let weave=Math.cos(u*64)*Math.cos(v*64),broc=Math.pow(Math.abs(Math.sin(u*4+Math.sin(v*4))*Math.sin(v*4)),6);h=.44+.13*weave+.29*broc;l=.73+.20*broc+.12*field+.07*weave;k=.71+.17*field-.14*broc;break}
    case 'hide':{let grain=Math.abs(Math.sin(u*24+3*Math.sin(v*9)+Math.sin(u*5))*Math.cos(v*28+2*Math.cos(u*12)));h=.38+.36*grain+.19*field+.055*q;l=.74+.17*field+.10*grain+.045*q;k=.73+.18*grain;break}
    case 'metal':{let grind=Math.cos(v*89+Math.sin(u*9))*.5+.5;h=.38+.1*grind+.12*q+.17*field;l=.72+.22*field+.06*q;k=.39+.43*field+.09*grind;break}
    case 'wood':{let grain=.5+.5*Math.sin(u*21+2.4*Math.sin(v+u*3)+.95*Math.sin(4*v)+.8*Math.sin(4*u));h=.25+.45*grain+.13*q;l=.61+.33*grain+.11*field;k=.62+.18*field;break}
    case 'hair':{let strand=.5+.5*Math.cos(u*69+1.1*Math.sin(v*2)+Math.sin(u*4));h=.34+.5*strand;l=.67+.24*strand+.07*field;k=.60+.18*strand;break}
    case 'skin':{let pore=q>.91?.36:.66;h=pore+.14*field;l=.84+.09*field+.055*q;k=.76+.16*q;break}
   }let i=4*(x+y*N);ci.data.set([255*l,255*l,255*l,255],i);bi.data.set([255*h,255*h,255*h,255],i);ri.data.set([255*k,255*k,255*k,255],i)}
  cs.putImageData(ci,0,0);bs.putImageData(bi,0,0);rs.putImageData(ri,0,0);if(type==='metal'||type==='hide')for(let i=0;i<75;i++){let x=rand()*N,y=rand()*N;line(cs,x,y,x+rand()*13,y+(type==='metal'?2:15)*rand(),'#dbc7ac66',.6)}
  const tex=(c,color)=>{let t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(type==='skin'?2:1.6,type==='wood'?1:2);if(color)t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,R.capabilities.getMaxAnisotropy());return t};
  return maps[type]={map:tex(c,true),bumpMap:tex(b,false),roughnessMap:tex(r,false)}}
 function dyed(color,type,metal,rough,relief){let m=surface(color,metal,rough);Object.assign(m,textile(type));m.bumpScale=relief;return m}
 function materials(){let M={
  skin:dyed(0xc09172,'skin',0,.72,.0008),lips:dyed(0xa56e5c,'skin',0,.62,.00035),crease:surface(0x603e32,0,.88),ear:dyed(0xad7963,'skin',0,.78,.0006),
  cloth:dyed(0x394641,'cloth',0,.98,.0028),silk:dyed(0x914535,'brocade',.025,.83,.0029),hem:dyed(0xd4a063,'brocade',.12,.74,.0018),indigo:dyed(0x344e52,'brocade',.035,.89,.0028),linen:dyed(0xc7b99b,'cloth',0,.92,.0024),
  leather:dyed(0x513728,'hide',.045,.86,.0032),trim:dyed(0x9a6a44,'hide',.065,.73,.0023),bronze:dyed(0xb58d4f,'metal',.78,.57,.0017),plate:dyed(0x586765,'metal',.72,.67,.002),
  bright:dyed(0xd8b577,'metal',.82,.47,.0007),jade:surface(0x688e7d,.2,.36),hair:dyed(0x282623,'hair',.025,.86,.00065),lock:dyed(0x39312a,'hair',.035,.82,.0007),
  wood:dyed(0xa97648,'wood',.11,.56,.0014),cord:dyed(0xe0cda4,'cloth',0,.84,.0011),dark:dyed(0x332f2a,'hide',.05,.79,.0015),flight:surface(0xd5c6a1,.05,.75)};
  M.face=M.skin.clone();M.face.vertexColors=true;M.plume=M.flight.clone();M.plume.vertexColors=true;M.plume.side=T.DoubleSide;return M}
 function grid(p,m,nu,nv,sample,reverse=false,tint=null){let xyz=[],uv=[],idx=[],colors=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){let u=i/nu,v=j/nv,q=sample(u,v);xyz.push(q.x,q.y,q.z);uv.push(u,v);if(tint)colors.push(...tint(u,v,q));if(i&&j){let n=j*(nu+1)+i,a=n-nu-2,b=n-nu-1,c=n-1;idx.push(...(reverse?[a,c,b,b,c,n]:[a,b,c,c,b,n]))}}
  let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(xyz,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));if(tint)g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(idx);g.computeVertexNormals();return mesh(g,m,p)}
 function stroke(p,m,points,rad,steps=16,sides=6){let curve=new T.CatmullRomCurve3(points),f=curve.computeFrenetFrames(steps,false);
  let o=grid(p,m,sides,steps,(u,t)=>{let i=Math.round(t*steps),r=typeof rad==='function'?rad(t):rad,a=u*tau;return curve.getPointAt(t).addScaledVector(f.normals[i],r*Math.cos(a)).addScaledVector(f.binormals[i],r*Math.sin(a))});return o}
 function loft(p,m,rows,detail=null,nu=30,nv=24){let y0=rows[0][0],y1=rows.at(-1)[0];return grid(p,m,nu,nv,(u,v)=>{let a=u*tau,y=mix(y0,y1,v),[,rx,rz,ox,oz]=lerpRow(rows,y),q=V((ox||0)+Math.sin(a)*rx,y,(oz||0)+Math.cos(a)*rz);return detail?detail(q,a,v):q})}
 const faceRows=[[-.022,.045,.092,.079,-.013],[-.009,.084,.119,.093,-.011],[.014,.098,.131,.108,-.005],[.041,.123,.133,.126,.001],[.078,.144,.135,.142,.006],[.117,.15,.143,.148,.012],[.154,.154,.145,.151,.014],[.192,.153,.151,.155,.014],[.236,.149,.148,.157,.014],[.27,.137,.134,.146,.014],[.302,.105,.101,.117,.015],[.328,.052,.049,.063,.016],[.337,.008,.008,.012,.016]];
 function bump(x,y,cx,cy,wx,wy){return Math.exp(-(((x-cx)/wx)**2+((y-cy)/wy)**2))}
 function facepoint(a,y){let [,w,front,back,cz]=lerpRow(faceRows,y),c=Math.cos(a),x=Math.sin(a)*w,X=Math.abs(x),z;
  if(c>0){let d=.015*bump(X,y,.095,.124,.04,.034)-.019*bump(X,y,.066,.157,.042,.019)+.019*bump(X,y,.061,.181,.048,.018)+.037*bump(x,y,0,.151,.021,.049)+.048*bump(x,y,0,.111,.021,.018)+.012*bump(X,y,.026,.101,.012,.011)+.006*bump(X,y,.009,.079,.004,.014)-.007*bump(x,y,0,.039,.040,.006)+.014*bump(x,y,0,.055,.055,.024)+.019*bump(x,y,0,.018,.052,.015);z=cz-front*Math.pow(c,.64)-d*Math.min(1,c*3)}
  else z=cz-back*c;let jawLift=.045*(1-Math.max(0,c))**1.3*clamp((.13-y)/.14);return V(x,y+jawLift,z)}
 function skinAt(x,y,out=0){let [,w]=lerpRow(faceRows,y),p=facepoint(Math.asin(clamp(x/w,-.994,.994)),y);p.z-=out;return p}
 // A face-specific UV atlas bakes pigmentation, lid occlusion, short beard shadow and weathering into skin.
 function complexion(M){let c=document.createElement('canvas');c.width=768;c.height=512;let g=c.getContext('2d'),im=g.createImageData(c.width,c.height);
  for(let j=0;j<c.height;j++){let y=mix(.337,-.022,j/(c.height-1)),w=lerpRow(faceRows,y)[1];for(let i=0;i<c.width;i++){let angle=(i/c.width-.5)*tau,F=Math.max(0,Math.cos(angle)),x=w*Math.sin(angle),a=Math.abs(x),noise=rand(),grain=(noise-.5)*8+2*Math.sin(i*.15+3*Math.sin(j*.11))*Math.cos(.077*j);
   let socket=bump(a,y,.063,.159,.041,.022)+.5*bump(a,y,.072,.139,.034,.014),cheek=bump(a,y,.098,.112,.043,.03),m=F*(.95*bump(x,y,0,.083,.042,.009)+.52*bump(x,y,0,.032,.045,.008)+clamp((.078+.04*clamp(a/.14)-y)*29)*(1-.7*bump(x,y,0,.05,.056,.02))),fold=bump(a,y,.042,.082,.006,.015)+.45*bump(a,y,.015,.088,.010,.012);
   let pepper=m*(noise>.72?12+34*rand():2),spot=F*.02>rand()&&y>.086&&y<.145?14*rand():0,base=231+grain-28*socket*F-18*fold*F-14*m-pepper-spot;
   let k=(i+j*c.width)*4;im.data.set([base+5*cheek*F,base-7-10*cheek*F-4*m,base-10-12*cheek*F+4*m,255],k)}}g.putImageData(im,0,0);
  function xy(x,y){let w=lerpRow(faceRows,y)[1];return [(Math.asin(clamp(x/w,-.998,.998))/tau+.5)*c.width,(.337-y)/.359*c.height]}
  function trace(pts,col,width){g.beginPath();pts.forEach(([x,y],i)=>{let v=xy(x,y);i?g.lineTo(...v):g.moveTo(...v)});g.strokeStyle=col;g.lineWidth=width;g.stroke()}
  for(let side of [-1,1]){for(let l=0;l<3;l++){trace([[.088*side,.15-l*.002],[.099*side,.153-l*.004],[.115*side,.158-l*.007]],'rgba(87,62,54,.21)',.9);trace([[side*.04,.136-l*.002],[side*.068,.132-l*.004],[side*.088,.141-l*.002]],'rgba(112,78,61,.16)',1)}
   let browBase=Array.from({length:11},(_,k)=>{let t=k/10;return xy(side*(.025+.081*t),.171+.014*Math.sin(Math.PI*t*.84)+.002*t)});for(let i=0;i<10;i++)line(g,...browBase[i],...browBase[i+1],'rgba(77,58,46,.50)',1+4*Math.sin(Math.PI*(i+1)/12));
   for(let j=0;j<220;j++){let t=rand(),x=side*(.025+.079*t),y=.173+.012*Math.sin(Math.PI*t*.84)+.002*t+(.5-rand())*.011*Math.sin(Math.PI*(.05+.91*t));trace([[x,y],[x+side*(.001+t*.002),y+.0018]],'rgba(46,39,31,.64)',.7+rand()*.32)}}
  for(let l=0;l<2;l++){trace([[-.059,.207+l*.008],[-.032,.211+l*.007],[.004,.208+l*.006],[.039,.21+l*.008],[.057,.208+l*.008]],'rgba(123,86,68,.18)',1)}
  trace([[-.112,.165],[-.103,.156],[-.105,.144],[-.096,.131]],'rgba(211,178,152,.72)',1.2);
  let map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;M.face.map=map;M.face.color.setHex(0xc29579);M.face.roughness=.87}
 function eyeMap(){let c=document.createElement('canvas');c.width=256;c.height=112;let g=c.getContext('2d'),base=g.createLinearGradient(0,0,0,112);base.addColorStop(0,'#8e7e70');base.addColorStop(.54,'#d1c5ac');base.addColorStop(1,'#b7a28e');g.fillStyle=base;g.fillRect(0,0,256,112);g.save();g.translate(121,51);g.scale(1,1.65);let iris=g.createRadialGradient(0,0,2,0,0,36);iris.addColorStop(0,'#181713');iris.addColorStop(.45,'#433325');iris.addColorStop(.8,'#70563a');iris.addColorStop(1,'#292920');g.fillStyle=iris;g.beginPath();g.arc(0,0,36,0,tau);g.fill();for(let i=0;i<69;i++){let a=rand()*tau;line(g,Math.cos(a)*21,Math.sin(a)*21,Math.cos(a+.03)*33,Math.sin(a+.03)*33,'#a3804a55',.75)}circ(g,0,0,16,'#171713');circ(g,-10,-13,4.6,'#dfd9c5');g.restore();let tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex}
 function face(p,M){complexion(M);loft(p,M.skin,[[-.16,.092,.088,0,.024],[-.09,.096,.092,0,.018],[-.035,.084,.08,0,.015],[.024,.088,.083,0,.008]]);
  grid(p,M.face,96,82,(u,v)=>facepoint((u-.5)*tau,mix(-.022,.337,v)),true,(u,v,q)=>{let front=Math.max(0,Math.cos((u-.5)*tau)),a=Math.abs(q.x),y=q.y;let beard=front*clamp((.083-y)*17)*(.33+.55*clamp((a-.03)*11))+.16*bump(a,y,.12,.07,.03,.04);let warm=bump(a,y,.094,.105,.047,.035)*front;return [1-.29*beard,1-.27*beard-.105*warm,1-.22*beard-.12*warm]});
  let eyes=surface(0xb3a895,.01,.55);eyes.envMapIntensity=.3;eyes.map=eyeMap();eyes.side=T.DoubleSide;
  for(let s of [-1,1]){let eyelid=(u,up)=>{let x=s*(.032+.065*u),base=.152+.003*u,sh=Math.sin(Math.PI*u)**.72;return skinAt(x,base+sh*(up?.0090:-.0066),.003)};
   grid(p,eyes,22,7,(u,v)=>{let pt=eyelid(u,false).lerp(eyelid(u,true),v);pt.z-=.0042*Math.sin(u*Math.PI)*Math.sin(v*Math.PI);return pt},s===1);
   for(let up of [false,true]){
    let lid=M.face.clone();lid.vertexColors=false;lid.side=T.DoubleSide;let eyelidMesh=grid(p,lid,22,5,(u,v)=>{let edge=eyelid(u,up),sine=Math.sin(Math.PI*u),x=edge.x+s*(u-.5)*.006*v,y=edge.y+(up?1:-1)*(.001+sine*(up?.012:.009))*v;let off=mix(.003,.0002,v)+.002*sine*Math.sin(Math.PI*v);return skinAt(x,y,off)},s===(up?1:-1));{let at=eyelidMesh.geometry.attributes;for(let i=0;i<at.position.count;i++){let y=at.position.getY(i),x=at.position.getX(i),w=lerpRow(faceRows,y)[1];at.uv.setXY(i,Math.asin(clamp(x/w,-.99,.99))/tau+.5,(y+.022)/.359)}}
    let pts=Array.from({length:9},(_,i)=>eyelid(i/8,up));stroke(p,up?M.ear:M.skin,pts,t=>.0005+.0018*Math.sin(Math.PI*t),16,6);if(up){let l=pts.map(v=>v.clone().add(V(0,-.0009,-.002)));stroke(p,M.hair,l,t=>.0002+.0008*Math.sin(Math.PI*t),16,5);
    stroke(p,M.ear,pts.map((v,i)=>skinAt(v.x,v.y+.006*Math.sin(i*Math.PI/8)+.002,.0008)),t=>.0004+.001*Math.sin(Math.PI*t),16,5)}}
   let brow=t=>skinAt(s*(.025+.084*t),.173+.012*Math.sin(Math.PI*t*.84)+.002*t,.0017);
   for(let j=0;j<55;j++){let t=j/55,q=brow(t);q.y+=(rand()-.5)*.007*Math.sin(Math.PI*(.05+.91*t));stroke(p,j%3?M.hair:M.lock,[q.clone().add(V(0,-.001,0)),q.clone().add(V(s*.002,.0015,-.0005)),q.clone().add(V(s*(.002+.003*t),.004,0))],v=>.0001+.0008*(1-v),4,4)}
   let wingAt=skinAt(s*.024,.105,.0002);let ala=oval(p,M.skin,wingAt.x,wingAt.y,wingAt.z+.0045,.012,.009,.0105);ala.rotation.z=s*.22;
   let nost=skinAt(s*.021,.100,.0004);let inner=oval(p,M.crease,nost.x,nost.y,nost.z-.003,.0058,.0021,.0029);inner.rotation.z=s*.26;
   let ear=oval(p,M.skin,s*.15,.123,.012,.024,.043,.023);ear.rotation.z=-s*.15;
   oval(p,M.ear,s*.169,.126,.007,.008,.026,.013);stroke(p,M.skin,[V(s*.161,.095,.012),V(s*.174,.115,.029),V(s*.176,.150,.024),V(s*.165,.161,.003),V(s*.164,.14,-.006)],.0043,16);
  }
  let mouth=u=>.060+.0016*Math.cos(u*Math.PI*4)+.0012*Math.sin(u*Math.PI)-.004*Math.abs(2*u-1)+.002*u;
  for(let upper of [false,true]){M.lips.side=T.DoubleSide;grid(p,M.lips,32,5,(u,v)=>{let x=.091*(u-.5),s=Math.sin(Math.PI*u),y=mouth(u)+(upper?1:-1)*s*(upper?.0055+.005*Math.sin(2*Math.PI*u)**2:.010)*v;return skinAt(x,y,.002+.0045*s*Math.sin(Math.PI*v))},!upper)}
  stroke(p,M.crease,Array.from({length:9},(_,i)=>skinAt(.091*(i/8-.5),mouth(i/8),.003)),t=>.0003+.0009*Math.sin(Math.PI*t),18,5);

 }
 function hair(p,M){function scalp(a,v,extra=0){let c=Math.cos(a),base=.107+.12*c-.012*Math.cos(3*a)*Math.max(0,c),y=mix(base,.335,v);let q=facepoint(a,y),k=(.011+.0022*Math.sin(a*75+v*21))*(1-.72*v)+extra;return q.add(V(Math.sin(a)*k,.006+v*.009,-Math.cos(a)*k))}
  M.hair.side=T.DoubleSide;grid(p,M.hair,105,34,(u,v)=>scalp((u-.5)*tau,v),true);
  for(let j=0;j<108;j++){let a=(j/108-.5)*tau,b=a>=0?1:-1;let pts=Array.from({length:8},(_,i)=>{let v=i/7*.95;return scalp(a+(.56+.19*Math.cos(a*2))*Math.sin(1.65*v),v,.0015)});stroke(p,j%5===0?M.lock:M.hair,pts,t=>(.0004+.00165*Math.sin(Math.PI*t))*(1-.55*t),13,5)}
  for(let s of [-1,1]){for(let j=0;j<3;j++){stroke(p,M.hair,[scalp(s*(1.12+j*.09),.12),V(s*(.151+j*.002),.159,.002-j*.013),V(s*.149,.112,-.021-j*.015),V(s*.136,.073-j*.008,-.035-j*.012)],t=>.0006+(.006-j*.0009)*(1-t),13,6)}}
  oval(p,M.hair,0,.369,.059,.087,.073,.085);for(let j=0;j<7;j++){let pts=Array.from({length:18},(_,i)=>{let a=i/17*tau*1.28+j*.94;let lat=-.84+.24*j+.42*i/17;return V(.084*Math.cos(lat)*Math.sin(a),.37+.068*Math.sin(lat)+.008*Math.cos(a+j*.4),.061+.084*Math.cos(lat)*Math.cos(a))});stroke(p,j%3?M.hair:M.lock,pts,.009,32,6)}
  let crown=node(p,0,.327,.052);form(crown,M.bronze,[[.08,-.01],[.093,-.003],[.094,.024],[.087,.028]],0,0,0,.94);for(let a of [-1,1]){stroke(crown,M.bright,[V(a*.083,.004,.018),V(a*.096,.04,.003),V(a*.081,.075,-.036),V(a*.062,.044,-.059),V(a*.038,.025,-.076)],t=>.0018+.004*Math.sin(Math.PI*t),14);oval(crown,M.jade,a*.077,.045,-.022,.011,.015,.009)}
  stick(crown,M.bright,V(-.144,.022,.014),V(.151,.047,.009),.0065,.005);oval(crown,M.jade,-.148,.021,.014,.015,.012,.012);batch(crown);
  // Two narrow woven ties fall from the bun behind the neck.
  for(let s of [-1,1]){M.silk.side=T.DoubleSide;grid(p,M.silk,5,17,(u,v)=>V(s*(.055+.043*Math.sin(v*2.1))+(u-.5)*.027,.324-v*(s>0?.275:.235),.109+.044*Math.sin(Math.PI*v)+.016*Math.sin(5*v)+.005*Math.cos(u*6)),false)}
 }
 function mantletex(M){let c=document.createElement('canvas');c.width=c.height=512;let g=c.getContext('2d'),im=g.createImageData(512,512);for(let y=0;y<512;y++)for(let x=0;x<512;x++){let n=(rand()-.5)*9+4*Math.cos(x*1.55)*Math.sin(y*1.55)+5*Math.sin(x*.024+y*.017),p=(x+y*512)*4;im.data.set([58+n,81+n,80+n,255],p)}g.putImageData(im,0,0);
  g.strokeStyle='#a59162';g.lineWidth=4;g.strokeRect(11,11,490,490);g.strokeRect(18,18,476,476);
  for(let x=20;x<494;x+=21){path(g,'M'+x+' 480l10 -8 10 8 -10 8Z',null,'#c4a269',2)}
  g.save();g.translate(176,233);for(let j=0;j<16;j++){g.rotate(tau/16);path(g,'M-3 -49Q-11 -63 3 -77Q-2 -65 5 -57Z','#b79961')}circ(g,0,0,47,null,'#d5b678',5);circ(g,0,0,37,null,'#aa8b58',3);path(g,'M-22 0Q-29 -23 -6 -17L-11 -11Q2 -9 12 -22Q15 -7 2 -1L24 -12Q20 4 6 9L27 4Q14 21 -4 10L-13 23 -11 8 -24 18 -18 3Z','#ceaf70');g.restore();
  for(let [x,y,k] of [[70,337,1],[259,152,.66],[338,360,.78]]){g.save();g.translate(x,y);g.scale(k,k);path(g,'M0 10q22 0 29 -16q10 -18 30 -8q12 7 4 17q-10 9 -16 1q-2 -7 7 -8M16 15q24 -3 37 -8q16 -4 29 3q10 4 28 -3',null,'#ac966a',3);g.restore()}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;let m=M.indigo.clone();m.color.setHex(0xffffff);m.map=t;m.side=T.DoubleSide;return m}
 function torso(chest,pelvis,M){let rows=[[.0,.265,.177,0,.005],[.10,.258,.169,0,.009],[.22,.245,.158,0,.012],[.35,.267,.177,0,.008],[.48,.299,.198,0,.001],[.58,.338,.215,0,-.004],[.652,.351,.198,0,.001],[.686,.326,.168,0,.010],[.715,.232,.142,0,.016],[.772,.113,.091,0,.016]];
  loft(chest,M.cloth,rows,(q,a,v)=>{q.z+=Math.sign(q.z)*.014*Math.sin(a*2)**2*Math.sin(v*Math.PI);return q});
  for(let a of [-1,1]){let o=oval(chest,M.cloth,a*.173,.598,.123,.166,.117,.083);o.rotation.z=a*.28}
  let robeTop=(u,v,s)=>{let x=s*mix(.26-.09*v,.037+.012*v,u),y=.14+v*.58-.09*u,z=-.14-.031*Math.sin(v*Math.PI)+.082*(Math.abs(x)/.32)**2-.01*Math.sin(u*12+v*2);return V(x,y,z)};
  for(let s of [-1,1]){M.silk.side=T.DoubleSide;grid(chest,M.silk,18,18,(u,v)=>robeTop(u,v,s));stroke(chest,M.hem,Array.from({length:8},(_,i)=>robeTop(.97,i/7,s)),.0065,18)}
  const collarProfile=[V(.078,.773,-.069),V(.108,.719,-.13),V(.076,.635,-.215),V(.013,.54,-.248),V(-.093,.421,-.222)];
  for(let side of [-1,1]){let curve=new T.CatmullRomCurve3(collarProfile.map(q=>V(q.x*side,q.y,q.z-(side<0?.014:0))));let lap=(u,v)=>{let q=curve.getPointAt(v);q.x+=side*(u-.5)*.05;q.y+=(u-.5)*.01;q.z-=.003*Math.sin(Math.PI*u);return q};M.linen.side=T.DoubleSide;grid(chest,M.linen,6,24,lap);stroke(chest,M.hem,Array.from({length:13},(_,j)=>lap(.1,j/12)),.003,19,5)}
  // A soft stand collar surrounds the nape; the V notch leaves the throat open.
  grid(chest,M.indigo,48,8,(u,v)=>{let a=(u-.5)*4.64,r=.141-.02*v;return V(r*Math.sin(a),.695+.089*v+.009*Math.cos(a),.018+.90*r*Math.cos(a))});
  // Curved, overlapping scales with copper bindings, not bead-shaped rows.
  for(let row=0;row<6;row++)for(let j=0;j<16;j++){let a=(j+.45*(row%2))*tau/16,y=.162+row*.077,r=lerpRow(rows,y),rx=r[1]+.019,rz=r[2]+.031;let sc=(u,v)=>{let f=(u-.5)*.388*(.92+.08*v),q=a+f,rad=.008*Math.sin(u*Math.PI)+.014*(1-v);return V((rx+rad)*Math.sin(q),y+v*.079-.015*Math.sin(u*Math.PI)*(1-v),(rz+rad)*Math.cos(q)+r[4])};
   grid(chest,M.plate,6,3,sc);for(let s of [.21,.79]){let q=sc(s,.72);oval(chest,M.bronze,q.x,q.y,q.z,.008,.008,.008)}if(row%2===1)stroke(chest,M.bronze,[sc(.07,.14),sc(.47,.13),sc(.93,.14)],.0024,6,4)}
  let poncho=(u,v)=>{let x=mix(-.372,.267,u),top=.702+.026*Math.sin(Math.PI*u),base=.155+.275*u+.13*u*u+.025*Math.sin(u*7),y=mix(base,top,v),r=lerpRow(rows,y),xx=x*(.86+.14*v);
   let depth=Math.sqrt(clamp(1-(xx/(r[1]+.055))**2,.05,1))*(r[2]+.045)+.028+(.013+.012*(1-v))*Math.cos(u*29+v*2);return V(xx,y,depth)};
  grid(chest,mantletex(M),40,26,poncho);for(let v of [.012,.035])stroke(chest,v<.02?M.hem:M.trim,Array.from({length:19},(_,i)=>poncho(i/18,v)),.0045,26);
  // Belt, cloth sash, cast sun clasp, hip-guard and scabbard pouch.
  form(pelvis,M.silk,[[.288,-.045],[.316,-.015],[.318,.038],[.287,.065]],0,0,0,.74);
  form(pelvis,M.leather,[[.305,.023],[.319,.036],[.323,.102],[.305,.125]],0,0,0,.76);
  for(let j=0;j<14;j++){let a=j*tau/14,q=V(.324*Math.sin(a),.077,.246*Math.cos(a));oval(pelvis,M.bronze,q.x,q.y,q.z,.011,.012,.011)}
  let clasp=oval(pelvis,M.bronze,0,.074,-.251,.072,.050,.014);oval(pelvis,M.jade,0,.074,-.267,.039,.034,.008);
  let bag=oval(pelvis,M.leather,.298,-.041,.052,.091,.117,.074);bag.rotation.z=-.11;oval(pelvis,M.trim,.308,.012,.077,.080,.058,.065);oval(pelvis,M.bronze,.357,-.013,.104,.012,.013,.008);
 }
 function panel(p,M,s){let cloth=(u,v,extra=0)=>{let a=(.062+u*2.20)*s,width=.335+.085*(1-v),high=.016,low=-.66-.12*Math.cos(u*tau)+.085*u;let f=(.011+.030*(1-v))*Math.sin(18*u+1.8*v)+.01*Math.sin(u*11-v*3);return V((width+f+extra)*Math.sin(a)-s*.14,mix(low,high,v),(.82*width+f+extra)*Math.cos(a)-.131+.022*(1-v))};
  for(let lining of [true,false]){let m=lining?M.linen:M.silk;m.side=T.DoubleSide;grid(p,m,30,15,(u,v)=>{let q=cloth(u,v,lining?-.011:.001);q.y-=lining?.034:0;return q},s<0)}
  grid(p,M.indigo,30,5,(u,v)=>cloth(u,mix(.044,.125,v),.0035),s<0);
  for(let v of [.04,.12])stroke(p,M.hem,Array.from({length:19},(_,j)=>cloth(j/18,v,.005)),.0038,32,5);
  for(let u of [.01,.99])stroke(p,M.trim,Array.from({length:8},(_,j)=>cloth(u,j/7,.002)),.005,11,5);batch(p)}
 function hand(p,M,s){
  loft(p,M.skin,[[-.106,.042,.029,-s*.005,-.018],[-.079,.058,.033,0,-.016],[-.045,.063,.036,0,-.014],[-.016,.056,.034,0,-.009],[.021,.045,.032,0,0]]);
  oval(p,M.skin,-s*.032,-.040,-.035,.030,.048,.019);
  for(let j=0;j<4;j++){let x=s*(j-1.5)*.026,L=[.105,.113,.106,.083][j],top=-.079+(j===3?.011:0),a=V(x,top,-.016),k=V(x*1.08,top-L*.39,-.032),f=V(x*.98-s*.006,top-L*.58,-.059),tip=V(x*.86-s*.008,top-L*.52,-.080+j*.002);let r=.014-(j===3?.002:0);
   stroke(p,M.skin,[a,k,f,tip],t=>r*(.98+.12*Math.sin(t*3*Math.PI)-.32*t)*(.12+.88*clamp((1-t)*15)),15,8);
   oval(p,M.ear,k.x,k.y,k.z+.006,.010,.005,.005);stroke(p,M.skin,[V(x*.57,.002,.022),V(x*.81,-.046,.022),V(x,-.081,.014)],t=>.0005+.003*Math.sin(t*Math.PI),8,5)}
  stroke(p,M.skin,[V(-s*.043,-.020,-.008),V(-s*.068,-.043,-.031),V(-s*.068,-.061,-.054),V(-s*.041,-.076,-.072)],t=>.020*(1-.40*t)*(.17+.83*clamp((1-t)*14)),16,8);
  if(s>0){let ring=oval(p,M.jade,-s*.064,-.056,-.047,.018,.014,.016);ring.rotation.x=.39}
 }
 function sleeve(top,mid,end,M,s,L1,L2){loft(top,M.cloth,[[-L1,.065,.067,0,0],[-.36,.078,.087,0,-.003],[-.273,.095,.108,0,-.012],[-.16,.113,.115,s*.003,-.009],[-.076,.123,.11,s*.006,.002],[.024,.105,.10,0,0]]);
  let shoulder=(u,v,layer)=>{let a=tau*u,r=.132+.029*Math.sin(Math.PI*v)-.010*layer,cap=(1-Math.cos(Math.PI*v))*.5;return V(s*.015+Math.sin(a)*r*(.64+.36*cap),.058-.134*v-layer*.048-.027*Math.sin(a)*s,(.142-layer*.009)*(.54+.46*cap)*Math.cos(a))};
  for(let k=0;k<3;k++){grid(top,k===0?M.plate:k===1?M.leather:M.plate,28,8,(u,v)=>shoulder(u,v,k),true);stroke(top,M.bronze,Array.from({length:22},(_,j)=>shoulder(j/21,.95,k)),.0045,28,5)}
  for(let j=0;j<5;j++){let a=j*tau/5;oval(top,M.bright,.015*s+.148*Math.sin(a),-.041,.135*Math.cos(a),.009,.009,.009)}
  loft(mid,M.skin,[[-L2,.046,.038,0,0],[-.31,.061,.054,0,-.004],[-.24,.072,.061,s*.002,0],[-.14,.086,.076,s*.006,.005],[-.08,.088,.078,s*.007,.002],[.025,.066,.061,0,0]]);
  let cuff=(u,v)=>{let a=u*tau,r=.064+.033*v,y=mix(-L2+.032,-.108,v)+.031*Math.cos(a)*v;return V(r*Math.sin(a),y,r*.9*Math.cos(a))};
  grid(mid,M.leather,24,12,cuff);for(let v of [.04,.16,.83,.94])stroke(mid,v>.90||v<.06?M.bronze:M.trim,Array.from({length:22},(_,j)=>cuff(j/21,v)),.006,30,5);
  for(let k=0;k<3;k++){let a=s*(.16+k*.074);grid(mid,M.plate,5,8,(u,v)=>{let q=cuff(a+(u-.5)*.066,v*.63+.19);q.x*=1.055;q.z*=1.055;return q})}
  hand(end,M,s)
 }
 function lowerLimb(top,mid,end,M,s,L1,L2){
  loft(top,M.cloth,[[-L1,.076,.081,0,0],[-.56,.095,.097,0,-.006],[-.44,.108,.117,0,-.011],[-.27,.139,.149,s*.005,-.008],[-.14,.154,.152,s*.008,.01],[.014,.139,.133,0,.01]],(q,a,v)=>{let f=.006*Math.sin(5*a+v*9)*Math.sin(Math.PI*v);q.x+=f*Math.sin(a);q.z+=f*Math.cos(a);return q});
  let flap=(u,v,extra=0)=>{let a=(u-.5)*2.58,x=s*.009+(.158+extra+.033*v)*Math.sin(a),bottom=-.54-.086*Math.cos(a)+.02*s*Math.sin(a);
   let z=-(.168+extra+.023*v+.015*Math.cos(u*19+v*2))*Math.cos(a)-.064*(1-v);return V(x,mix(bottom,-.018,v),z)};
  grid(top,M.silk,23,16,flap,true);grid(top,M.indigo,22,4,(u,v)=>flap(u,.04+.087*v,.003),true);
  for(let v of [.035,.123])stroke(top,M.hem,Array.from({length:13},(_,j)=>flap(j/12,v,.005)),.0038,20,5);
  loft(mid,M.dark,[[-L2,.061,.071,0,.004],[-.50,.074,.087,0,.018],[-.32,.093,.113,s*.004,.022],[-.23,.106,.12,s*.009,.019],[-.106,.103,.098,s*.003,.004],[-.01,.08,.077,0,.008]]);
  let guard=(u,v)=>{let a=(u-.5)*2.90,r=mix(.077,.107,v)+.01*Math.sin(Math.PI*v),y=mix(-.52-.037*Math.cos(a),-.068+.052*Math.cos(a),v);return V(r*Math.sin(a),y,-(r+.011)*Math.cos(a)+.009)};
  grid(mid,M.leather,22,18,guard,true);
  for(let u of [.04,.96])stroke(mid,M.trim,Array.from({length:7},(_,j)=>guard(u,j/6)),.0042,15);
  for(let v of [.27,.77]){let y=mix(-.52,-.07,v),r=mix(.078,.108,v)+.010;band(mid,M.trim,y,r,1.12,.012);let q=guard(.7,v);oval(mid,M.bronze,q.x,q.y,q.z,.014,.012,.01)}
  let knee=(u,v)=>{let a=(u-.5)*2.75,r=.117*(.76+.24*Math.sin(v*Math.PI)),y=mix(-.105+.042*Math.abs(u-.5),.074-.04*Math.abs(u-.5),v);return V(r*Math.sin(a),y,-.026-r*.78*Math.cos(a)-.008*Math.sin(v*Math.PI))};
  grid(mid,M.plate,16,9,knee,true);stroke(mid,M.bronze,Array.from({length:11},(_,j)=>knee(j/10,.95)),.0035,14,5);
  // Continuous vamp and leather upper, with a stitched welt instead of stacked toe spheres.
  loft(end,M.leather,[[-.083,.074,.166,0,-.068],[-.065,.086,.181,0,-.071],[-.044,.091,.177,0,-.070],[-.012,.086,.146,0,-.051],[.026,.079,.107,0,-.023],[.069,.069,.079,0,.004],[.11,.068,.071,0,.004]]);
  loft(end,M.dark,[[-.106,.072,.169,0,-.070],[-.099,.087,.187,0,-.070],[-.077,.089,.184,0,-.072],[-.069,.082,.177,0,-.069]]);
  let stitch=Array.from({length:21},(_,j)=>{let a=tau*j/20;return V(.089*Math.sin(a),-.074,-.070+.184*Math.cos(a))});stroke(end,M.trim,stitch,.0035,32,5)
 }
 function feather(p,M,origin,angle,length=.19,width=.041){let material=M.plume;return grid(p,material,7,22,(u,v)=>{let arch=width*Math.pow(Math.sin(Math.PI*v),.68)*(.78+.22*v),d=.010+arch*u-.003*Math.sin(19*v)*u,tw=angle+.22*v;return V(origin.x+Math.cos(tw)*d,origin.y+Math.sin(tw)*d,origin.z-length*v+u*.032*v)},false,(u,v)=>{let bars=Math.cos(v*58+u*5),tip=v>.62&&v<.76?.58:1,shade=(.79+.18*bars+.05*u)*tip;return [shade,shade*(.91+.05*v),shade*(.79+.07*v)]})}
 function arrow(p,M,len){let o=node(p);stick(o,M.wood,V(0,0,.012),V(0,0,-len+.057),.010,.008);let metal=M.plate;metal.side=T.DoubleSide;
  for(let a=0;a<3;a++){let t=a*tau/3;grid(o,metal,2,4,(u,v)=>{let w=.038*(1-v),r=u*w;return V(r*Math.cos(t),r*Math.sin(t),-len+.139*(1-v)+.027*u*(1-v))});feather(o,M,V(0,0,-.014),t)}
  for(let z of [-.023,-.192,-len+.143]){let ring=form(o,M.hem,[[.0103,-.009],[.013,0],[.0108,.009]],0,0,z,1,10);ring.rotation.x=Math.PI/2}batch(o);return o}
 function bowLimb(root,M,s){let pathAt=t=>V(.013*Math.sin(tau*t),s*.9*t,-.151*Math.sin(Math.PI*t)+.11*t**4-.024*Math.sin(t*3*Math.PI));
  M.wood.side=T.DoubleSide;grid(root,M.wood,16,40,(u,t)=>{let a=tau*u,c=pathAt(t),w=.010+.033*(1-t)**.56+.008*Math.sin(t*Math.PI),d=.008+.021*(1-t);return c.add(V(w*Math.cos(a),0,d*Math.sin(a)))},s>0);
  for(let side of [-1,1]){let pts=Array.from({length:11},(_,j)=>{let t=.09+j*.083,c=pathAt(t);return c.add(V(side*(.007+.013*(1-t)),0,-.008-.021*(1-t)))});stroke(root,M.bronze,pts,t=>.0016+.0026*Math.sin(Math.PI*t),23,5)}
  let tip=pathAt(1);oval(root,M.bronze,tip.x,tip.y,tip.z,.015,.024,.017);
  for(let [t0,t1,mat] of [[.015,.16,M.leather],[.67,.77,M.silk],[.82,.987,M.dark]])grid(root,mat,16,9,(u,v)=>{let t=mix(t0,t1,v),a=u*tau,c=pathAt(t),w=.012+.033*(1-t)**.56+.008*Math.sin(t*Math.PI),d=.010+.021*(1-t);return c.add(V(w*Math.cos(a),0,d*Math.sin(a)))},s>0);
  for(let t of [.10,.14,.18,.63,.66,.70,.90]){let c=pathAt(t),w=.011+.033*(1-t)**.56+.008*Math.sin(t*Math.PI);stroke(root,t<.2?M.trim:M.bronze,Array.from({length:15},(_,j)=>{let a=tau*j/14;return c.clone().add(V(w*Math.cos(a),0,(.009+.021*(1-t))*Math.sin(a)))}),.0028,20,5)}
 }
 function bowHandle(p,M){form(p,M.leather,[[.027,-.114],[.037,-.084],[.033,-.028],[.032,.042],[.036,.088],[.028,.116]],0,0,0,.88,18);
  stroke(p,M.trim,Array.from({length:65},(_,i)=>{let t=i/64,a=t*tau*6.6;return V(.034*Math.cos(a),mix(-.091,.091,t),.031*Math.sin(a))}),.0038,78,5);
  for(let s of [-1,1])band(p,M.bronze,s*.101,.034,.92,.006);batch(p)}
 function quiver(chest,M){let p=node(chest,.027,.407,.287);p.rotation.z=-.49;p.rotation.x=.028;
  form(p,M.leather,[[.055,-.39],[.084,-.355],[.10,-.224],[.095,.11],[.102,.294],[.111,.335],[.108,.353]],0,0,0,.91);
  for(let y of [-.346,-.305,.185,.302,.346])band(p,y===.185?M.trim:M.bronze,y,y<0?.084:y>.3?.112:.099,.92,.011);
  for(let s of [-1,1])stroke(p,M.hem,Array.from({length:15},(_,j)=>{let y=-.303+j*.044;return V(s*.039+.002*Math.sin(j*2),y,.083+.006*Math.cos(j*.14))}),.0025,22,5);
  oval(p,M.bronze,0,.017,.089,.056,.064,.012);oval(p,M.indigo,0,.017,.100,.048,.054,.009);oval(p,M.bright,0,.017,.109,.020,.022,.006);
  for(let j=0;j<10;j++){let a=j*tau/10;stick(p,M.bronze,V(Math.cos(a)*.026,.017+Math.sin(a)*.028,.11),V(Math.cos(a)*.039,.017+Math.sin(a)*.043,.104),.0035,.001)}
  for(let i=0;i<6;i++){let a=i*2.4,x=.06*Math.cos(a),z=.055*Math.sin(a),q=node(p,x,.512+.033*(i%3),z);q.rotation.x=Math.PI/2+(i-2.5)*.032;q.rotation.z=Math.cos(a)*.05;stick(q,M.wood,V(0,0,-.025),V(0,0,.287),.008,.007);for(let j=0;j<3;j++){let geom=feather(q,M,V(0,0,.006),j*tau/3+i*.2,.159,.032);geom.scale.z=-1;geom.position.z=-.025}
   // Bake the quiver shafts into the quiver joint as they do not animate independently.
   q.updateMatrix();for(let o of [...q.children]){o.updateMatrix();o.applyMatrix4(q.matrix);p.add(o)}p.remove(q)}
  const path=new T.CatmullRomCurve3([V(-.212,.055,.206),V(-.11,.318,.280),V(.048,.514,.281),V(.197,.693,.165),V(.215,.722,.012),V(.183,.674,-.139),V(.08,.492,-.237),V(-.093,.258,-.208),V(-.218,.072,-.169)]);
  function strap(u,v){let q=path.getPointAt(v);return q.add(V((u-.5)*.075,-(u-.5)*.023,Math.abs(u-.5)*-.007*Math.cos(Math.PI*v)))}
  M.trim.side=T.DoubleSide;grid(chest,M.trim,7,40,strap);
  for(let u of [.12,.88])stroke(chest,M.hem,Array.from({length:17},(_,i)=>strap(u,i/16)),.0024,26,5);batch(p);return p
 }
 return {materials,face,hair,torso,panel,sleeve,lowerLimb,bowLimb,bowHandle,arrow,quiver}
}
