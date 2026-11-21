/* The reticle never moves. A bounded off-axis lens handles small corrections;
   only motion which overflows the lens rotates the third-person camera boom. */
const mouseSight=(()=>{
  const {Vector3,Vector2,Sphere,Raycaster,MathUtils}=THREE;
  const rc=new Raycaster(),sweep=new Raycaster(),screen=new Vector2(0,0),sphere=new Sphere();
  const point=new Vector3(),scratch=new Vector3(),camPos=new Vector3(),facing=new Vector3();
  const spanX=.145,spanY=.105,far=150;
  let x=0,y=0,hover=null,snapCamera=true,lastLock=null,turning=false,lastMove=-Infinity;
  function active(){return typeof mode!=='undefined'&&mode==='play'&&!paused&&!dead&&!dlg.open}
  function reset(){x=y=0;turning=false;lastMove=-Infinity;yaw=0;pitch=.115;hover=null;snapCamera=true}
  function move(dx,dy){
    if(!Number.isFinite(dx)||!Number.isFinite(dy)||(!dx&&!dy))return;
    const gain=aim?.00165:.00225,nx=x+dx*gain,ny=y+dy*gain;
    const now=performance.now(),radius=Math.hypot(nx/spanX,ny/spanY);
    if(now-lastMove>115||(dx*x+dy*y)<0)turning=false;
    lastMove=now;
    if(turning||radius>1){
      // Transfer the lens offset into the orbit during the sweep, never after the mouse stops.
      const k=Math.max(1,radius);
      if(!turning){x=nx/k;y=ny/k}
      const length=Math.hypot(x,y);
      const transfer=turning?gain*Math.hypot(dx,dy):Math.hypot(nx-x,ny-y);
      const keep=length?Math.max(0,1-transfer/length):0;
      x*=keep;y*=keep;turning=true;
    }else{x=nx;y=ny}
    yaw-=(nx-x)/Math.max(.45,Math.cos(pitch));
    pitch=MathUtils.clamp(pitch-(ny-y),-.76,1.03);
  }
  function adjustLens(){
    const w=R.domElement.clientWidth||innerWidth,h=R.domElement.clientHeight||innerHeight;
    const pixelsPerTangent=h/(2*Math.tan(MathUtils.degToRad(C.fov)*.5));
    const ox=Math.tan(x)*pixelsPerTangent,oy=Math.tan(y)*pixelsPerTangent;
    const old=C.view;
    if(!old||old.offsetX!==ox||old.offsetY!==oy||old.fullWidth!==w||old.fullHeight!==h)C.setViewOffset(w,h,ox,oy,w,h);
  }
  function groundRange(ray,max){
    // Bracket & bisect the first ground crossing, not a distant point behind a hill.
    let prev=0;for(let t=.2;t<=max;t=Math.min(max,t+Math.min(2.4,.35+t*.055))){
      ray.at(t,scratch);if(scratch.y<=height(scratch.x,scratch.z)){
        let a=prev,b=t;for(let i=0;i<8;i++){let m=(a+b)/2;ray.at(m,scratch);if(scratch.y>height(scratch.x,scratch.z))a=m;else b=m}return b
      }if(t===max)break;prev=t
    }return max
  }
  function featherHit(caster,bound){if(!enemy?.visible||caster.ray.distanceSqToPoint(enemy.position)>(10*enemy.scale.x)**2)return null;
    if(caster.ray.origin.distanceTo(enemy.position)>bound+10*enemy.scale.x)return null;
    caster.far=bound;enemy.updateWorldMatrix(true,true);const hits=caster.intersectObject(enemy,true);return hits.length?hits[0]:null
  }
  function resolve(){
    C.updateMatrixWorld();rc.setFromCamera(screen,C);
    let depth=groundRange(rc.ray,far);let wall=rockField.first(rc.ray.origin,rc.ray.at(depth,scratch));if(Number.isFinite(wall))depth*=wall;hover=null;
    for(const o of [enemy,...critters]){if(!o?.visible)continue;
      sphere.center.copy(o.position);sphere.radius=o===enemy?3.1:.98;
      if(rc.ray.intersectSphere(sphere,scratch)){let d=rc.ray.origin.distanceTo(scratch);if(d<depth){depth=d;hover=o}}
    }
    // A feather on the reticle is also hittable outside the original body volume.
    let wing=featherHit(rc,depth);if(wing){depth=wing.distance;hover=enemy}
    rc.ray.at(depth,point);
  }
  function alongWing(start,end){let len=start.distanceTo(end);if(len<.001)return false;
    sweep.set(start,scratch.subVectors(end,start).multiplyScalar(1/len));return !!featherHit(sweep,len)
  }
  function frame(dt,forward,right){
    let boom=aim?3.45:5.85,shoulder=aim?1.38:1.65;
    camPos.copy(pos()).addScaledVector(forward,-boom*Math.cos(pitch)).addScaledVector(right,shoulder);
    camPos.y+=(aim?2.12:2.30)-boom*Math.sin(pitch);
    camPos.y=Math.max(camPos.y,height(camPos.x,camPos.z)+.80);
    if(stagger>0&&slow>0)camPos.lerp(bossPos,.2);
    C.position.lerp(camPos,snapCamera?1:1-Math.exp(-dt*15));snapCamera=false;
    shake=Math.max(0,shake-dt*1.6);C.position.x+=Math.sin(realT*67)*shake*.22;
    const pivot=scratch.copy(pos());pivot.y+=1.35;const wall=rockField.first(pivot,C.position);
    if(Number.isFinite(wall))C.position.lerpVectors(pivot,C.position,Math.max(0,wall-.20/Math.max(.20,pivot.distanceTo(C.position))));
    C.rotation.set(pitch,yaw,0,'YXZ');adjustLens();resolve();
    facing.copy(point).sub(pos());const bodyYaw=Math.atan2(-facing.x,-facing.z);
    const d=Math.atan2(Math.sin(bodyYaw-hero.rotation.y),Math.cos(bodyYaw-hero.rotation.y));
    hero.rotation.set(0,hero.rotation.y+d*(1-Math.exp(-dt*22)),0);
  }
  function grab(){if(!active()||document.pointerLockElement||!R?.domElement.requestPointerLock)return;
    try{R.domElement.requestPointerLock()?.catch?.(()=>{})}catch{/* hovering over the canvas still works */}}
  window.addEventListener('mousemove',e=>{if(active()&&(document.pointerLockElement===R.domElement||e.target===R.domElement))move(e.movementX,e.movementY)});
  document.addEventListener('pointerlockchange',()=>{let current=document.pointerLockElement;
    if(lastLock&&!current&&active())pauseGame();lastLock=current});
  return {frame,reset,grab,release(){lastLock=null;document.exitPointerLock?.()},alongWing,get point(){return point},get hovered(){return hover}};
})();
