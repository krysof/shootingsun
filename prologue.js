/* Each destination has its own action shot and its own reaction shot. */
const boards=[
 ['红旗下的愿望','我有一个美丽的愿望，长大以后能播种太阳。',4600],
 ['河边 · 春种','播种一个，一个就够了。',3200],
 ['一筐太阳','会结出许多的许多的太阳……',3600],
 ['南极 · 播种','他先到南极，在企鹅家门口种下一颗太阳。',3300],
 ['南极 · 企鹅抗议','企鹅脚下的冰裂了。',2900],
 ['北冰洋 · 播种','他又划到北冰洋，把第二颗太阳埋进浮冰。',3300],
 ['北冰洋 · 北极熊抗议','北极熊的冰床，转眼只剩一小块。',2900],
 ['冬日雪村 · 挂日','他爬上枝头，把一颗太阳挂进冬天。',3300],
 ['冬日雪村 · 雪人抗议','雪人还想挥拳，手臂先掉进了水里。',3300],
 ['永夜小镇 · 挂日','最后，他把一颗太阳挂在街口，想给黑夜点盏灯。',3500],
 ['永夜小镇 · 居民抗议','全镇的窗都开了。没有一个人睡得着。',3100],
 ['十日凌空','筐里剩下的太阳也升了空。十日并出，河床见底，山林焦枯。',3900],
 ['四方来客 · 结伴','企鹅、北极熊、快化完的雪人和镇民结伴上山，去找后羿。',4300],
 ['山中相请','大家在山巅找到了后羿，一齐请他出山。',4500],
 ['后羿出山','后羿取下长弓，向十轮烈日走去。',4000]
];
const scenery=new Map();
function plateBg(g,id){if(!scenery.has(id))scenery.set(id,landscape(document.createElement('canvas'),id));g.drawImage(scenery.get(id),0,0,1600,900)}
function ell(g,x,y,a,b,c,stroke=null){g.beginPath();g.ellipse(x,y,a,b,0,0,Math.PI*2);g.fillStyle=c;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=3;g.stroke()}}
function inkText(g,text,x,y,size,color='#ede4cf'){g.save();g.textAlign='center';g.textBaseline='middle';g.font='bold '+size+'px STKaiti,KaiTi,serif';g.fillStyle=color;g.fillText(text,x,y);g.restore()}
function bubble(g,text,x,y,tx,ty,w,loud=false){
  const h=loud?116:92;g.save();g.translate(x,y);let p=new Path2D();
  if(loud){for(let i=0;i<28;i++){let a=i*Math.PI/14,v=i%2?.84:1+(i%5)*.025,xx=Math.cos(a)*w*.5*v,yy=Math.sin(a)*h*.5*v;i?p.lineTo(xx,yy):p.moveTo(xx,yy)}p.closePath()}
  else p.roundRect(-w/2,-h/2,w,h,26);
  const dx=Math.max(-w*.32,Math.min(w*.32,tx-x));g.lineJoin='round';path(g,'M'+(dx-23)+' '+(h*.26)+' L'+(tx-x)+' '+(ty-y)+' L'+(dx+24)+' '+(h*.27)+'Z','#eee3c6','#383b32',4);
  g.fillStyle='#f4e8c9';g.strokeStyle='#383b32';g.lineWidth=4;g.fill(p);g.stroke(p);inkText(g,text,0,2,loud?52:37,loud?'#8c3f2a':'#33392f');g.restore()
}
function actor(g,id,x,y,s){g.save();g.translate(x,y);g.scale(s,s);vignetteAnimal(g,id,0,0);g.restore()}
function ice(g,x,y,w){let d='M'+(x-w)+' '+y+' l'+(w*.3)+' -14 '+(w*.57)+' -8 '+w+' 5 '+(w*.22)+' 17 -'+(w*.29)+' 16 -'+w+' 15 -'+(w*.69)+' -11z';path(g,d,'#bdcec6','#65796f',3);path(g,'M'+(x-w*.84)+' '+(y+5)+'l'+(w*.6)+' 10 '+(w*.42)+' -5',null,'#e1e3c9',2)}
function snowProp(g,x,y,s,melt){g.save();g.translate(x,y);g.scale(s,s);if(!melt)actor(g,2,0,0,1.8);else{
 ell(g,0,20,99,17,'#91b8ae','#58766a');ell(g,-4,12,54,15,'#d7ddc8');ell(g,-4,-6,28,16,'#dbe0cb');path(g,'M-24 -5l-19 7 18 -1Z','#ae784b');circ(g,-17,-9,2.8,'#3c463a');path(g,'M-24 -19l33 -6 -3 -13 -21 0 -1 13z','#404a40');for(let i=0;i<3;i++)circ(g,17+13*i,16+i%2*3,3,'#435047');line(g,31,9,74,-2,'#605c47',4);line(g,53,3,62,-14,'#605c47',3)}g.restore()}
