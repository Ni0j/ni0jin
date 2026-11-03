/* Real project/media nodes form a small, navigable rendering network. */
(() => {
  const colors=['#91b678','#bd94cf','#d9b66d','#80b8c2','#d48e88','#8fa5da','#b3bf78','#cf9e7b','#86b9a1'];
  window.projectNodeColor=id=>colors[window.PROJECTS.filter(p=>p.featured!==false).findIndex(p=>p.id===id)]||colors[0];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function letterPoints(count){
    const points=[],n=Math.round(count*.42),i=Math.round(count*.16),o=count-n-i;
    const stem=Math.round(n*.30),arch=Math.round(n*.40),right=n-stem-arch;
    for(let j=0;j<stem;j++)points.push({x:.10,y:.31+j/(stem-1)*.53,letter:'n'});
    for(let j=0;j<arch;j++){const t=(j+1)/(arch+1);points.push({x:.10+t*.29,y:.56-Math.sin(t*Math.PI)*.26,letter:'n'});}
    for(let j=0;j<right;j++)points.push({x:.39,y:.56+j/Math.max(1,right-1)*.28,letter:'n'});
    for(let j=0;j<3;j++)points.push({x:.51+(j-1)*.027,y:.18+(j===1?-.035:0),letter:'i'});
    for(let j=0;j<i-3;j++)points.push({x:.51,y:.40+j/Math.max(1,i-4)*.44,letter:'i'});
    for(let j=0;j<o;j++){const a=-Math.PI/2+j/o*Math.PI*2;points.push({x:.79+Math.cos(a)*.175,y:.57+Math.sin(a)*.275,letter:'o'});}
    return points;
  }
  window.createNodeNetwork=function({stage,label,onActivate}){
    document.body.classList.add('node-home');stage.classList.add('network-stage');
    stage.setAttribute('aria-label','nio project network. Scroll up to zoom in, down to zoom out; drag to pan. Select a node to open its work.');
    const canvas=document.createElement('canvas');canvas.className='network-wires';canvas.setAttribute('aria-hidden','true');
    const ctx=canvas.getContext('2d');
    const live=document.createElement('video');live.className='node-live';live.muted=true;live.playsInline=true;live.loop=true;live.preload='none';live.setAttribute('aria-hidden','true');
    function stopPreview(){live.pause();live.remove();}
    function preview(node){if(node.entry.type!=='video'||reduced.matches)return;live.poster=node.entry.preview;const src=encodeURI(node.entry.src);if(live.getAttribute('src')!==src)live.src=src;node.el.append(live);live.play().catch(()=>{});}
    const controls=document.createElement('div');controls.className='network-tools';
    function control(text,action){const b=document.createElement('button');b.textContent=text;b.type='button';b.addEventListener('click',action);controls.append(b);return b;}
    control('reset size',()=>{zoomTarget=1;zoomAnchor=null;pan.x=pan.y=0;bendV+=.3;wake();});
    stage.after(controls);
    let nodes=[],works=[],selected=null,hovered=null,running=false,suspended=false,visible=true,raf=0,last=0,time=0;
    let zoom=1,zoomTarget=1,zoomAnchor=null,bend=0,bendV=0,mouse={x:0,y:0},pan={x:0,y:0},size='',drag=null,dragged=false,pinch=null;
    const pointers=new Map();
    const all=window.PROJECTS.filter(p=>p.featured!==false),allEntries=[];
    all.forEach((p,group)=>{
      allEntries.push({project:p.id,label:p.title,src:p.cover,context:p.scope||p.meta,parent:true,group,preview:window.NODE_PREVIEWS[p.id+':cover'],key:p.id+':cover',media:-1});
      p.media.forEach((m,i)=>allEntries.push({...m,project:p.id,context:p.scope||p.meta,parent:false,group,preview:window.NODE_PREVIEWS[p.id+':'+i],key:p.id+':'+i,media:i}));
    });
    const points=letterPoints(allEntries.length);
    allEntries.forEach((e,i)=>{e.point=points[i];e.seed=(Math.sin(i*127.1)*43758.5453)%1;});
    function choose(entry){
      selected=entry;label.textContent=entry.parent?entry.label:all.find(p=>p.id===entry.project).title;
      nodes.forEach(n=>n.el.setAttribute('aria-current',String(n.entry.key===entry.key)));
      const context=document.getElementById('studyContext');if(context)context.textContent=entry.parent?entry.context:entry.label+' · '+(entry.type==='video'?'video':'image');
      const count=document.getElementById('studyCount');if(count)count.textContent=works.length+' works / '+nodes.filter(n=>!n.entry.parent).length+' assets';
    }
    function build(entries){
      const ids=new Set(entries.map(e=>e.project));stage.replaceChildren(canvas);
      nodes=allEntries.filter(e=>ids.has(e.project)).map(entry=>{
        const el=document.createElement('button');el.className='orbit-art network-node is-positioned';el.type='button';el.style.setProperty('--node-color',colors[entry.group]);el.dataset.nodeProject=entry.project;
        el.classList.toggle('is-project-node',entry.parent);el.setAttribute('aria-label',(entry.parent?'Open project: ':'Open asset: ')+all[entry.group].title+' — '+entry.label);
        const header=document.createElement('span');header.className='node-header';header.textContent=entry.parent?all[entry.group].title:String(entry.media+1).padStart(2,'0')+' / '+(entry.type==='video'?'video':'image');
        const img=document.createElement('img');img.src=entry.preview;img.alt='';img.draggable=false;img.decoding='async';img.addEventListener('error',()=>{el.classList.add('preview-error');header.textContent='Preview unavailable';});
        const input=document.createElement('span');input.className='node-port node-input';const output=document.createElement('span');output.className='node-port node-output';
        el.append(header,img,input,output);stage.append(el);
        const node={entry,el,x:(entry.point.x-.5)*260,y:(entry.point.y-.5)*150,vx:0,vy:0,drawX:0,drawY:0,drawW:0,drawH:0};
        el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=entry;choose(entry);preview(node);wake();}});
        el.addEventListener('pointerleave',()=>{hovered=null;stopPreview();wake();});
        el.addEventListener('focus',()=>{hovered=entry;choose(entry);preview(node);wake();});
        el.addEventListener('blur',()=>{hovered=null;stopPreview();wake();});
        el.addEventListener('click',event=>{if(dragged&&event.detail!==0)return;choose(entry);onActivate?.(entry,img.getBoundingClientRect());});
        return node;
      });
      works=all.filter(p=>ids.has(p.id));
    }
    function draw(dt){
      const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
      const dpr=Math.min(2,devicePixelRatio||1),key=w+':'+h+':'+dpr;
      if(size!==key){size=key;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
      ctx.clearRect(0,0,w,h);
      const fit=Math.min((w-32)/1200,(h-130)/640),scale=fit*zoom,rect=stage.getBoundingClientRect();
      const yaw=reduced.matches?0:mouse.x*.11+bend*.30,pitch=reduced.matches?0:mouse.y*.08;
      const focus=hovered?.project;
      for(const node of nodes){
        const {entry}=node,p=entry.point;
        const z=reduced.matches?0:Math.sin(p.x*7+time*.3)*9+Math.sin(p.y*5)*bend*150;
        let tx=(p.x-.5)*1200*Math.cos(yaw)+z*Math.sin(yaw)+Math.sin(p.y*7)*bend*38;
        let ty=(p.y-.5)*640*Math.cos(pitch)-z*Math.sin(pitch)+Math.cos(p.x*8)*bend*16;
        const wave=window.motionField?.sample(rect.left+w/2+node.x*scale+pan.x,rect.top+h/2+node.y*scale+pan.y);
        if(wave){tx+=wave.x*2;ty+=wave.y*2;}
        if(reduced.matches){node.x=tx;node.y=ty;node.vx=node.vy=0;}
        else{const spring=68+Math.abs(entry.seed)*24;node.vx+=((tx-node.x)*spring-node.vx*15)*dt;node.vy+=((ty-node.y)*spring-node.vy*15)*dt;node.x+=node.vx*dt;node.y+=node.vy*dt;}
        const emphasis=hovered?.key===entry.key?1.40:1;
        const nw=(entry.parent?84:66)*scale*emphasis,nh=(entry.parent?66:52)*scale*emphasis;
        node.drawX=w/2+node.x*scale+pan.x;node.drawY=h/2+node.y*scale+pan.y;node.drawW=nw;node.drawH=nh;
        node.el.style.width=(entry.parent?84:66)+'px';node.el.style.height=(entry.parent?66:52)+'px';
        node.el.style.transform=`translate3d(${node.drawX}px,${node.drawY}px,0) translate(-50%,-50%) scale(${scale*emphasis}) rotate(${reduced.matches?0:clamp(node.vx*.006,-6,6)}deg)`;
        node.el.style.opacity=focus&&focus!==entry.project?'.30':'1';node.el.style.zIndex=hovered?.key===entry.key?'100':String(entry.parent?30:10);
      }
      for(const node of nodes){
        if(node.entry.parent)continue;
        const parent=nodes.find(n=>n.entry.parent&&n.entry.project===node.entry.project);if(!parent)continue;
        const hot=focus===node.entry.project;
        ctx.globalAlpha=focus?(hot?.85:.12):(document.documentElement.dataset.theme==='dark'?.42:.72);ctx.strokeStyle=colors[node.entry.group];ctx.lineWidth=hot?1:.8;
        const ax=parent.drawX+parent.drawW/2,ay=parent.drawY,bx=node.drawX-node.drawW/2,by=node.drawY;
        const reach=Math.max(24*scale,Math.abs(bx-ax)*.40);
        ctx.beginPath();ctx.moveTo(ax,ay);ctx.bezierCurveTo(ax+reach,ay,bx-reach,by,bx,by);ctx.stroke();
        if(!reduced.matches){const t=(time*.14+Math.abs(node.entry.seed))%1,u=1-t;
          const x=u*u*u*ax+3*u*u*t*(ax+reach)+3*u*t*t*(bx-reach)+t*t*t*bx,y=u*u*u*ay+3*u*u*t*ay+3*u*t*t*by+t*t*t*by;
          ctx.fillStyle=colors[node.entry.group];ctx.beginPath();ctx.arc(x,y,Math.max(.7,scale*.9),0,Math.PI*2);ctx.fill();}
      }
      ctx.globalAlpha=1;
    }
    function tick(t){raf=0;if(!running||suspended||!visible||document.hidden)return;
      const dt=Math.min(.028,(t-last)/1000||.016);last=t;time+=dt;
      const previousZoom=zoom;
      if(reduced.matches){zoom=zoomTarget;bend=bendV=0;}else{zoom+=(zoomTarget-zoom)*Math.min(1,dt*8);bendV+=(-bend*22-bendV*7)*dt;bend+=bendV*dt;}
      if(zoomAnchor){const ratio=zoom/previousZoom;pan.x=zoomAnchor.x-(zoomAnchor.x-pan.x)*ratio;pan.y=zoomAnchor.y-(zoomAnchor.y-pan.y)*ratio;}
      draw(dt);
      if(!reduced.matches||Math.abs(zoomTarget-zoom)>.001)raf=requestAnimationFrame(tick);
    }
    function wake(){if(running&&!suspended&&visible&&!document.hidden&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}}
    function move(delta){if(!works.length)return;const i=works.findIndex(p=>p.id===selected?.project),p=works[(i+delta+works.length)%works.length];choose(allEntries.find(e=>e.parent&&e.project===p.id));hovered=null;bendV+=delta*.6;wake();}
    stage.addEventListener('wheel',e=>{if(suspended||!running)return;e.preventDefault();const r=stage.getBoundingClientRect(),delta=(e.deltaY||e.deltaX)*(e.deltaMode===1?16:1);zoomAnchor={x:e.clientX-r.left-r.width/2,y:e.clientY-r.top-r.height/2};zoomTarget=clamp(zoomTarget*Math.exp(-delta*.0022),.55,5);bendV=clamp(bendV+delta*.001,-2,2);wake();},{passive:false});
    stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;zoomAnchor=null;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:zoomTarget};}else{drag={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};dragged=false;}});
    stage.addEventListener('pointermove',e=>{
      const r=stage.getBoundingClientRect();mouse={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5};
      if(pointers.has(e.pointerId)){pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&pinch){const [a,b]=[...pointers.values()];zoomTarget=clamp(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance),.65,4);dragged=true;}
        else if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5){dragged=true;stage.setPointerCapture(e.pointerId);pan.x=drag.px+dx;pan.y=drag.py+dy;bendV=clamp(bendV+e.movementX*.003,-3,3);}}}wake();
    });
    function release(e){pointers.delete(e.pointerId);if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);drag=null;pinch=null;}
    stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',()=>{drag=null;pinch=null;pointers.clear();});
    stage.addEventListener('pointerleave',()=>{mouse={x:0,y:0};if(!pointers.size)hovered=null;wake();});
    stage.addEventListener('keydown',e=>{if(e.target!==stage)return;if(e.key.startsWith('Arrow')){e.preventDefault();move(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1);}if(e.key==='Enter'&&selected){e.preventDefault();onActivate?.(selected);}if(e.key==='0'){zoomTarget=1;zoomAnchor=null;pan.x=pan.y=0;wake();}});
    new ResizeObserver(()=>{draw(.016);wake();}).observe(stage);
    new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;stopPreview();}}).observe(stage);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;stopPreview();}else wake();});
    reduced.addEventListener('change',()=>{stopPreview();draw(.016);wake();});
    return {
      start(entries,index=0){const ids=entries.map(e=>e.project).join('|');if(stage.dataset.groups!==ids){build(entries);stage.dataset.groups=ids;}const e=allEntries.find(e=>e.parent&&e.project===entries[index]?.project);if(e)choose(e);running=true;suspended=false;hovered=null;draw(.016);wake();},
      current(){return selected;},move,activate(){if(selected)onActivate?.(selected);},automatic:false,setAuto(){},
      suspend(value){suspended=value;if(value){cancelAnimationFrame(raf);raf=0;stopPreview();}else wake();},
      setIndexMode(value){this.suspend(value);stage.inert=value;},
      stop(){running=false;cancelAnimationFrame(raf);raf=0;stopPreview();}
    };
  };
})();
