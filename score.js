/* Original procedural score. All times below are scheduled on the Web Audio clock. */
const orchestra=(()=>{
  const hz=n=>440*Math.pow(2,(n-69)/12);
  const range=(x,a,b)=>Math.min(b,Math.max(a,x));
  let ctx,master,hall,noise,strings,horns,route,previous='',next=0,tick=0,timer=0,lastPanel=-1;
  const vowels=new Map();
  const changes={
    dawn:[0,5,3,7,0,8,5,7], journey:[0,3,5,7,8,5,3,7],
    plea:[5,8,3,7,0,5,7,0], hero:[0,8,5,7,0,3,7,0],
    field:[0,5,3,7,8,3,5,7,0,3,8,5], battle:[0,0,8,7,5,3,8,7,0,3,5,7,8,5,7,7],
    fury:[0,1,0,7,8,5,1,7,0,8,3,5,1,8,7,7], rest:[0,3,8,5,0,5,7,0]
  };
  // Semitone motifs with written rests, ties and answering phrases (16th-note grid).
  const calls=[
    [[0,0,5],[6,3,2],[9,5,2],[12,7,4]],
    [[0,12,6],[8,10,3],[12,7,4]],
    [[2,7,3],[6,5,2],[9,3,3],[14,0,2]],
    [[0,5,7],[9,3,2],[12,0,4]],
    [[0,0,3],[4,7,3],[8,12,5],[14,10,2]],
    [[0,7,6],[8,3,3],[12,5,4]],
    [[1,10,3],[5,7,4],[10,5,2],[13,3,3]],
    [[0,3,5],[6,5,2],[8,0,8]]
  ];
  function wave(parts){let r=new Float32Array(parts.length+1),i=new Float32Array(r.length);i.set(parts,1);return ctx.createPeriodicWave(r,i)}
  function init(c){if(ctx)return;ctx=c;master=c.createGain();master.gain.value=.72;
    const limiter=c.createDynamicsCompressor();limiter.threshold.value=-16;limiter.knee.value=13;limiter.ratio.value=4;limiter.attack.value=.009;limiter.release.value=.19;
    master.connect(limiter).connect(c.destination);
    hall=c.createConvolver();let len=Math.floor(c.sampleRate*1.65),ir=c.createBuffer(2,len,c.sampleRate);
    for(let ch=0;ch<2;ch++){let a=ir.getChannelData(ch);for(let j=0;j<len;j++){let t=j/c.sampleRate;a[j]=(Math.random()*2-1)*Math.exp(-4.1*t)*(t<.023?0:1)}}
    hall.buffer=ir;const wet=c.createGain();wet.gain.value=.23;hall.connect(wet).connect(master);
    noise=c.createBuffer(1,c.sampleRate,c.sampleRate);let n=noise.getChannelData(0);for(let j=0;j<n.length;j++)n[j]=Math.random()*2-1;
    strings=wave(Array.from({length:24},(_,k)=>(k%2?-.85:1)/(k+1)**1.18));
    horns=wave([1,.78,.56,.43,.25,.17,.11,.05,.03]);timer=setInterval(pump,55);
  }
  function routeFor(key){if(route){let old=route,t=ctx.currentTime;old.gain.cancelScheduledValues(t);old.gain.setTargetAtTime(0,t,.055);setTimeout(()=>old.disconnect(),450)}
    route=ctx.createGain();route.gain.value=1;route.connect(master);route.connect(hall);previous=key;tick=0;next=ctx.currentTime+.045;lastPanel=-1}
  function voice(t,p,d,vol,pan=0,attack=.012){
    const env=ctx.createGain(),pos=ctx.createStereoPanner();pos.pan.value=pan;env.connect(pos).connect(route);
    env.gain.setValueAtTime(.00001,t);env.gain.exponentialRampToValueAtTime(vol,t+Math.min(attack,d*.4));
    env.gain.exponentialRampToValueAtTime(vol*.69,t+d*.72);env.gain.exponentialRampToValueAtTime(.00001,t+d);
    let nodes=[env,pos],osc=[];
    function add(type,f,det=0,dest=env){let o=ctx.createOscillator();if(typeof type==='string')o.type=type;else o.setPeriodicWave(type);o.frequency.value=f;o.detune.value=det;o.connect(dest);osc.push(o);return o}
    function filter(freq,q=.65,type='lowpass'){let b=ctx.createBiquadFilter();b.type=type;b.frequency.value=freq;b.Q.value=q;b.connect(env);nodes.push(b);return b}
    function finish(){let remaining=osc.length;for(let o of osc){o.onended=()=>{o.disconnect();if(--remaining===0)nodes.forEach(n=>n.disconnect())};o.start(t);o.stop(t+d+.025)}}
    return {env,add,filter,finish,nodes,osc,f:hz(p)};
  }
  function bow(t,n,d,v,pan){let q=voice(t,n,d,v,pan,Math.min(.24,d*.22)),b=q.filter(Math.min(3600,720+q.f*4));
    let a=q.add(strings,q.f,-5,b),c=q.add(strings,q.f,6,b),l=q.add('sine',4.65+Math.abs(pan),0),vib=ctx.createGain();l.disconnect();vib.gain.value=d>.48?6:1;l.connect(vib);vib.connect(a.detune);vib.connect(c.detune);q.nodes.push(vib);q.finish()}
  function choirWave(n,bright){const key=n+':'+bright;if(vowels.has(key))return vowels.get(key);
    let f=hz(n),F=bright?[[790,115,1],[1150,145,.75],[2650,235,.24]]:[[440,85,1],[840,105,.56],[2350,200,.21]];
    let w=wave(Array.from({length:42},(_,i)=>{let h=(i+1)*f;return (.18+F.reduce((s,[fc,bw,g])=>s+g*3.1*Math.exp(-.5*((h-fc)/bw)**2),0))/(i+1)**.85}));vowels.set(key,w);return w}
  function choir(t,n,d,bright,v,pan){let q=voice(t,n,d,v,pan,.52);let w=choirWave(n,bright);q.add(w,q.f,-8);q.add(w,q.f,6);q.finish()}
  function horn(t,n,d,v,pan){let q=voice(t,n,d,v,pan,.07);let b=q.filter(640);b.frequency.setTargetAtTime(1750,t,.12);q.add(horns,q.f,-3,b);q.add('triangle',q.f,4,b);q.finish()}
  function zither(t,n,d,v,pan){let q=voice(t,n,d,v,pan,.005);let b=q.filter(3700);b.frequency.exponentialRampToValueAtTime(480,t+d);let a=q.add('sawtooth',q.f,0,b);a.detune.setValueAtTime(12,t);a.detune.exponentialRampToValueAtTime(1,t+.04);q.add('triangle',q.f*2,3,b);q.finish()}
  function breath(t,d,vol,fc,pan){let q=voice(t,50,d,vol,pan,.003),b=q.filter(fc,.8,'bandpass'),s=ctx.createBufferSource();s.buffer=noise;s.loop=true;s.connect(b);q.osc.push(s);q.finish()}
  function drum(t,large,strength,pan){let f=large?55:104,d=large?.72:.32,q=voice(t,40,d,.23*strength,pan,.006),o=q.add('sine',f);
    o.frequency.setValueAtTime(f*2.25,t);o.frequency.exponentialRampToValueAtTime(f,t+.08);o.frequency.exponentialRampToValueAtTime(f*.74,t+d);
    let shell=q.add('triangle',f*1.49,0,q.filter(large?155:300));shell.frequency.setTargetAtTime(f*1.18,t,.09);q.finish();breath(t,.055,strength*.095,large?720:1380,pan)}
  function gong(t,n,v){[1,1.49,2.12,2.74,3.9,5.17].forEach((r,i)=>{let q=voice(t,n,2.6-i*.29,v/(1+i*.8),(i%3-1)*.25,.016);q.add('sine',q.f*r);q.finish()})}
  function state(){if(mode==='story'){return ending?'rest':storyIndex<=2?'dawn':storyIndex<=10?'journey':storyIndex<=13?'plea':'hero'}
    if(mode==='play'&&combat&&!dead&&enemy?.visible)return bhp<=bmax*.5?'fury':'battle';return mode==='play'?'field':'rest'}
  function panelAccent(t){if(lastPanel===storyIndex)return;lastPanel=storyIndex;
    if([4,6,8,10].includes(storyIndex)){drum(t,false,.96,-.22);drum(t+.10,true,.72,.12);breath(t,.18,.08,2800,.3)}
    if([0,11,13,14].includes(storyIndex)){gong(t,storyIndex===11?38:45,.085);drum(t,true,.9,0)}}
  function write(t,s,key){
    let fight=key==='battle'||key==='fury',hard=key==='fury',field=key==='field'||key==='rest',majestic=key==='hero'||key==='plea'||key==='dawn',journey=key==='journey';
    let bpm=({dawn:88,journey:106,plea:84,hero:98,field:72,rest:67,battle:110,fury:137})[key]+(fight?kills%3*3:0),u=60/bpm/4;
    const bar=Math.floor(s/16),k=s%16,phrase=Math.floor(bar/4),part=phrase%4;
    let progression=changes[key],shift=fight?(kills%3-1)*2:0,root=38+shift+progression[(bar+Math.floor(bar/progression.length)*3)%progression.length];
    let minor=[0,5,7].includes(progression[bar%progression.length]),third=minor?3:4;
    let lift=majestic||hard||part===2||fight&&kills===8,wide=key==='hero'||fight&&kills===8;
    if(k===0){
      bow(t,root,15.9*u,field?.032:.063,-.29);
      bow(t+.021,root+7,14.8*u,field?.021:.042,.33);
      if(!field||part===2){choir(t,root+12,16.8*u,lift,.045,-.45);choir(t+.045,root+12+third,16.6*u,lift,.032,.42);
        if(lift)choir(t+.075,root+19,16*u,true,.025,.19)}
      if(wide||(!field&&bar%4===0)){horn(t,root+7,6.7*u,.072,-.13);if(wide)horn(t+.018,root+12,7*u,.041,.25)}
      if(fight&&(bar%8===0||hard&&bar%4===2))gong(t,root,.078);
    }
    let rhythm=hard?[0,3,6,8,10,13]:fight?(part%2?[0,3,8,11,14]:[0,6,8,12]):majestic?[0,8,14]:journey?[0,10]:[0];
    if(rhythm.includes(k)&&(!field||bar%4===0))drum(t,k===0||k===8,k===0?.94:field?.27:k===8?.76:.51,(k%3-1)*.22);
    if((fight||majestic)&&bar%4===3&&k>=12&&(hard||k%2===0))drum(t+.012,false,.28+(k-12)*.11,(k-13)*.18);
    if(fight&&(k===2||k===10||hard&&k%4===3))breath(t,.09,.052,4700,.52);
    if(!field&&k%(hard?2:4)===0){const ost=[0,7,12,7,third,7,12,10];bow(t,root+12+ost[(k/2+bar)%8],u*(hard?1.65:2.5),hard?.052:.034,k%4?.46:-.48)}
    if((field||journey||part===1)&&[0,3,7,10,14].includes(k)){let a=[0,7,12,12+third,19];zither(t,root+12+a[([0,3,7,10,14].indexOf(k)+bar)%5],.61,field?.058:.041,k%2?.32:-.32)}
    let melody=calls[(bar+2*(phrase%3)+(fight?kills%4:0))%calls.length];
    for(let [when,step,len] of melody)if(k===when){
      let n=root+24+step+(part===2&&k>8?12:0);if(fight||majestic){(k===0||wide?horn:bow)(t,n,len*u*1.03,.065,.12)}
      else zither(t,n,len*u+.18,.068,-.06);
    }
    if((part===1||part===3)&&[5,12].includes(k))bow(t,root+19+(k===12?third:0),3.4*u,.044,.56);
    return u;
  }
  function pump(){if(!ctx)return;let quiet=mute||paused||document.hidden;if(quiet){if(previous!=='silent'){master.gain.setTargetAtTime(0,ctx.currentTime,.024);routeFor('silent')}return}if(previous==='silent')master.gain.setTargetAtTime(.72,ctx.currentTime,.065);
    if(ctx.state!=='running')return;const key=state();if(key!==previous)routeFor(key);
    if(mode==='story'&&!ending)panelAccent(ctx.currentTime+.025);
    if(next<ctx.currentTime-.04)next=ctx.currentTime+.018;
    while(next<ctx.currentTime+.27){next+=write(next,tick++,key)}
  }
  return {init,pump};
})();