function bough(g){path(g,'M1350 660Q1308 508 1335 354L1366 244 1354 346Q1410 304 1454 256L1428 302 1368 370 1354 441Q1402 409 1467 410L1411 428 1362 472 1393 648Z','#4d5549','#393e35',3);
 path(g,'M1341 420Q1288 369 1220 357L1149 325 1099 330 1122 323 1090 301 1159 316 1232 340Q1308 348 1357 395Z','#586050','#3c443a',3)}
function houses(g,open){for(let i=0;i<5;i++){let x=190+i*267,y=513+(i%2)*44;
 path(g,'M'+x+' '+y+'h212v132H'+x+'Z','#555f51','#373f36',3);path(g,'M'+(x-22)+' '+y+'q49 -10 99 -54l52 -10q48 40 104 59l-11 9 -222 9Z','#424b40','#333a31',4);
 for(let j=0;j<3;j++){let xx=x+20+j*65;g.fillStyle=open?'#e3b86f':'#6e7663';g.fillRect(xx,y+27,42,53);line(g,xx+20,y+27,xx+20,y+80,'#4b4e3f',3);if(open){circ(g,xx+19,y+53,9,'#5b5342');ell(g,xx+19,y+74,10,14,'#514d3f')}}}}
function basket(g,x,y,s=1){g.save();g.translate(x,y);g.scale(s,s);path(g,'M-77 -4Q0 -50 77 -4L56 64Q0 85 -56 62Z','#9d7950','#514b36',4);for(let k=0;k<8;k++)line(g,-63+k*18,1,-49+k*14,63,'#6b583d',2);for(let k=1;k<5;k++)path(g,'M'+(-69+2*k)+' '+(k*12)+'Q0 '+(k*12+20)+' '+(69-2*k)+' '+(k*12),null,'#d2ac70',2);for(let [a,b,r] of [[-38,-10,20],[33,-15,22],[0,-37,20],[1,-10,22]]){circ(g,a,b,r,'#efbb71','#9a774e',2);circ(g,a,b,r-5,null,'#f8d597',1)}g.restore()}
function pilgrims(g,x,y,s){g.save();g.translate(x,y);g.scale(s,s);actor(g,3,0,0,2);actor(g,1,164,-4,2.4);actor(g,0,317,-5,1.7);
 path(g,'M364 44 q60 15 130 -1',null,'#735d40',6);snowProp(g,430,-8,.66,true);path(g,'M367 -3q65 30 128 0l-17 37q-48 13 -93 -1Z','#8c7451','#514d3a',3);line(g,323,1,373,23,'#6d5d47',2);g.restore()}
