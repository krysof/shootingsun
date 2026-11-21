const vista=(()=>{const out=document.querySelector('#sky'),ctx=out.getContext('2d'),W=2200,H=820;let layers=[],w,h;
function rng(s){return ()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296)}
function canvas(w,h){let c=document.createElement('canvas');c.width=w;c.height=h;return c}
function ridge(j){let c=canvas(W,H),g=c.getContext('2d'),r=rng(7541+j),base=[.48,.61,.74][j]*H,amp=[.19,.21,.19][j]*H,col=['#ad8580','#816b70','#585963'][j];
 const peaks=[];for(let x=-140;x<W+200;x+=58+r()*84)peaks.push({x,high:amp*(.25+r()),width:85+r()*130});
 function top(x){let n=0;for(let p of peaks)n=Math.max(n,p.high*Math.max(0,1-Math.abs(x-p.x)/p.width));return base-n+9*Math.sin(x*.014+j)+5*Math.sin(x*.083)+2*Math.sin(.3*x)}
 g.fillStyle=col;g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=2)g.lineTo(x,top(x));g.lineTo(W,H);g.fill();
 for(let i=0;i<2600;i++){let x=r()*W,y=top(x)+r()**2*120,l=4+r()*29;g.strokeStyle=r()<.5?'rgba(238,195,160,.15)':'rgba(43,44,54,.13)';g.lineWidth=.5+r();g.beginPath();g.moveTo(x,y);g.lineTo(x-3,y+l*.4);g.lineTo(x-l*.43,y+l);g.stroke()}
 function pine(x,y,s){g.fillStyle=col;g.fillRect(x-1,y-s,2,s);for(let t=0;t<3;t++){let q=y-s+t*s*.19,a=s*(.13+t*.045);g.beginPath();g.moveTo(x,q-4);g.lineTo(x+a,q+s*.32);g.lineTo(x-a,q+s*.28);g.fill()}}
 if(j>0)for(let i=0;i<430;i++){let x=r()*W;pine(x,top(x)+2,3+r()*(j+1)*4)}
 if(j===1)for(let x of [270,1240,1940]){let y=top(x);g.fillStyle=col;for(let k=0;k<3;k++){let a=16-k*3;g.fillRect(x-a*.5,y-7,a,8);g.beginPath();g.moveTo(x-a,y-6);g.quadraticCurveTo(x-4,y-7,x,y-15);g.quadraticCurveTo(x+6,y-7,x+a,y-7);g.lineTo(x+a*.55,y-4);g.lineTo(x-a*.55,y-4);g.fill();y-=10}}
 let mist=g.createLinearGradient(0,base-32,0,base+60);mist.addColorStop(0,'#f7c39800');mist.addColorStop(1,j===2?'#a78d7888':'#efbd9fbb');g.fillStyle=mist;g.fillRect(0,base-32,W,H-base+32);return c}
const sky=canvas(1400,H),g=sky.getContext('2d'),r=rng(124);let grad=g.createLinearGradient(0,0,0,H);for(let [t,c] of [[0,'#434757'],[.24,'#966f72'],[.47,'#e6a783'],[.64,'#f8ca98'],[1,'#918186']])grad.addColorStop(t,c);g.fillStyle=grad;g.fillRect(0,0,1400,H);
for(let i=0;i<330;i++){let x=r()*1400,y=r()*460,l=10+r()**2*160;g.strokeStyle='rgba(255,204,168,'+(.03+r()*.10)+')';g.lineWidth=1+r()*2;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+l*.5,y+2,x+l*.65,y-4,x+l,y-2);g.stroke()}
for(let i=0;i<33000;i++){g.fillStyle=r()<.5?'#2b1d2c0a':'#ffdfbf0a';g.fillRect(r()*1400,r()*H,1,1)}
layers=[ridge(0),ridge(1),ridge(2)];
function resize(){w=out.width=innerWidth;h=out.height=innerHeight}
function draw(x,t){if(w!==innerWidth||h!==innerHeight)resize();ctx.drawImage(sky,0,0,w,h);
 let sx=w*.72-x*1.1,sy=h*.245,rad=Math.min(w,h)*.095;let halo=ctx.createRadialGradient(sx,sy,rad*.3,sx,sy,rad*2.6);halo.addColorStop(0,'#ffdb9eae');halo.addColorStop(1,'#ffc79500');ctx.fillStyle=halo;ctx.fillRect(sx-rad*3,sy-rad*3,rad*6,rad*6);ctx.fillStyle='#ffe5ae';ctx.beginPath();ctx.arc(sx,sy,rad,0,7);ctx.fill();
 for(let j=0;j<3;j++){let span=Math.min(W-450,Math.max(900,w/h*H)),off=60+j*55+Math.max(0,x)*(j+1)*1.05;ctx.drawImage(layers[j],Math.min(W-span,off),0,span,H,0,0,w,h)}
 for(let i=0;i<24;i++){let xx=((i*.347+t*.007)%1)*w,yy=((i*.213-t*.011)%1+1)%1*h;ctx.fillStyle=i%3?'#ffce9c75':'#fff0bb8c';ctx.fillRect(xx,yy,1.5,1.5)}}
return draw})();
