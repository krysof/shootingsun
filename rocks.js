/* Rendering and collision share the same clipped, convex pieces of bedrock. */
const rockField=(()=>{
 const T=THREE, v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z), cell=16, grid=new Map();
 function shape(random){
  const planes=[],pts=[],tri=[],norm=[],tint=[];
  function plane(x,y,z,h){planes.push(new T.Plane(v(x,y,z).normalize(),-h))}
  const lean=random()*.4-.2;
  plane(lean,1,random()*.24-.12,.75+random()*.18);plane(0,-1,0,.86);
  for(let i=0;i<8;i++){const a=(i+random()*.34)*Math.PI/4,x=Math.cos(a),z=Math.sin(a);
   plane(x,random()*.24-.14,z,.76+random()*.24);
   plane(x,.72+random()*.8,z,.86+random()*.19);
   if(i%2===0)plane(x,-.82,z,.9)}
  // Intersect triplets of planes. Each coplanar polygon is a chipped facet.
  for(let i=0;i<planes.length;i++)for(let j=0;j<i;j++)for(let k=0;k<j;k++){
   const [a,b,c]=[planes[i],planes[j],planes[k]],bc=v().crossVectors(b.normal,c.normal),det=a.normal.dot(bc);if(Math.abs(det)<1e-6)continue;
   const p=bc.multiplyScalar(-a.constant).addScaledVector(v().crossVectors(c.normal,a.normal),-b.constant).addScaledVector(v().crossVectors(a.normal,b.normal),-c.constant).divideScalar(det);
   if(planes.every(f=>f.distanceToPoint(p)<.00001)&&!pts.some(q=>q.distanceToSquared(p)<1e-12))pts.push(p)}
  for(let f of planes){const n=f.normal,face=pts.filter(p=>Math.abs(f.distanceToPoint(p))<.00001);if(face.length<3)continue;
   const mid=face.reduce((s,p)=>s.add(p),v()).divideScalar(face.length),u=face[0].clone().sub(mid).normalize(),w=v().crossVectors(n,u);
   const angle=p=>{let d=p.clone().sub(mid);return Math.atan2(w.dot(d),u.dot(d))};face.sort((a,b)=>angle(a)-angle(b));
   const value=.74+random()*.26;
   for(let j=1;j<face.length-1;j++)for(let p of [face[0],face[j],face[j+1]]){tri.push(p.x,p.y,p.z);norm.push(n.x,n.y,n.z);tint.push(value,value,value)}}
  let g=new T.BufferGeometry();for(let [name,arr] of [['position',tri],['normal',norm],['color',tint]])g.setAttribute(name,new T.Float32BufferAttribute(arr,3));return {g,pts,planes};
 }
 function material(){
  const m=new T.MeshStandardMaterial({vertexColors:true,roughness:.94});
  m.onBeforeCompile=s=>{
   s.vertexShader='varying vec3 rockP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nrockP=(instanceMatrix*vec4(position,1.)).xyz;');
   s.fragmentShader=`varying vec3 rockP;
    float grain(vec3 i){i=fract(i*.1031);i+=dot(i,i.yzx+33.33);return fract((i.x+i.y)*i.z);}
    float noiseR(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec2 e=vec2(0.,1.);
     return mix(mix(mix(grain(i),grain(i+e.yxx),f.x),mix(grain(i+e.xyx),grain(i+e.yyx),f.x),f.y),
      mix(mix(grain(i+e.xxy),grain(i+e.yxy),f.x),mix(grain(i+e.xyy),grain(i+1.),f.x),f.y),f.z);}
    `+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
     float n=noiseR(rockP*.88),v=rockP.y*2.2+rockP.x*.37-rockP.z*.18+n*1.45;
     float band=abs(fract(v)-.5),aa=max(.012,fwidth(v));float vein=1.-smoothstep(.016,.035+aa,band);
     float closeDetail=1.-smoothstep(.04,.32,aa);float grit=noiseR(rockP*14.);
     diffuseColor.rgb*=.79+.29*n+.08*sin(v*6.283)*closeDetail+.18*(grit-.5)*closeDetail;
     diffuseColor.rgb+=vec3(.073,.064,.053)*vein*closeDetail;`)};return m;
 }
 const key=(i,j)=>i*65536+j;
 function cells(x,z,X,Z,cb){for(let i=Math.floor(x/cell);i<=Math.floor(X/cell);i++)for(let j=Math.floor(z/cell);j<=Math.floor(Z/cell);j++)cb(key(i,j))}
 function register(form,M){const pts=form.pts.map(p=>p.clone().applyMatrix4(M)),box=new T.Box3().setFromPoints(pts);
  const planes=form.planes.map(f=>f.clone().applyMatrix4(M));
  // Add vertical supporting planes of the footprint (needed for a rounded player at bevels).
  const sorted=pts.slice().sort((a,b)=>a.x-b.x||a.z-b.z),turn=(a,b,c)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
  const chain=list=>{const h=[];for(let p of list){while(h.length>=2&&turn(h.at(-2),h.at(-1),p)<=1e-9)h.pop();h.push(p)}h.pop();return h};
  const hull=chain(sorted).concat(chain(sorted.reverse())),walls=planes.slice();
  for(let i=0;i<hull.length;i++){let a=hull[i],b=hull[(i+1)%hull.length],n=v(b.z-a.z,0,a.x-b.x).normalize();walls.push(new T.Plane().setFromNormalAndCoplanarPoint(n,a))}
  const r={box,planes,walls};cells(box.min.x,box.min.z,box.max.x,box.max.z,k=>{if(!grid.has(k))grid.set(k,[]);grid.get(k).push(r)})
 }
 function build(items){
  const rand=seed(58749),forms=Array.from({length:8},()=>shape(rand)),batches=forms.map(()=>[]),mat=material(),o=new T.Object3D();
  function place(x,y,z,sx,sy,sz,angle){if(centers.some(([cx,cz])=>Math.hypot(x-cx,z-cz-17)<Math.max(sx,sz)*1.2+2.6))return;
   let id=Math.floor(rand()*forms.length);o.position.set(x,y,z);o.rotation.set(0,angle,0);o.scale.set(sx,sy,sz);o.updateMatrix();let M=o.matrix.clone();register(forms[id],M);
   const c=new T.Color([0x897b6e,0x939a9f,0x77878a,0x939088,0x747776][nearest(x,z)]).multiplyScalar(.8+rand()*.28);batches[id].push([M,c])}
  for(let i=0;i<20;i++){let a=i*2.4,x=Math.cos(a)*(48+i*3),z=Math.sin(a)*(60+i*3)-85;items.push([x,height(x,z)-1,z,3+i%3,3+i%5,4+i%3,a])}
  for(let [x,y,z,sx,sy,sz,a] of items){place(x,y,z,sx,sy,sz,a);
   if(rand()<.47){const count=1+Math.floor(rand()*3);for(let j=0;j<count;j++){
    let b=rand()*Math.PI*2,k=.21+rand()*.30,xx=x+Math.cos(b)*sx*.94,zz=z+Math.sin(b)*sz*1.08;
    place(xx,height(xx,zz)-sy*k*.12,zz,sx*k,sy*k,sz*k,b)} }}
  batches.forEach((batch,i)=>{const mesh=new T.InstancedMesh(forms[i].g,mat,batch.length);mesh.name='Bedrock '+i;batch.forEach(([M,c],j)=>{mesh.setMatrixAt(j,M);mesh.setColorAt(j,c)});mesh.castShadow=mesh.receiveShadow=true;S.add(mesh)})
 }
 function resolve(p){const radius=.34,feet=height(p.x,p.z)+.075,top=feet+1.7;
  cells(p.x-radius,p.z-radius,p.x+radius,p.z+radius,k=>{for(const r of grid.get(k)||[]){
   if(feet>=r.box.max.y||top<=r.box.min.y)continue;let best=Infinity,push=null;
   for(let f of r.walls){let n=f.normal,h=Math.hypot(n.x,n.z),dist=n.x*p.x+n.z*p.z+n.y*(n.y>=0?feet:top)+f.constant,depth=radius*h-dist;
    if(depth<=0){push=null;break}if(h>1e-5&&depth/h<best){best=depth/h;push=n}}
   if(push){let d=(best+.0001)/Math.hypot(push.x,push.z);p.x+=push.x*d;p.z+=push.z*d}
  }})
 }
 function move(p,dir,len){if(!len||!dir.lengthSq())return;const n=Math.ceil(len/.18);for(let i=0;i<n;i++){p.addScaledVector(dir,len/n);resolve(p)}}
 // Clip the segment to each convex piece; choose the first entry, including starts inside.
 function first(a,b){let best=Infinity,dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
  cells(Math.min(a.x,b.x),Math.min(a.z,b.z),Math.max(a.x,b.x),Math.max(a.z,b.z),k=>{for(let r of grid.get(k)||[]){
   if(Math.min(a.y,b.y)>r.box.max.y||Math.max(a.y,b.y)<r.box.min.y)continue;
   let lo=0,hi=Math.min(1,best);for(let f of r.planes){let d=f.distanceToPoint(a),n=f.normal,s=n.x*dx+n.y*dy+n.z*dz;
    if(Math.abs(s)<1e-8){if(d>0){hi=-1;break}}else if(s<0)lo=Math.max(lo,-d/s);else hi=Math.min(hi,-d/s);if(lo>hi)break}
   if(lo<=hi)best=Math.min(best,lo)
  }});return best}
 return {build,move,first}
})();