function drawPrologue(k){const g=artist($('#art')),id=k<3?[3,0,0][k]:k<=10?1+Math.floor((k-3)/2):0;plateBg(g,id);
 if(k===0){line(g,671,82,671,676,'#65553c',7);path(g,'M672 94Q810 41 925 90Q1016 124 1092 75L1076 213Q958 250 881 207Q792 162 672 219Z','#a13f2e');kid(g,975,509,1.5);return}
 if(k===1){path(g,'M0 640Q390 460 661 624T1600 610L1600 700Q955 732 639 657T0 720Z','#8caa9a');kid(g,803,449,.93);ell(g,953,551,72,21,'#5b5844');comicSun(g,953,535,29);line(g,894,447,974,571,'#554d3a',6);return}
 if(k===2){kid(g,811,435,1.05);basket(g,1050,487,1.64);return}
 if(k<=10){let act=k%2===1,idx=id-1;
   if(id<3){path(g,'M0 536Q373 490 785 539T1600 489V760H0Z',id===1?'#96b1a7':'#648681');ice(g,480,583,310);ice(g,1085,552,act?273:157);ice(g,1385,641,126);if(id===2){path(g,'M313 554q100 46 235 -1l-55 54 -119 2Z','#795e42','#464737',4);line(g,493,509,599,601,'#675b42',6)}}
   if(id===3)bough(g);if(id===4){houses(g,!act);path(g,'M1110 506V271h170m-157 25 34 -25',null,'#515747',10)}
   if(act){const xx=id<=2?706:908,yy=id<=2?435:363;kid(g,xx,yy,id<=2?.67:.83);
     if(id<=2){let sx=xx+93,sy=yy+74;ell(g,sx,sy+16,55,12,'#586e61');comicSun(g,sx,sy,28);line(g,xx+65,yy+10,sx+28,sy+26,'#6a5941',5);actor(g,idx,1100,509,id===1?1.5:1.85)}
     else{let sx=id===3?1123:1249,sy=id===3?361:328;line(g,sx,sy-59,sx,sy,'#826f50',3);comicSun(g,sx,sy,41);line(g,xx+79,yy+9,sx-36,sy+4,'#9a7b50',2);if(id===3)snowProp(g,639,535,1.24,false);else actor(g,3,671,556,1.48)}
     basket(g,xx-114,yy+116,.57);
   }else{comicSun(g,id===3?1131:1264,265,id===4?100:86);if(id===1){actor(g,0,782,513,3.4);actor(g,0,614,545,1.6);path(g,'M846 565l26 -9 3 9 40 -17 40 -4',null,'#556f63',4)}
     if(id===2){actor(g,1,900,521,3.3);ice(g,621,598,63)}
     if(id===3)snowProp(g,849,545,1.96,true);if(id===4)actor(g,3,852,552,2.54);
     bubble(g,id===3?'我都快化了！':'滚！！！',id===3?664:660,310,id===3?803:774,id===1?408:472,id===3?420:280,true);
   }return}
 if(k===11){for(let i=0;i<10;i++)comicSun(g,130+i*148,190+Math.sin(i*1.62)*72,33+i%3*5);bird(g,915,398,.59);return}
 if(k===12){path(g,'M0 710Q525 515 907 549T1600 356L1600 405Q1190 602 896 590T0 775Z','#aa9875');pilgrims(g,433,538,1.32);bubble(g,'走，去找后羿！',640,337,493,459,362);return}
 if(k===13){pilgrims(g,369,557,1.16);sentinel(g,1149,566,1.9);bubble(g,'请您出山，救救大家！',745,307,502,465,523);return}
 comicSun(g,1129,278,112);sentinel(g,875,638,2.5);[...'后羿射日'].forEach((s,i)=>inkText(g,s,1172,196+i*81,72))
}
let solarStamp;
function comicSun(g,x,y,r){if(!solarStamp){solarStamp=document.createElement('canvas');solarStamp.width=solarStamp.height=424;sunart(artist(solarStamp),212,212,106)}g.drawImage(solarStamp,x-2*r,y-2*r,r*4,r*4)}
