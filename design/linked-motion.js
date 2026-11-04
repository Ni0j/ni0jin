/* One physical field: cursor swarm, click waves, letter recovery and image horizon. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');
  const canvas=document.createElement('canvas');canvas.id='fieldCursor';canvas.setAttribute('aria-hidden','true');
  document.body.append(canvas);const ctx=canvas.getContext('2d');
  let enabled=fine.matches&&!reduced.matches,userEnabled=true,active=false,native=false,px=0,py=0,previousX=0,previousY=0;
  let raf=0,last=0,now=0,lastMove=0,geometryDirty=true,lastGeometry=0,glyphs=[],waves=[],speed=0,trailX=0,trailY=0,constellationReady=false;
  const particles=Array.from({length:11},(_,i)=>({x:0,y:0,vx:0,vy:0,a:i*Math.PI*2/11,r:9+(i*7%13)}));
  function newConstellation(){
    const rotation=Math.random()*Math.PI*2,spread=.7+Math.random()*.5;
    particles.forEach((p,i)=>{p.a=rotation+(i+Math.random()*.65)*Math.PI*2/particles.length;p.r=(7+Math.random()*16)*spread;});
  }
  let ink='34,35,31';
  function updateInk(){const hex=(getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()||'#22231f').replace('#','');ink=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)).join(',');wake();}
  window.addEventListener('portfolio:theme',updateInk);updateInk();
  function resize(){const d=Math.min(2,devicePixelRatio||1);canvas.width=innerWidth*d;canvas.height=innerHeight*d;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(d,0,0,d,0,0);geometryDirty=true;}
  function topSurface(){const top=document.querySelector('#bookingDialog[open]')||document.querySelector('#lightbox[open]')||document.querySelector('#projectDialog[open]')||document.body;if(canvas.parentNode!==top)top.append(canvas);geometryDirty=true;}
  function reset(){const wasEnabled=enabled;enabled=fine.matches&&!reduced.matches&&userEnabled;document.body.classList.toggle('field-cursor',enabled&&active&&!native);canvas.hidden=!enabled;if(!enabled&&wasEnabled){ctx.clearRect(0,0,innerWidth,innerHeight);waves=[];document.querySelectorAll('.field-letter').forEach(el=>{el.style.transform='';const g=el._letterState;if(g)g.x=g.y=g.vx=g.vy=0;});}else if(enabled)wake();}
  function sample(x,y,t=performance.now()){
    if(!enabled)return {x:0,y:0,kick:0};let dx=0,dy=0,kick=0;
    for(const wave of waves){const age=(t-wave.time)/1000;if(age<0||age>1.25)continue;const ax=x-wave.x,ay=y-wave.y,d=Math.hypot(ax,ay)||1;
      const band=(d-age*520)/30,amplitude=Math.exp(-band*band)*Math.max(0,1-age/1.25)*3;
      dx+=ax/d*amplitude;dy+=ay/d*amplitude;kick+=amplitude;
    }return {x:dx,y:dy,kick};
  }
  window.motionField={sample,get enabled(){return enabled;},get pointer(){return enabled&&active&&!native?{x:px,y:py}:null;}};
  const selector='h1,h2,button:not(.orbit-art),a,#nowContent h3,#nowContent p,#studyLabel,#studyContext,#projectMediaLabel,#selectedMeta,#selectedDescription,.idle-top span,.idle-bottom span,.dialog-top>span,.entry-motion>p.muted,#mediaCount,.project-context,summary,footer p';
  function decorate(){
    for(const root of document.querySelectorAll(selector)){
      if(root.closest('[data-letter-run],.orbit-art,#bookingDialog'))continue;
      const individual=root.matches('button,a,h1,h2,h3');
      if(individual&&(!root.hasAttribute('aria-label')||root.dataset.letterAutoLabel)){root.setAttribute('aria-label',root.textContent);root.dataset.letterAutoLabel='true';}
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),texts=[];
      while(walker.nextNode()){const node=walker.currentNode;if(node.textContent.trim()&&!node.parentElement.closest('[data-letter-run],script,style,canvas,video'))texts.push(node);}
      for(const node of texts){
        const run=document.createElement('span');run.dataset.letterRun='';
        for(const word of node.textContent.split(/(\s+)/u)){
          if(!word)continue;if(/^\s+$/u.test(word)){run.append(document.createTextNode(word));continue;}
          const group=document.createElement('span');group.className='letter-word';
          if(individual){for(const char of Array.from(word)){const span=document.createElement('span');span.className='field-letter';span.textContent=char;span.setAttribute('aria-hidden','true');group.append(span);}}else{group.classList.add('field-letter');group.textContent=word;}
          run.append(group);
        }node.replaceWith(run);
      }
    }geometryDirty=true;
  }
  function measure(){
    const top=canvas.parentElement;
    glyphs=[...document.querySelectorAll('.field-letter')].map(el=>{const old=el._letterState||{el,x:0,y:0,vx:0,vy:0,angle:0};el._letterState=old;
      const r=el.getBoundingClientRect();old.cx=r.left+r.width/2-old.x;old.cy=r.top+r.height/2-old.y;
      old.visible=!el.closest('[inert]')&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&(top===document.body?!el.closest('dialog'):top.contains(el));return old;
    }).filter(g=>g.visible);
    geometryDirty=false;lastGeometry=now;
  }
  let queued=false;
  new MutationObserver(records=>{
    if(records.every(r=>r.type==='childList'&&r.target.closest?.('[data-letter-run],#fieldCursor')))return;
    if(!queued){queued=true;queueMicrotask(()=>{queued=false;decorate();topSurface();wake();});}
  }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open','hidden']});
  function tick(t){raf=0;now=t;if(document.hidden||!enabled)return;
    const dt=Math.min(.032,(t-last)/1000||.016);last=t;
    waves=waves.filter(w=>t-w.time<1250);
    if(geometryDirty||(active&&t-lastGeometry>240))measure();
    ctx.clearRect(0,0,innerWidth,innerHeight);
    if(active&&!native){
      const still=Math.min(1,Math.max(0,(t-lastMove-480)/800));speed*=.88;trailX*=.91;trailY*=.91;
      if(still>0&&!constellationReady){newConstellation();constellationReady=true;}
      for(const p of particles){
        const i=particles.indexOf(p),radius=8+(i%4)*2.5;
        const sx=px-trailX*(.4+i/15)+Math.sin(t*.003+i*2.4)*radius,sy=py-trailY*(.4+i/15)+Math.cos(t*.0037+i*1.8)*radius*.8;
        const cx=px+Math.cos(p.a+t*.00007)*p.r,cy=py+Math.sin(p.a+t*.00007)*p.r*.8;
        const tx=sx*(1-still)+cx*still,ty=sy*(1-still)+cy*still;
        const force=sample(p.x,p.y,t);p.vx+=((tx-p.x)*85-p.vx*17+force.x*70)*dt;p.vy+=((ty-p.y)*85-p.vy*17+force.y*70)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
        ctx.fillStyle=`rgba(${ink},${.32+still*.22})`;ctx.beginPath();ctx.arc(p.x,p.y,.95,0,Math.PI*2);ctx.fill();
      }
      if(still>.22){ctx.lineWidth=.5;ctx.strokeStyle=`rgba(${ink},${still*.22})`;for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){const a=particles[i],b=particles[j];if(Math.hypot(a.x-b.x,a.y-b.y)<14.5){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}}
      ctx.fillStyle=`rgb(${ink})`;ctx.beginPath();ctx.arc(px,py,2.1,0,Math.PI*2);ctx.fill();
    }
    for(const wave of waves){const age=Math.max(0,(t-wave.time)/1000);ctx.lineWidth=.6;ctx.strokeStyle=`rgba(${ink},${Math.max(0,1-age/1.25)*.2})`;ctx.beginPath();ctx.arc(wave.x,wave.y,age*520,0,Math.PI*2);ctx.stroke();}
    let unsettled=false;
    for(const g of glyphs){
      const distance=Math.hypot(g.cx-px,g.cy-py),proximity=active&&!native?Math.max(0,1-distance/75):0,force=sample(g.cx,g.cy,t);
      const tx=(g.cx-px)/75*proximity*1.1+force.x,ty=-proximity*2.2+force.y;
      g.vx+=((tx-g.x)*155-g.vx*20)*dt;g.vy+=((ty-g.y)*155-g.vy*20)*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;
      const rotate=((g.cx-px)/75*proximity*3+force.x*.9);
      if(Math.abs(g.x)+Math.abs(g.y)+Math.abs(g.vx)+Math.abs(g.vy)>.015||Math.abs(rotate)>.01){g.el.style.transform=`translate(${g.x.toFixed(3)}px,${g.y.toFixed(3)}px) rotate(${rotate.toFixed(2)}deg)`;unsettled=true;}
      else if(g.el.style.transform){g.el.style.transform='';g.x=g.y=g.vx=g.vy=0;}
    }
    if((active&&!native)||waves.length||unsettled)raf=requestAnimationFrame(tick);
  }
  function wake(){if(enabled&&!document.hidden&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}}
  document.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;const first=!active;active=true;previousX=px;previousY=py;px=e.clientX;py=e.clientY;speed=Math.hypot(px-previousX,py-previousY);if(speed>.01){lastMove=performance.now();constellationReady=false;trailX=Math.max(-18,Math.min(18,(px-previousX)*.6));trailY=Math.max(-18,Math.min(18,(py-previousY)*.6));}
    native=!!e.target.closest('video[controls],input,textarea,select,iframe');if(first)particles.forEach(p=>{p.x=px;p.y=py;});reset();wake();
  },{passive:true});
  document.addEventListener('pointerdown',e=>{if(!enabled||e.pointerType!=='mouse'||e.button!==0||e.target.closest('video[controls],input,textarea,select,iframe'))return;waves.push({x:e.clientX,y:e.clientY,time:performance.now()});geometryDirty=true;wake();},{passive:true,capture:true});
  document.addEventListener('pointerout',e=>{if(e.relatedTarget===null){active=false;document.body.classList.remove('field-cursor');wake();}});
  document.addEventListener('scroll',()=>{geometryDirty=true;wake();},true);
  document.addEventListener('keydown',e=>{if(e.key==='Tab'){active=false;document.body.classList.remove('field-cursor');wake();}});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;if(!document.hidden){geometryDirty=true;wake();}});
  window.addEventListener('resize',()=>{resize();wake();});reduced.addEventListener('change',reset);fine.addEventListener('change',reset);
  resize();decorate();reset();
})();
